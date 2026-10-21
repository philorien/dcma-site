import { describe, it, expect } from 'vitest'
import { isInternalHref, linkTarget } from '../app/utils/linkTarget'

describe('linkTarget', () => {
  it('opens http(s) and mailto links in a new tab', () => {
    expect(linkTarget('https://facebook.com/x')).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    })
    expect(linkTarget('mailto:a@b.co')).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })

  it('leaves hash and relative links alone', () => {
    expect(linkTarget('#find-fridge')).toEqual({})
    expect(linkTarget('/about')).toEqual({})
    expect(linkTarget(undefined)).toEqual({})
  })
})

describe('isInternalHref', () => {
  it('accepts root-relative paths only', () => {
    expect(isInternalHref('/projects/full-hearts-fridge')).toBe(true)
    expect(isInternalHref('/')).toBe(true)
  })

  it('rejects other sites, protocol-relative URLs, email and empty values', () => {
    expect(isInternalHref('https://example.com/')).toBe(false)
    expect(isInternalHref('//example.com/page')).toBe(false)
    expect(isInternalHref('mailto:a@b.co')).toBe(false)
    expect(isInternalHref('#find-fridge')).toBe(false)
    expect(isInternalHref('')).toBe(false)
    expect(isInternalHref(undefined)).toBe(false)
  })
})
