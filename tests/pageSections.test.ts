import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PageSections from '../app/components/page/PageSections.vue'
import HomeHero from '../app/components/home/HomeHero.vue'
import PageSplitSection from '../app/components/page/PageSplitSection.vue'
import PageProseSection from '../app/components/page/PageProseSection.vue'
import HomeActivityGrid from '../app/components/home/ActivityGrid.vue'
import FridgeClosingCta from '../app/components/fridge/FridgeClosingCta.vue'
import ContactSection from '../app/components/ContactSection.vue'
import { makeCard, makeSettings } from './fixtures'
import { DEFAULT_CONTACT_FORM } from '../app/utils/contentDefaults'
import type { CardGridSection, PageSection } from '../app/types/content'

// This is the [slug].vue / projects/index.vue rendering path: sections come
// straight from Sanity as untyped `_type`-tagged blobs, and this component's
// v-else-if chain is the only thing standing between a stale/renamed _type
// and a broken generic page. Every branch gets one fixture here so a section
// type losing its match (like homepage's now-removed statsSection did) shows
// up as a missing render instead of a silent gap or a prod crash.
const sections: PageSection[] = [
  {
    _key: 'hero', _type: 'heroSection',
    heading: 'Hero heading', tagline: 'Hero tagline',
    cta: { label: 'Hero CTA', href: '/hero-cta' },
  },
  {
    _key: 'split', _type: 'splitSection',
    eyebrow: 'Split eyebrow', heading: 'Split heading', body: 'Split body',
  },
  {
    _key: 'prose', _type: 'proseSection',
    eyebrow: 'Prose eyebrow', heading: 'Prose heading', body: 'Prose body',
  },
  {
    _key: 'cards-simple', _type: 'cardGridSection', style: 'simple',
    heading: 'How it works heading', intro: 'How it works intro',
    cards: [makeCard({ title: 'Simple card' })],
  },
  {
    _key: 'cards-photos', _type: 'cardGridSection', style: 'photos',
    heading: 'Activities heading',
    cards: [makeCard({ title: 'Photo card' })],
  },
  {
    _key: 'cta', _type: 'ctaSection',
    heading: 'CTA heading', note: 'CTA note', cta: { label: 'CTA button', href: '/cta' },
  },
  {
    _key: 'contact', _type: 'contactSectionBlock',
    heading: 'Contact heading',
  },
]

function mountSections(list: PageSection[]) {
  return mount(PageSections, {
    props: { sections: list, settings: makeSettings(), contactForm: DEFAULT_CONTACT_FORM },
    global: {
      components: {
        HomeHero,
        PageSplitSection,
        PageProseSection,
        HomeActivityGrid,
        FridgeClosingCta,
        ContactSection,
      },
    },
  })
}

describe('PageSections', () => {
  it('renders exactly one component per section, matched by _type', () => {
    const w = mountSections(sections)
    const text = w.text()

    expect(text).toContain('Hero heading')
    expect(text).toContain('Split heading')
    expect(text).toContain('Prose heading')
    expect(text).toContain('How it works heading')
    expect(text).toContain('Activities heading')
    expect(text).toContain('CTA heading')
    expect(text).toContain('Contact heading')
  })

  it('renders nothing for an unrecognized _type instead of throwing', () => {
    const w = mountSections([
      { _key: 'ghost', _type: 'retiredSection' } as unknown as PageSection,
    ])

    expect(w.text()).toBe('')
  })
})

describe('Card grid links and contact button', () => {
  const cards = [
    makeCard({ _key: 'page', cta: { label: 'LEARN MORE', href: '/projects/full-hearts-fridge' } }),
    makeCard({ _key: 'site', cta: { label: 'Visit website', href: 'https://partner.example/' } }),
    makeCard({ _key: 'mail', cta: { label: 'Request support', href: 'mailto:a@b.co?subject=Support' } }),
  ]
  const mountGrid = (showContactButton?: boolean | null) => mount(PageSections, {
    props: {
      sections: [{ _key: 'grid', _type: 'cardGridSection', showContactButton, cards } satisfies CardGridSection],
      settings: makeSettings(),
      contactForm: DEFAULT_CONTACT_FORM,
    },
    global: {
      components: { HomeActivityGrid },
      // Renders `to` as href so tests can assert where card links go.
      stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } },
    },
  })

  it('shows every card link, wherever it goes, on the /projects rendering path', () => {
    const links = mountGrid(true).findAll('.card-link')

    expect(links.map((a) => a.attributes('href'))).toEqual([
      '/projects/full-hearts-fridge',
      'https://partner.example/',
      'mailto:a@b.co?subject=Support',
    ])
  })

  it('opens website and email links in a new tab and says so to screen readers', () => {
    const [page, site, mail] = mountGrid(true).findAll('.card-link')

    expect(page.attributes('target')).toBeUndefined()
    for (const link of [site, mail]) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
      expect(link.find('.sr-only').text()).toBe('(opens in a new tab)')
    }
  })

  // Grids saved before the field existed have no value and keep the button.
  it.each([
    { showContactButton: true, shown: true },
    { showContactButton: undefined, shown: true },
    { showContactButton: null, shown: true },
    { showContactButton: false, shown: false },
  ])('showContactButton $showContactButton → contact button shown: $shown', ({ showContactButton, shown }) => {
    const w = mountGrid(showContactButton)

    expect(w.find('a.btn').exists()).toBe(shown)
    // Card links never depend on the switch, so the fridge link can't be hidden by it (#85).
    expect(w.findAll('.card-link')).toHaveLength(cards.length)
  })
})
