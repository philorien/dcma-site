/** Absolute http(s) link to another site. */
export function isExternalUrl(href?: string | null): href is string {
  return !!href && /^https?:\/\//i.test(href)
}

/** Open external and mailto links in a new tab. Skips in-page hash anchors. */
export function linkTarget(href?: string | null) {
  if (!href || href.startsWith('#')) return {}
  if (isExternalUrl(href) || href.startsWith('mailto:')) {
    return { target: '_blank' as const, rel: 'noopener noreferrer' as const }
  }
  return {}
}

/** Root-relative link to a page on this site. `//host/path` is another site, not a path. */
export function isInternalHref(href?: string | null): href is string {
  return !!href && href.startsWith('/') && !href.startsWith('//')
}
