const WINDOW_MS = 15 * 60 * 1000
const MAX_SUBMISSIONS = 5
const MAX_CLIENTS = 10_000
const CLEANUP_INTERVAL_MS = 60 * 1000

interface ClientWindow {
  count: number
  resetAt: number
}

export function createContactRateLimiter() {
  const clients = new Map<string, ClientWindow>()
  let nextCleanupAt = 0

  return (clientIp: string, now = Date.now()) => {
    if (now >= nextCleanupAt) {
      for (const [ip, window] of clients) {
        if (window.resetAt <= now) clients.delete(ip)
      }
      nextCleanupAt = now + CLEANUP_INTERVAL_MS
    }

    const window = clients.get(clientIp)
    if (window && window.resetAt > now) {
      if (window.count >= MAX_SUBMISSIONS) {
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil((window.resetAt - now) / 1000),
        }
      }

      window.count += 1
      return { allowed: true, retryAfterSeconds: 0 }
    }

    if (clients.size >= MAX_CLIENTS) {
      return { allowed: false, retryAfterSeconds: Math.ceil(WINDOW_MS / 1000) }
    }

    clients.set(clientIp, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, retryAfterSeconds: 0 }
  }
}

export const consumeContactSubmission = createContactRateLimiter()
