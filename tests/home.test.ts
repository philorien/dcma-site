import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { makeCard, makeSettings } from './fixtures'
import HomeHero from '../app/components/home/HomeHero.vue'
import HomeActivityGrid from '../app/components/home/ActivityGrid.vue'
import type { HomePage, Update } from '../app/types/content'

function makeHomePage(overrides?: Partial<HomePage>): HomePage {
  return {
    heroHeading: 'We show up for our neighbors',
    heroTagline: 'Door County Mutual Aid',
    heroImageUrl: '',
    heroImageAlt: '',
    heroCta: { label: 'OFFER HELP', href: 'mailto:offer@x.z' },
    missionEyebrow: 'Our mission',
    missionHeading: 'Neighbors helping neighbors',
    missionBody: 'We connect people who need help with people who can give it.',
    activitiesHeading: 'WHAT WE DO',
    activities: [makeCard({ title: 'Full Hearts Fridge' })],
    contactHeading: 'Get in touch',
    contactForm: {
      reassurance: 'We respond within a day.',
      firstNameLabel: '',
      lastNameLabel: '',
      emailLabel: '',
      subjectLabel: '',
      messageLabel: '',
      submitLabel: '',
      sendingLabel: '',
      successMessage: '',
      fixFieldsMessage: '',
      serverErrorMessage: '',
      emailInvalidMessage: '',
      fieldRequiredSuffix: '',
    },
    seo: { title: 'Door County Mutual Aid', description: 'Neighbors helping neighbors.' },
    ...overrides,
  }
}

// Stubs Nuxt's Sanity data-fetching composables the same way tests/setup.ts
// stubs the Vue Composition API — pages/index.vue calls these bare, as
// auto-imports, with no full Nuxt runtime present in this test environment.
async function mountHomePage(homePage: HomePage | null, latestUpdate: Update | null = null) {
  vi.stubGlobal('useHomePage', async () => ({ data: ref(homePage) }))
  vi.stubGlobal('useSiteSettings', async () => ({ data: ref(makeSettings()) }))
  vi.stubGlobal('useLatestUpdate', async () => ({ data: ref(latestUpdate) }))
  vi.stubGlobal('useSeoMeta', () => {})

  const IndexPage = (await import('../app/pages/index.vue')).default
  // <script setup> with top-level await compiles to an async setup(), which
  // Vue only resolves inside a <Suspense> boundary.
  const wrapper = mount(
    { components: { IndexPage }, template: '<Suspense><IndexPage /></Suspense>' },
    {
      global: {
        components: { HomeHero, HomeActivityGrid },
        // Renders `to` as href so tests can assert where card links go.
        stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } },
      },
    },
  )
  await flushPromises()
  return wrapper
}

describe('Home page', () => {
  it('renders every field pulled from HOME_QUERY without throwing', async () => {
    const w = await mountHomePage(makeHomePage())

    expect(w.text()).toContain('We show up for our neighbors')
    expect(w.text()).toContain('Neighbors helping neighbors')
    expect(w.text()).toContain('Full Hearts Fridge')
    expect(w.find('a[href="mailto:offer@x.z"]').text()).toBe('OFFER HELP')
  })

  it('renders a single hero CTA, with no leftover secondary button', async () => {
    // Regression: a leftover `howItWorksCards.find(...)` reference outlived
    // the field's removal from HOME_QUERY/HomePage and threw on every SSR
    // render, since `find` doesn't exist on `undefined`.
    const w = await mountHomePage(makeHomePage())

    expect(w.findAll('.hero .actions a')).toHaveLength(1)
  })

  it('links a card to its internal page so /projects/full-hearts-fridge stays reachable', async () => {
    // Regression (#85): card CTA links were removed in favor of the single
    // contact button, leaving the fridge page with no way in from the site.
    const w = await mountHomePage(makeHomePage({
      activities: [makeCard({
        title: 'Full Hearts Fridge',
        cta: { label: 'LEARN MORE', href: '/projects/full-hearts-fridge' },
      })],
    }))

    const link = w.find('.card-link')
    expect(link.text()).toBe('LEARN MORE')
    expect(link.attributes('href')).toBe('/projects/full-hearts-fridge')
  })

  it('skips card links with no label or a link the site can’t open', async () => {
    const w = await mountHomePage(makeHomePage({
      activities: [
        makeCard({ _key: 'proto', cta: { label: 'Sneaky', href: '//evil.example/page' } }),
        makeCard({ _key: 'bare', cta: { label: 'Partner', href: 'partnerorg.com' } }),
        makeCard({ _key: 'nolabel', cta: { label: '', href: '/updates' } }),
      ],
    }))

    expect(w.findAll('.card-link')).toHaveLength(0)
  })

  it('renders the latest update when one exists', async () => {
    const w = await mountHomePage(makeHomePage(), {
      _id: 'u1',
      title: 'Fridge restocked',
      slug: 'fridge-restocked',
      publishedAt: '2026-01-05T00:00:00Z',
      summary: 'Fresh produce available now.',
    })

    expect(w.text()).toContain('Fridge restocked')
    expect(w.text()).toContain('Fresh produce available now.')
  })

  it('omits the latest-update section when there is none', async () => {
    const w = await mountHomePage(makeHomePage(), null)

    expect(w.find('.latest-update').exists()).toBe(false)
  })
})
