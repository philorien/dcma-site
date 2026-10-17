import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// WCAG 2.2 SC 1.4.3: button labels are 13-14px uppercase at weight 600,
// which counts as normal text, so they need 4.5:1.
const MIN_TEXT_CONTRAST = 4.5

const css = readFileSync(resolve(__dirname, '../app/assets/css/main.css'), 'utf8')

function declarationsIn(body: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].replace(/\/\*.*?\*\//g, '').trim()
  }
  return out
}

function blockBody(startMarker: string): string {
  const start = css.indexOf(startMarker)
  if (start === -1) throw new Error(`missing block: ${startMarker}`)
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  return css.slice(open + 1, close)
}

// Resolve a token, following var(--x) references within the block and then :root.
function resolveToken(name: string, block: Record<string, string>, root: Record<string, string>): string {
  const raw = block[name] ?? root[name]
  if (raw === undefined) throw new Error(`token ${name} not defined`)
  const ref = raw.match(/^var\((--[\w-]+)\)$/)
  return ref ? resolveToken(ref[1], block, root) : raw
}

function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const root = declarationsIn(blockBody(':root {'))
const systemDark = declarationsIn(blockBody(':root:not([data-theme="light"])'))
const toggleDark = declarationsIn(blockBody(':root[data-theme="dark"]'))

describe('dark-mode primary button contrast (issue #78)', () => {
  it.each([
    ['system prefers-color-scheme: dark', systemDark],
    ['theme toggle data-theme="dark"', toggleDark],
  ])('button text on --steel meets 4.5:1 in %s', (_label, block) => {
    const text = resolveToken('--on-block', block, root)
    const fill = resolveToken('--steel', block, root)
    expect(contrast(text, fill)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST)
  })

  it('--on-block is the same in both dark blocks', () => {
    expect(resolveToken('--on-block', systemDark, root)).toBe(resolveToken('--on-block', toggleDark, root))
  })
})
