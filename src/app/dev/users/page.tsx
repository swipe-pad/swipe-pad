"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { DevBreadcrumbs } from "@/components/dev/DevBreadcrumbs"
import { Button } from "@/components/ui/button"
import { fetchConvexQuery } from "@/lib/convex-client"

interface DashboardUser {
  id: string
  wallet: string | null
  status: string
  createdAt: number
  isGuestLike: boolean
}

interface UsersResponse {
  rows: DashboardUser[]
  continueCursor: string | null
  isDone: boolean
}

const STATUS_FILTERS = ["all", "guest", "active", "approved", "pending", "rejected"] as const
const PAGE_SIZE = 10 as const

export default function DevUsersPage() {
  const isDev = process.env.NODE_ENV !== "production"
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all")
  const [cursor, setCursor] = useState<string | null>(null)
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<UsersResponse | null>(null)

  const loadUsers = useCallback(async (forceRefresh = false) => {
    setIsLoading(true)
    try {
      const data = await fetchConvexQuery<
        { search?: string; status?: string; paginationOpts: { numItems: number; cursor: string | null } },
        UsersResponse
      >(
        "waitlist:listUsersForAdmin",
        {
          search: debouncedSearch || undefined,
          status,
          paginationOpts: {
            numItems: PAGE_SIZE,
            cursor,
          },
        },
        { cacheTtlMs: forceRefresh ? 0 : 120_000 }
      )
      setResult(data)
    } catch (err) {
      console.error("Failed to load users:", err)
    } finally {
      setIsLoading(false)
    }
  }, [cursor, debouncedSearch, status])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 250)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    loadUsers(false)
  }, [loadUsers])

  useEffect(() => {
    setCursor(null)
    setCursorStack([])
  }, [search, status])

  const visibleRows = result?.rows ?? []
  const pageNumber = cursorStack.length + 1

  const summary = useMemo(() => {
    const guestLike = visibleRows.filter((r) => r.isGuestLike).length
    return { guestLike }
  }, [visibleRows])

  if (!isDev) {
    return (
      <main className="mx-auto w-full max-w-6xl p-6 text-white">
        <p className="text-sm text-muted-foreground">Dev users explorer is only available in development mode.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-white" data-testid="dev-users-page">
      <DevBreadcrumbs current="Users" />

      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl tracking-wide">Dev Users</h1>
          <p className="text-xs text-muted-foreground">
            Guest-like (page): {summary.guestLike}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void loadUsers(true)} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search wallet..."
          className="h-9 min-w-72 rounded-md border border-surface-border bg-surface-2 px-3 text-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as (typeof STATUS_FILTERS)[number])}
          className="h-9 rounded-md border border-surface-border bg-surface-2 px-2 text-sm"
        >
          {STATUS_FILTERS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <span className="inline-flex h-9 items-center rounded-md border border-surface-border bg-surface-2 px-3 text-sm text-muted-foreground">
          10/page
        </span>
      </div>

      <div className="mb-3 text-xs text-muted-foreground">
        Showing {visibleRows.length} (page {pageNumber})
      </div>

      <div className="space-y-2">
        {visibleRows.map((user) => (
          <div key={user.id} className="surface-panel rounded-xl border border-surface-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="truncate text-sm text-white">{user.wallet ?? "no-wallet"}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full border border-surface-border px-2 py-0.5 uppercase">{user.status}</span>
                <span className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}

        {visibleRows.length === 0 ? (
          <div className="surface-panel rounded-xl border border-surface-border p-4 text-sm text-muted-foreground">
            No users match current filters.
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={cursorStack.length === 0}
          onClick={() => {
            const nextStack = [...cursorStack]
            const previousCursor = nextStack.pop() ?? null
            setCursorStack(nextStack)
            setCursor(previousCursor)
          }}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={Boolean(result?.isDone) || !result?.continueCursor}
          onClick={() => {
            if (!result?.continueCursor) return
            setCursorStack((value) => [...value, cursor])
            setCursor(result.continueCursor)
          }}
        >
          Next
        </Button>
      </div>
    </main>
  )
}
