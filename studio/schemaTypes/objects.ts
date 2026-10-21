import { defineType, defineField } from 'sanity'
import { imageField } from './imageField'

export const navLink = defineType({
  name: 'navLink',
  title: 'Nav link',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'href', type: 'string', description: 'Leave blank to make this a dropdown-only label', }),
    defineField({
      name: 'children',
      title: 'Dropdown items',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
          defineField({ name: 'href', type: 'string', validation: (r) => r.required() }),
        ],
      }],
    }),
  ],
  preview: {
    select: { label: 'label', href: 'href' },
    prepare({ label, href }) {
      return { title: label, subtitle: href || 'dropdown' }
    },
  },
})

export const contactFormCopy = defineType({
  name: 'contactFormCopy',
  title: 'Contact form copy',
  type: 'object',
  fields: [
    defineField({ name: 'reassurance', type: 'string' }),
    defineField({ name: 'firstNameLabel', type: 'string' }),
    defineField({ name: 'lastNameLabel', type: 'string' }),
    defineField({ name: 'emailLabel', type: 'string' }),
    defineField({ name: 'subjectLabel', type: 'string' }),
    defineField({ name: 'messageLabel', type: 'string' }),
    defineField({ name: 'submitLabel', type: 'string' }),
    defineField({ name: 'sendingLabel', type: 'string' }),
    defineField({ name: 'successMessage', type: 'string' }),
    defineField({ name: 'fixFieldsMessage', type: 'string' }),
    defineField({ name: 'serverErrorMessage', type: 'string' }),
    defineField({ name: 'emailInvalidMessage', type: 'string' }),
    defineField({ name: 'fieldRequiredSuffix', type: 'string', description: 'Appended after the field label, e.g. "is required."' }),
  ],
})

export const errorPageCopy = defineType({
  name: 'errorPageCopy',
  title: 'Error page copy',
  type: 'object',
  fields: [
    defineField({ name: 'notFoundTitle', type: 'string' }),
    defineField({ name: 'notFoundDescription', type: 'text', rows: 2 }),
    defineField({ name: 'notFoundMetaTitle', type: 'string' }),
    defineField({ name: 'genericTitle', type: 'string' }),
    defineField({ name: 'genericDescription', type: 'text', rows: 2 }),
    defineField({ name: 'genericMetaTitle', type: 'string' }),
    defineField({ name: 'backHomeLabel', type: 'string' }),
    defineField({ name: 'fridgeLinkLabel', type: 'string' }),
    defineField({ name: 'emailUsLabel', type: 'string' }),
  ],
})

export const cta = defineType({
  name: 'cta',
  title: 'CTA',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'href', type: 'string', description: 'URL or mailto:', validation: (r) => r.required() }),
  ],
})

export const card = defineType({
  name: 'card',
  title: 'Card',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'body', type: 'text', rows: 3 }),
    imageField({ name: 'image', options: { hotspot: true } }),
    defineField({
      name: 'cta',
      type: 'cta',
      description: 'Cards show links to pages on this site, like /updates. Links to other websites only show when the grid’s Buttons is set to Card links. Email links never show.',
      // Warn rather than block: the site silently drops anything else, so a
      // pasted full URL would otherwise just make the button disappear.
      validation: (r) => r.custom((cta: { href?: string } | undefined, context) => {
        const href = cta?.href
        if (!href || (href.startsWith('/') && !href.startsWith('//'))) return true
        if (/^https?:\/\//i.test(href)) {
          // Path is ['sections', { _key }, 'cards', { _key }, 'cta'] inside a card grid.
          const gridKey = (context.path?.[1] as { _key?: string } | undefined)?._key
          const sections = (context.document?.sections ?? []) as { _key: string; buttons?: string }[]
          if (sections.find((s) => s._key === gridKey)?.buttons === 'cards') return true
          return 'This link only shows when the grid’s Buttons is set to Card links. For a page on this site, use a path like /projects/full-hearts-fridge.'
        }
        return 'This link won’t show on the card. Use a path starting with /, or a website starting with https://.'
      }).warning(),
    }),
  ],
})
