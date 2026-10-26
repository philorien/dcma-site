import { buildContactSubmissionDoc } from '../utils/contactSubmission'
import { consumeContactSubmission } from '../utils/contactRateLimit'
import { getSanityWriteClient } from '../utils/sanityWriteClient'
import { validateContact } from '../utils/validateContact'

const MAX_BODY_BYTES = 16 * 1024

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export default defineEventHandler(async (event) => {
  const contentLength = Number(getHeader(event, 'content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Request body too large' })
  }

  const rawBody = await readRawBody(event, false)
  if (rawBody && rawBody.byteLength > MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Request body too large' })
  }

  const clientIp = getRequestIP(event)
  if (!clientIp) {
    throw createError({ statusCode: 503, statusMessage: 'Unable to verify request source' })
  }

  const rateLimit = consumeContactSubmission(clientIp)
  if (!rateLimit.allowed) {
    setResponseHeader(event, 'retry-after', String(rateLimit.retryAfterSeconds))
    throw createError({ statusCode: 429, statusMessage: 'Too many contact form submissions' })
  }

  const body = await readBody<unknown>(event)
  if (isRecord(body) && typeof body.website === 'string' && body.website.trim()) {
    return { ok: true }
  }

  const validation = validateContact(body)
  if (!validation.valid) {
    throw createError({ statusCode: 422, data: { errors: validation.errors } })
  }

  const client = getSanityWriteClient(event)
  const doc = await client.create(buildContactSubmissionDoc(validation.data))

  return { ok: true, id: doc._id }
})
