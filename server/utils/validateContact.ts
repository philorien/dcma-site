export interface ContactBody {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  website?: string
}

type ContactField = Exclude<keyof ContactBody, 'website'>

const REQUIRED_FIELDS: ContactField[] = ['firstName', 'lastName', 'email', 'subject', 'message']
const MAX_LENGTHS: Record<ContactField, number> = {
  firstName: 100,
  lastName: 100,
  email: 254,
  subject: 200,
  message: 5_000,
}

export type ContactValidation =
  | { valid: true; data: ContactBody }
  | { valid: false; errors: string[] }

export function validateContact(value: unknown): ContactValidation {
  const errors: string[] = []

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { valid: false, errors: [...REQUIRED_FIELDS] }
  }

  const body = value as Record<string, unknown>
  const normalized = {
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  }

  for (const field of REQUIRED_FIELDS) {
    const fieldValue = body[field]
    if (typeof fieldValue !== 'string' || !fieldValue.trim()) {
      errors.push(field)
      continue
    }

    const trimmed = fieldValue.trim()
    if (trimmed.length > MAX_LENGTHS[field]) {
      errors.push(field)
      continue
    }

    normalized[field] = trimmed
  }

  if (normalized.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized.email)) {
    errors.push('email')
  }

  if (errors.length) return { valid: false, errors: [...new Set(errors)] }
  return { valid: true, data: normalized }
}
