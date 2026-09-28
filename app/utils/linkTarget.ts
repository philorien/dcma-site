/** Open external and mailto links in a new tab. Skips in-page hash anchors. */
export function linkTarget(href?: string | null) {
  if (!href || href.startsWith('#')) return {}
  if (/^https?:\/\//i.test(href)) {
    return { target: '_blank' as const, rel: 'noopener noreferrer' as const }
  }
  return {}
}
