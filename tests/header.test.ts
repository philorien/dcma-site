import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteHeader from '../app/components/SiteHeader.vue'
import { makeSettings, makeNavLink } from './fixtures'

function mountHeader(navLinks: ReturnType<typeof makeNavLink>[]) {
  return mount(SiteHeader, {
    props: {
      settings: makeSettings({
        orgName: 'DCMA',
        joinCta: { label: 'JOIN', href: 'mailto:join@example.com' },
        navLinks,
      }),
    },
  })
}

describe('SiteHeader', () => {
  it('renders plain links for top-level items without children', () => {
    const w = mountHeader([
      makeNavLink({ label: 'Home', href: '/' }),
      makeNavLink({ label: 'Get Involved', href: '/get-involved' }),
    ])

    expect(w.text()).toContain('Home')
    expect(w.text()).toContain('Get Involved')
    expect(w.findAll('.dropdown')).toHaveLength(0)
  })

  it('renders a dropdown trigger and its children for items with children', () => {
    const w = mountHeader([
      makeNavLink({
        label: 'About Us',
        href: '/about',
        children: [
          { label: 'Our Mission', href: '/about' },
          { label: 'Financials', href: '/financials' },
        ],
      }),
    ])

    expect(w.text()).toContain('About Us')
    expect(w.findAll('.dropdown')).toHaveLength(1)
    expect(w.text()).toContain('Our Mission')
    expect(w.text()).toContain('Financials')
  })

  it('renders a label-only dropdown trigger when href is absent', () => {
    const w = mountHeader([
      makeNavLink({
        label: 'More',
        href: undefined,
        children: [{ label: 'Updates', href: '/updates' }],
      }),
    ])

    expect(w.find('.no-link').text()).toContain('More')
    expect(w.text()).toContain('Updates')
  })

  it('renders the join CTA', () => {
    const w = mountHeader([])
    expect(w.find('a.join').text()).toBe('JOIN')
  })

  describe('mobile menu', () => {
    function mountOpenable() {
      const w = mount(SiteHeader, {
        attachTo: document.body,
        props: {
          settings: makeSettings({
            navLinks: [
              makeNavLink({ label: 'Home', href: '/' }),
              makeNavLink({ label: 'Mail', href: 'mailto:hi@example.com' }),
            ],
          }),
        },
      })
      return w
    }

    it('starts collapsed with a labelled toggle wired to the panel', () => {
      const w = mountOpenable()
      const toggle = w.find('.nav-toggle')
      expect(toggle.attributes('aria-expanded')).toBe('false')
      expect(toggle.attributes('aria-controls')).toBe('site-nav-panel')
      expect(w.find('#site-nav-panel').classes()).not.toContain('open')
      w.unmount()
    })

    it('opens on toggle click, moves focus to the close button, and locks scroll', async () => {
      const w = mountOpenable()
      await w.find('.nav-toggle').trigger('click')
      expect(w.find('.nav-toggle').attributes('aria-expanded')).toBe('true')
      expect(w.find('#site-nav-panel').classes()).toContain('open')
      expect(document.activeElement).toBe(w.find('.nav-close').element)
      expect(document.body.style.overflow).toBe('hidden')
      w.unmount()
    })

    it('closes on Escape, restores focus to the toggle, and unlocks scroll', async () => {
      const w = mountOpenable()
      await w.find('.nav-toggle').trigger('click')
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await nextTick()
      expect(w.find('.nav-toggle').attributes('aria-expanded')).toBe('false')
      expect(document.activeElement).toBe(w.find('.nav-toggle').element)
      expect(document.body.style.overflow).toBe('')
      w.unmount()
    })

    it('closes on scrim click and on close button click', async () => {
      const w = mountOpenable()
      await w.find('.nav-toggle').trigger('click')
      await w.find('.nav-scrim').trigger('click')
      expect(w.find('#site-nav-panel').classes()).not.toContain('open')

      await w.find('.nav-toggle').trigger('click')
      await w.find('.nav-close').trigger('click')
      expect(w.find('#site-nav-panel').classes()).not.toContain('open')
      w.unmount()
    })

    it('closes when a link inside the panel is clicked', async () => {
      const w = mountOpenable()
      await w.find('.nav-toggle').trigger('click')
      const link = w.find('#site-nav-panel a[href^="mailto:"]')
      // stop happy-dom from trying to open the mailto: URL
      link.element.addEventListener('click', (e) => e.preventDefault())
      await link.trigger('click')
      expect(w.find('#site-nav-panel').classes()).not.toContain('open')
      w.unmount()
    })

    it('traps Tab at the last item and Shift+Tab at the first', async () => {
      const w = mountOpenable()
      await w.find('.nav-toggle').trigger('click')
      const items = Array.from(
        w.find('#site-nav-panel').element.querySelectorAll<HTMLElement>('a[href], button'),
      )
      const first = items[0]!
      const last = items[items.length - 1]!

      last.focus()
      await w.find('#site-nav-panel').trigger('keydown', { key: 'Tab' })
      expect(document.activeElement).toBe(first)

      first.focus()
      await w.find('#site-nav-panel').trigger('keydown', { key: 'Tab', shiftKey: true })
      expect(document.activeElement).toBe(last)
      w.unmount()
    })

    it('releases scroll lock if unmounted while open', async () => {
      const w = mountOpenable()
      await w.find('.nav-toggle').trigger('click')
      w.unmount()
      expect(document.body.style.overflow).toBe('')
    })
  })
})
