import { defineType, defineField } from 'sanity'
import { imageField } from './imageField'

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({ name: 'heading', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'tagline', type: 'string' }),
    imageField({ name: 'image' }),
    defineField({ name: 'cta', type: 'cta' }),
    defineField({ name: 'secondaryCta', type: 'cta' }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'tagline' },
    prepare({ title, subtitle }) {
      return { title: title || 'Hero', subtitle: subtitle || 'Hero section' }
    },
  },
})

export const splitSection = defineType({
  name: 'splitSection',
  title: 'Text + image',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({ name: 'heading', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'body', type: 'text', rows: 6 }),
    imageField({ name: 'image', options: { hotspot: true } }),
    defineField({
      name: 'imagePosition',
      type: 'string',
      options: { list: [{ title: 'Left', value: 'left' }, { title: 'Right', value: 'right' }] },
      initialValue: 'left',
    }),
  ],
  preview: {
    select: { title: 'heading', media: 'image' },
    prepare({ title, media }) {
      return { title: title || 'Text + image', subtitle: 'Split section', media }
    },
  },
})

export const proseSection = defineType({
  name: 'proseSection',
  title: 'Text section',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({ name: 'heading', type: 'string' }),
    defineField({ name: 'body', type: 'text', rows: 10 }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow' },
    prepare({ title, subtitle }) {
      return { title: title || 'Text section', subtitle }
    },
  },
})

export const cardGridSection = defineType({
  name: 'cardGridSection',
  title: 'Card grid',
  type: 'object',
  fields: [
    defineField({ name: 'heading', type: 'string' }),
    defineField({ name: 'intro', type: 'text', rows: 2 }),
    defineField({
      name: 'style',
      type: 'string',
      options: {
        list: [
          { title: 'Simple cards', value: 'simple' },
          { title: 'Cards with photos', value: 'photos' },
        ],
      },
      initialValue: 'simple',
    }),
    defineField({
      name: 'showContactButton',
      title: 'Show contact button',
      type: 'boolean',
      description: 'Adds a “Contact us!” email button under the cards. Turn off when the cards already have their own contact links.',
      initialValue: true,
    }),
    defineField({ name: 'cards', type: 'array', of: [{ type: 'card' }], validation: (r) => r.min(1) }),
  ],
  preview: {
    select: { title: 'heading', style: 'style', showContactButton: 'showContactButton' },
    prepare({ title, style, showContactButton }) {
      const kind = style === 'photos' ? 'With photos' : 'Simple cards'
      return { title: title || 'Card grid', subtitle: showContactButton === false ? `${kind} · no contact button` : kind }
    },
  },
})

export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'Call to action',
  type: 'object',
  fields: [
    defineField({ name: 'heading', type: 'string' }),
    defineField({ name: 'note', type: 'text', rows: 2 }),
    defineField({ name: 'cta', type: 'cta', validation: (r) => r.required() }),
    defineField({ name: 'secondaryCta', type: 'cta' }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'note' },
    prepare({ title, subtitle }) {
      return { title: title || 'Call to action', subtitle }
    },
  },
})

export const contactSectionBlock = defineType({
  name: 'contactSectionBlock',
  title: 'Contact form',
  type: 'object',
  fields: [
    defineField({ name: 'heading', type: 'string' }),
  ],
  preview: {
    prepare() {
      return { title: 'Contact form' }
    },
  },
})

export const pageSectionTypes = [
  heroSection,
  splitSection,
  proseSection,
  cardGridSection,
  ctaSection,
  contactSectionBlock,
]
