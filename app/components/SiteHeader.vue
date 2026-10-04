<script setup lang="ts">
import type { SiteSettings } from '~/types/content'
defineProps<{ settings: SiteSettings }>()

function isInternal(href: string) {
  return href.startsWith('/')
}

// Mobile nav drawer. Below the breakpoint the nav is an off-canvas panel that
// is hidden (visibility) until opened; above it these refs are inert.
const MOBILE_QUERY = '(max-width: 768px)'
const FOCUSABLE = 'a[href], button:not([disabled])'

const open = ref(false)
const toggleEl = ref<HTMLButtonElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const closeEl = ref<HTMLButtonElement | null>(null)

function openMenu() {
  open.value = true
  nextTick(() => closeEl.value?.focus())
}

function closeMenu(restoreFocus = true) {
  if (!open.value) return
  open.value = false
  if (restoreFocus) toggleEl.value?.focus()
}

function onDocumentKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMenu()
}

// Keep Tab / Shift+Tab inside the open panel
function onPanelKeydown(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !open.value || !panelEl.value) return
  const items = Array.from(panelEl.value.querySelectorAll<HTMLElement>(FOCUSABLE))
  if (!items.length) return
  const first = items[0]!
  const last = items[items.length - 1]!
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

// Any link tapped inside the panel (including same-page and mailto links)
// dismisses it; a route-change watcher alone wouldn't cover those.
function onPanelClick(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('a')) closeMenu(false)
}

watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) document.addEventListener('keydown', onDocumentKeydown)
  else document.removeEventListener('keydown', onDocumentKeydown)
})

// If the viewport grows past the breakpoint while open (rotation, resize),
// close so scroll lock and the trap don't linger.
let mql: MediaQueryList | undefined
function onBreakpointChange(e: MediaQueryListEvent) {
  if (!e.matches) closeMenu(false)
}

onMounted(() => {
  mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener('change', onBreakpointChange)
})

onBeforeUnmount(() => {
  mql?.removeEventListener('change', onBreakpointChange)
  document.removeEventListener('keydown', onDocumentKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="site-header">
    <NuxtLink to="/" class="brand">{{ settings.orgName }}</NuxtLink>

    <div
      id="site-nav-panel"
      ref="panelEl"
      class="nav-panel"
      :class="{ open }"
      @keydown="onPanelKeydown"
      @click="onPanelClick"
    >
      <button
        ref="closeEl"
        type="button"
        class="nav-close"
        aria-label="Close menu"
        @click="closeMenu()"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>
    <nav :aria-label="settings.navAriaLabel">
      <template v-for="link in settings.navLinks" :key="link.href ?? link.label">
        <!-- Top-level item with dropdown children -->
        <div v-if="link.children?.length" class="dropdown">
          <NuxtLink
            v-if="link.href"
            :to="link.href"
            class="dropdown-trigger"
          >
            {{ link.label }}
            <span class="chevron" aria-hidden="true" />
          </NuxtLink>
          <span v-else class="dropdown-trigger no-link">
            {{ link.label }}
            <span class="chevron" aria-hidden="true" />
          </span>
          <ul class="dropdown-menu" role="list">
            <li v-for="child in link.children" :key="child.href">
              <NuxtLink v-if="child.href && isInternal(child.href)" :to="child.href">{{ child.label }}</NuxtLink>
              <a v-else-if="child.href" :href="child.href" v-bind="linkTarget(child.href)">{{ child.label }}</a>
            </li>
          </ul>
        </div>

        <!-- Plain top-level link -->
        <NuxtLink v-else-if="link.href && isInternal(link.href)" :to="link.href">{{ link.label }}</NuxtLink>
        <a v-else-if="link.href" :href="link.href" v-bind="linkTarget(link.href)">{{ link.label }}</a>
      </template>
    </nav>
    </div>
    <div class="nav-scrim" :class="{ open }" aria-hidden="true" @click="closeMenu()" />

    <div class="header-actions">
      <ClientOnly>
        <ThemeToggle />
        <template #fallback>
          <span class="toggle-placeholder" aria-hidden="true" />
        </template>
      </ClientOnly>
      <a
        class="btn join"
        :href="settings.joinCta.href"
        v-bind="linkTarget(settings.joinCta.href)"
      >{{ settings.joinCta.label }}</a>
      <button
        ref="toggleEl"
        type="button"
        class="nav-toggle"
        aria-label="Menu"
        aria-controls="site-nav-panel"
        :aria-expanded="open"
        @click="open ? closeMenu() : openMenu()"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" class="nav-icon">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--hairline);
}

.brand {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  max-width: min(14rem, 42vw);
  font-weight: 700;
  font-size: clamp(0.85rem, 2.5vw, 1rem);
  line-height: 1.2;
  color: var(--navy);
  text-decoration: none;
  text-wrap: balance;
}

.brand:focus-visible {
  outline: 3px solid var(--navy);
  outline-offset: 2px;
}

nav {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem 0.25rem;
}

/* Shared link styles */
nav > a,
.dropdown-trigger {
  color: var(--slate);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 2px;
}

nav > a:hover,
nav > a.router-link-active,
.dropdown-trigger:hover,
.dropdown:focus-within .dropdown-trigger {
  text-decoration: underline;
  text-underline-offset: 4px;
}

nav > a:focus-visible,
.dropdown-trigger:focus-visible {
  outline: 3px solid var(--navy);
  outline-offset: 2px;
}

/* Dropdown wrapper */
.dropdown {
  position: relative;
}

.dropdown-trigger {
  cursor: pointer;
}

.no-link {
  cursor: default;
  user-select: none;
}

/* Chevron */
.chevron {
  display: inline-block;
  width: 0.45em;
  height: 0.45em;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg) translateY(-0.1em);
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

.dropdown:hover .chevron,
.dropdown:focus-within .chevron {
  transform: rotate(-135deg) translateY(-0.1em);
}

/* Dropdown menu */
.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 11rem;
  background: var(--surface-raised);
  border: 1px solid var(--hairline);
  box-shadow: 0 4px 16px color-mix(in oklab, var(--navy) 10%, transparent);
  list-style: none;
  margin: 0;
  padding: 0.35rem 0;
  padding-top: calc(0.35rem + 4px);
  z-index: 100;
}

.dropdown:hover .dropdown-menu,
.dropdown:focus-within .dropdown-menu {
  display: block;
}

.dropdown-menu li a {
  display: block;
  padding: 0.55rem 1rem;
  color: var(--navy);
  text-decoration: none;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.dropdown-menu li a:hover,
.dropdown-menu li a.router-link-active {
  background: var(--periwinkle);
}

.dropdown-menu li a:focus-visible {
  outline: 3px solid var(--navy);
  outline-offset: -2px;
}

.header-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

/* reserves the ThemeToggle's footprint until it hydrates, so the join button
   doesn't jump on load */
.toggle-placeholder {
  display: block;
  width: 6.6rem;
  height: 44px;
}

@media (max-width: 900px) {
  .toggle-placeholder {
    width: 2.7rem;
  }
}

.join {
  flex-shrink: 0;
  white-space: nowrap;
}

/* Desktop: the panel wrapper is layout-transparent so <nav> stays a direct
   flex child of the header, and the mobile-only controls are hidden. */
.nav-panel {
  display: contents;
}

.nav-close,
.nav-toggle,
.nav-scrim {
  display: none;
}

.nav-icon {
  width: 1.4rem;
  height: 1.4rem;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  fill: none;
}

@media (max-width: 768px) {
  .site-header {
    padding: 1rem 1.25rem;
    gap: 0.75rem;
  }

  .header-actions {
    margin-left: auto;
    gap: 0.4rem;
  }

  .join {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }

  .nav-toggle,
  .nav-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    padding: 0;
    background: transparent;
    border: 1px solid var(--hairline);
    border-radius: 2px;
    color: var(--slate);
    cursor: pointer;
  }

  .nav-toggle:hover,
  .nav-close:hover {
    color: var(--navy);
    border-color: var(--navy);
  }

  .nav-toggle:focus-visible,
  .nav-close:focus-visible {
    outline: 3px solid var(--navy);
    outline-offset: 2px;
  }

  /* Off-canvas drawer. visibility:hidden while closed removes it from the tab
     order and the accessibility tree; the delay lets the slide-out finish. */
  .nav-panel {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 200;
    width: min(20rem, 85vw);
    padding: 1rem 1.25rem 2rem;
    overflow-y: auto;
    background: var(--surface-raised);
    border-left: 1px solid var(--hairline);
    transform: translateX(100%);
    visibility: hidden;
    transition: transform 0.25s ease, visibility 0s linear 0.25s;
  }

  .nav-panel.open {
    transform: none;
    visibility: visible;
    transition: transform 0.25s ease, visibility 0s;
  }

  .nav-close {
    align-self: flex-end;
    margin-bottom: 0.5rem;
  }

  .nav-scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 150;
    background: rgb(0 0 0 / 0.5);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s ease, visibility 0s linear 0.25s;
  }

  .nav-scrim.open {
    opacity: 1;
    visibility: visible;
    transition: opacity 0.25s ease, visibility 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    .nav-panel,
    .nav-panel.open,
    .nav-scrim,
    .nav-scrim.open {
      transition: none;
    }
  }

  nav {
    flex: none;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
    justify-content: flex-start;
    gap: 0;
  }

  nav > a,
  .dropdown-trigger {
    font-size: 0.95rem;
    padding: 0.5rem 0.25rem;
  }

  /* Dropdown children are always shown, stacked under their parent */
  .dropdown {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .dropdown-menu {
    display: block;
    position: static;
    min-width: 0;
    transform: none;
    box-shadow: none;
    border: none;
    background: transparent;
    padding: 0 0 0.5rem 1rem;
  }

  .dropdown-menu li a {
    padding: 0.5rem 0.25rem;
    font-size: 0.85rem;
    color: var(--slate);
    white-space: normal;
  }

  .dropdown-menu li a:hover {
    background: transparent;
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  .chevron {
    display: none;
  }
}
</style>
