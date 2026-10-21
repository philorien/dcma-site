import { describe, it, expect } from 'vitest'
import { cardLink } from '../app/utils/cardLink'

describe('cardLink', () => {
  it.each([
    { href: '/projects/full-hearts-fridge', expected: { href: '/projects/full-hearts-fridge', internal: true } },
    { href: '  /updates ', expected: { href: '/updates', internal: true } },
    { href: 'https://partner.example/', expected: { href: 'https://partner.example/', internal: false } },
    { href: 'mailto:a@b.co?subject=Hi', expected: { href: 'mailto:a@b.co?subject=Hi', internal: false } },
  ])('links $href', ({ href, expected }) => {
    expect(cardLink({ cta: { label: 'GO', href } })).toEqual({ label: 'GO', ...expected })
  })

  it.each([
    { case: 'protocol-relative URL', cta: { label: 'GO', href: '//evil.example/page' } },
    { case: 'bare domain', cta: { label: 'GO', href: 'partnerorg.com' } },
    { case: 'hash anchor', cta: { label: 'GO', href: '#top' } },
    { case: 'empty label', cta: { label: ' ', href: '/updates' } },
    { case: 'empty href', cta: { label: 'GO', href: '' } },
    { case: 'no cta', cta: undefined },
  ])('returns null for $case', ({ cta }) => {
    expect(cardLink({ cta })).toBeNull()
  })
})
