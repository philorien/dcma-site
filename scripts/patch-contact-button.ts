// One-off: give every existing card grid an explicit "Show contact button"
// value, so Studio shows what the site renders instead of a blank switch.
// Partners and Get Involved cards carry their own links, so they get false.
// Only touches grids with no value yet; safe to re-run.
// Run: pnpm run patch:contact-button
import { createClient } from '@sanity/client'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')

function loadEnvFile(path: string) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile(join(ROOT, '.env'))

const projectId = process.env.NUXT_SANITY_PROJECT_ID || '1qb86j9s'
const token = process.env.SANITY_TOKEN

if (!token) {
  console.error('Missing SANITY_TOKEN. Add it to .env or export it before running.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset: 'production',
  token,
  apiVersion: '2026-07-01',
  useCdn: false,
})

// Grids whose cards already have their own contact or website links.
const HIDE_CONTACT_BUTTON: Record<string, string[]> = {
  'page-projects': ['s5'], // PARTNERS
  'page-get-involved': ['s2'], // WAYS TO SHOW UP
}

async function run() {
  const pages = await client.fetch<{ _id: string; grids: { _key: string; heading?: string }[] }[]>(
    `*[_type == "page" && !(_id in path("drafts.**"))]{
      _id,
      "grids": sections[_type == "cardGridSection" && !defined(showContactButton)]{ _key, heading }
    }[count(grids) > 0]`,
  )

  for (const page of pages) {
    const set: Record<string, boolean> = {}
    for (const grid of page.grids) {
      const show = !HIDE_CONTACT_BUTTON[page._id]?.includes(grid._key)
      set[`sections[_key=="${grid._key}"].showContactButton`] = show
      console.log(`${page._id} / ${grid.heading ?? grid._key}: showContactButton = ${show}`)
    }
    await client.patch(page._id).set(set).commit()
  }

  if (!pages.length) console.log('Every card grid already has a value; nothing to do.')
}

run().catch((err) => { console.error(err); process.exit(1) })
