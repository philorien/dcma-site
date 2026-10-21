/** Open external and mailto links in a new tab. Skips in-page hash anchors. */
export function linkTarget(href?: string | null) {
  if (!href || href.startsWith('#')) return {}
  if (/^https?:\/\//i.test(href) || href.startsWith('mailto:')) {
    return { target: '_blank' as const, rel: 'noopener noreferrer' as const }
  }
  return {}
}

/** Root-relative link to a page on this site. `//host/path` is another site, not a path. */
export function isInternalHref(href?: string | null): href is string {
  return !!href && href.startsWith('/') && !href.startsWith('//')
}
