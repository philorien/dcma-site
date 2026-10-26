import { describe, it, expect } from 'vitest'
import { createContactRateLimiter } from '../server/utils/contactRateLimit'
import { validateContact } from '../server/utils/validateContact'
import { buildContactSubmissionDoc } from '../server/utils/contactSubmission'

const good = { firstName: 'A', lastName: 'B', email: 'a@b.co', subject: 'Hi', message: 'Hello', website: '' }

describe('validateContact', () => {
  it('accepts a complete submission', () => {
    expect(validateContact(good).valid).toBe(true)
  })

  it.each(['firstName', 'lastName', 'email', 'subject', 'message'] as const)(
    'rejects a missing %s field',
    (field) => {
      const r = validateContact({ ...good, [field]: '' })
      expect(r.valid).toBe(false)
      expect(r.errors).toContain(field)
    },
  )

  it('rejects a malformed email', () => {
    const r = validateContact({ ...good, email: 'nope' })
    expect(r.valid).toBe(false)
    expect(r.errors).toContain('email')
  })

  it.each([
    null,
    [],
    { ...good, firstName: 42 },
    { ...good, message: 'x'.repeat(5_001) },
  ])('rejects malformed or oversized submissions', (body) => {
    expect(validateContact(body).valid).toBe(false)
  })

  it('rejects a field that exceeds its maximum length', () => {
    const result = validateContact({ ...good, subject: 'x'.repeat(201) })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('subject')
  })
})

describe('contact rate limiter', () => {
  it('allows five submissions per IP per window and then returns the retry delay', () => {
    const consume = createContactRateLimiter()

    for (let i = 0; i < 5; i += 1) {
      expect(consume('192.0.2.1', 1_000).allowed).toBe(true)
    }

    expect(consume('192.0.2.1', 1_000)).toEqual({
      allowed: false,
      retryAfterSeconds: 900,
    })
  })

  it('resets the limit after the window expires and tracks other IPs separately', () => {
    const consume = createContactRateLimiter()

    for (let i = 0; i < 5; i += 1) consume('192.0.2.1', 1_000)

    expect(consume('192.0.2.2', 1_000).allowed).toBe(true)
    expect(consume('192.0.2.1', 901_000).allowed).toBe(true)
  })
})

describe('buildContactSubmissionDoc', () => {
  it('trims fields and sets metadata', () => {
    const doc = buildContactSubmissionDoc({
      firstName: '  Ada ',
      lastName: ' Lovelace ',
      email: ' ada@example.com ',
      subject: ' Help ',
      message: ' Hello ',
    })

    expect(doc).toMatchObject({
      _type: 'contactSubmission',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      subject: 'Help',
      message: 'Hello',
      read: false,
    })
    expect(doc.submittedAt).toBeTruthy()
  })
})
