import { ConvexHttpClient } from "convex/browser"

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? ""
const MAX_QUERY_CACHE_ENTRIES = 200

let cachedClient: ConvexHttpClient | null = null
const queryCache = new Map<string, { expiresAt: number; value: unknown; inFlight: Promise<unknown> | null }>()

function pruneQueryCache(now: number) {
  for (const [key, value] of queryCache.entries()) {
    if (value.expiresAt <= now) {
      queryCache.delete(key)
    }
  }

  if (queryCache.size <= MAX_QUERY_CACHE_ENTRIES) return

  const sortedEntries = [...queryCache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt)
  const toDelete = queryCache.size - MAX_QUERY_CACHE_ENTRIES
  for (let index = 0; index < toDelete; index += 1) {
    queryCache.delete(sortedEntries[index][0])
  }
}

function getClient(): ConvexHttpClient {
  if (!cachedClient) {
    cachedClient = new ConvexHttpClient(CONVEX_URL)
  }
  return cachedClient
}

export async function fetchConvexQuery<Args extends object, Result>(
  functionName: string,
  args: Args,
  options?: {
    cacheTtlMs?: number
    cacheKey?: string
  }
): Promise<Result> {
  const cacheTtlMs = Math.max(options?.cacheTtlMs ?? 0, 0)
  const cacheKey = options?.cacheKey ?? `${functionName}:${JSON.stringify(args)}`
  const now = Date.now()
  pruneQueryCache(now)

  if (cacheTtlMs > 0) {
    const entry = queryCache.get(cacheKey)
    if (entry && entry.expiresAt > now) {
      if (entry.value !== undefined) return entry.value as Result
      if (entry.inFlight) return await entry.inFlight as Result
    }
  }

  const client = getClient()
  const task = (async () => await client.query(functionName as any, args) as Result)()

  if (cacheTtlMs > 0) {
    queryCache.set(cacheKey, {
      expiresAt: now + cacheTtlMs,
      value: undefined,
      inFlight: task,
    })
  }

  try {
    const result = await task
    if (cacheTtlMs > 0) {
      queryCache.set(cacheKey, {
        expiresAt: Date.now() + cacheTtlMs,
        value: result,
        inFlight: null,
      })
    }
    return result
  } catch (error) {
    if (cacheTtlMs > 0) {
      queryCache.delete(cacheKey)
    }
    throw error
  }
}

export async function fetchConvexAction<Args extends object, Result>(
  functionName: string,
  args: Args
): Promise<Result> {
  const client = getClient()
  return await client.action(functionName as any, args) as Result
}

export async function fetchConvexMutation<Args extends object, Result>(
  functionName: string,
  args: Args
): Promise<Result> {
  const client = getClient()
  return await client.mutation(functionName as any, args) as Result
}
