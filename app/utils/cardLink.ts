import type { Card } from '~/types/content'
import { isExternalUrl, isInternalHref } from './linkTarget'

export interface CardLink {
  label: string
  href: string
  /** Site page, rendered with NuxtLink. Otherwise a plain <a> that opens in a new tab. */
  internal: boolean
}

/**
 * The link a card shows, or null. Any card with a label and a link we can open
 * gets one: a site page, a website, or an email address. Hrefs are trimmed so a
 * pasted leading space doesn't drop the link.
 */
export function cardLink(card: Pick<Card, 'cta'>): CardLink | null {
  const label = card.cta?.label?.trim()
  const href = card.cta?.href?.trim()
  if (!label || !href) return null
  if (isInternalHref(href)) return { label, href, internal: true }
  if (isExternalUrl(href) || href.startsWith('mailto:')) return { label, href, internal: false }
  return null
}
