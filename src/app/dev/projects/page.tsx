"use client"

import { useCallback, useEffect, useState } from "react"

import { DevBreadcrumbs } from "@/components/dev/DevBreadcrumbs"
import { Button } from "@/components/ui/button"
import { fetchConvexQuery } from "@/lib/convex-client"

interface DashboardProject {
  id: string
  projectId: string
  title: string
  source: string
  chain: string
  active: boolean
  featured: boolean
  updatedAt: number
}

interface DashboardData {
  rows: DashboardProject[]
  continueCursor: string | null
  isDone: boolean
}

export default function DevProjectsPage() {
  const isDev = process.env.NODE_ENV !== "production"
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [includeInactive, setIncludeInactive] = useState(true)
  const [quickFilter, setQuickFilter] = useState<"all" | "active" | "inactive" | "featured">("all")
  const [cursor, setCursor] = useState<string | null>(null)
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DashboardData | null>(null)

  const loadProjects = useCallback(async (forceRefresh = false) => {
    setIsLoading(true)
    try {
      const data = await fetchConvexQuery<
        {
          search?: string
          includeInactive?: boolean
          quickFilter?: "all" | "active" | "inactive" | "featured"
          paginationOpts: {
            numItems: number
            cursor: string | null
          }
        },
        DashboardData
      >(
        "projects:listProjectsForAdmin",
        {
          search: debouncedSearch || undefined,
          includeInactive,
          quickFilter,
          paginationOpts: {
            numItems: 10,
            cursor,
          },
        },
        { cacheTtlMs: forceRefresh ? 0 : 120_000 }
      )
      setResult(data)
    } catch (err) {
      console.error("Failed to load projects:", err)
    } finally {
      setIsLoading(false)
    }
  }, [cursor, debouncedSearch, includeInactive, quickFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 250)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    queueMicrotask(() => loadProjects(false))
  }, [loadProjects])

  useEffect(() => {
    queueMicrotask(() => {
      setCursor(null)
      setCursorStack([])
    })
  }, [search, includeInactive, quickFilter])

  const visibleRows = result?.rows ?? []
  const pageNumber = cursorStack.length + 1

  if (!isDev) {
    return (
      <main className="mx-auto w-full max-w-6xl p-6 text-white">
        <p className="text-sm text-muted-foreground">Dev projects explorer is only available in development mode.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-white" data-testid="dev-projects-page">
      <DevBreadcrumbs current="Projects" />

      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl tracking-wide">Dev Projects</h1>
          <p className="text-xs text-muted-foreground">
            Snapshot paginado (10 por pagina)
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void loadProjects(true)} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search projectId, title..."
          className="h-9 min-w-72 rounded-md border border-surface-border bg-surface-2 px-3 text-sm"
        />
        <label className="flex items-center gap-2 rounded-md border border-surface-border bg-surface-2 px-3 py-1.5 text-xs">
          <input type="checkbox" checked={includeInactive} onChange={(event) => setIncludeInactive(event.target.checked)} />
          Include inactive
        </label>
        <span className="inline-flex h-9 items-center rounded-md border border-surface-border bg-surface-2 px-3 text-sm text-muted-foreground">
          10/page
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        {(["all", "active", "inactive", "featured"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setQuickFilter(filter)}
            className={`rounded-full border px-2 py-1 ${quickFilter === filter ? "border-primary bg-primary/20 text-white" : "border-surface-border text-muted-foreground hover:text-white"}`}
          >
            {filter}
          </button>
        ))}
        <span className="ml-auto text-muted-foreground">
          Showing {visibleRows.length} (page {pageNumber})
        </span>
      </div>

      <div className="space-y-2">
        {visibleRows.map((project) => (
          <div key={project.id} className="surface-panel rounded-xl border border-surface-border p-3">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="line-clamp-1 text-sm font-medium text-white">{project.title}</p>
                <p className="text-xs text-muted-foreground">
                  {project.projectId} · {project.chain} · {project.source}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs ${project.active ? "border-emerald-500/40 text-emerald-300" : "border-zinc-600 text-zinc-300"}`}>
                  {project.active ? "active" : "inactive"}
                </span>
                {project.featured ? <span className="rounded-full border border-primary/50 px-2 py-0.5 text-xs text-primary">featured</span> : null}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Updated {new Date(project.updatedAt).toLocaleString()}</p>
          </div>
        ))}

        {visibleRows.length === 0 ? (
          <div className="surface-panel rounded-xl border border-surface-border p-4 text-sm text-muted-foreground">
            No projects match current filters.
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
