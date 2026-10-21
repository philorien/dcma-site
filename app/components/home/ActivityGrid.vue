<script setup lang="ts">
import type { Card } from '~/types/content'
import { cardLink } from '~/utils/cardLink'
const headingId = useId()
const props = defineProps<{ heading?: string; activities: Card[]; email: string; showContactButton?: boolean | null }>()
const cards = computed(() => props.activities.map((card) => ({ card, link: cardLink(card) })))
</script>

<template>
  <section class="grid" :aria-labelledby="heading ? headingId : undefined">
    <h2 v-if="heading" :id="headingId" class="display">{{ heading }}</h2>
    <div class="items">
      <article v-for="{ card: a, link } in cards" :key="a._key">
        <img
          v-if="a.imageUrl"
          :src="a.imageUrl"
          :alt="a.imageAlt ?? ''"
          loading="lazy"
          class="photo"
        >
        <h3>{{ a.title }}</h3>
        <p>{{ a.body }}</p>
        <NuxtLink v-if="link?.internal" :to="link.href" class="card-link">{{ link.label }}</NuxtLink>
        <a v-else-if="link" :href="link.href" v-bind="linkTarget(link.href)" class="card-link">
          {{ link.label }}<span class="sr-only"> (opens in a new tab)</span>
        </a>
      </article>
    </div>
    <!-- Missing on grids saved before the setting existed, so only an explicit false hides it. -->
    <template v-if="showContactButton !== false">
      <hr class="divider">
      <a :href="`mailto:${email}`" class="btn">Contact us!</a>
    </template>
  </section>
</template>

<style scoped>
.grid { padding: 4rem 2rem; }
.grid h2 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin: 0 0 2rem;
}
.items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
}
.items article { display: flex; flex-direction: column; gap: 0.75rem; }
.photo {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  background: var(--cream);
  display: block;
}
.items h3 { margin: 0; font-size: 1.3rem; }
.items p { margin: 0; flex: 1; }
.card-link {
  display: inline-block;
  align-self: flex-start;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--navy);
  text-decoration: none;
  padding-bottom: 2px;
  border-bottom: 2px solid currentColor;
}
.card-link:hover { opacity: 0.7; }
.card-link:focus-visible { outline: 3px solid var(--navy); outline-offset: 2px; }
.divider { margin: 2.5rem 0; }
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
