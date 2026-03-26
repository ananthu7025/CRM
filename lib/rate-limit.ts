// In-memory rate limiter — sufficient for a single-user internal tool.
// Keyed by `${action}:${ip}`.

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Prune expired entries every 100 calls to avoid unbounded growth
let callCount = 0
function maybePrune() {
  if (++callCount % 100 !== 0) return
  const now = Date.now()
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k)
  }
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key      Unique key e.g. "request-otp:1.2.3.4"
 * @param max      Max requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  maybePrune()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= max) return false

  entry.count++
  return true
}

export function getIp(req: Request): string {
  const forwarded = (req.headers as Headers).get('x-forwarded-for')
  return forwarded?.split(',')[0].trim() ?? 'unknown'
}
