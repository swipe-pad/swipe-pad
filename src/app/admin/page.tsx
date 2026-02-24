"use client"

import { useQuery } from "convex/react"

import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function MetricCard({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs tracking-wide text-muted-foreground uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-white">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const data = useQuery(api.waitlist.getAdminDashboard, {
    recentProjectsLimit: 250,
    recentUsersLimit: 50,
  })

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-6xl p-6 text-white">
        <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
      </main>
    )
  }

  return (
    <main className="h-screen overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl space-y-6 p-6 text-white">
      <header className="space-y-1">
        <h1 className="font-display text-2xl tracking-wide">Admin Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Convex snapshot generated at {new Date(data.generatedAt).toLocaleString()}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Projects" value={data.projects.total} hint={`${data.projects.active} active`} />
        <MetricCard title="Users" value={data.users.total} hint={`${data.users.guestUsers} guests`} />
        <MetricCard title="Thirdweb-like accounts" value={data.users.thirdwebLikeAccounts} hint="wallets starting with 0x" />
        <MetricCard title="Donations" value={data.donations.total} hint={`total amount ${data.donations.totalAmount.toFixed(2)}`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">User status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.users.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2 text-sm">
                <span className="capitalize text-muted-foreground">{status}</span>
                <span className="font-semibold text-white">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Credits and swipes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
              <span className="text-muted-foreground">Credit rows</span>
              <span className="font-semibold text-white">{data.credits.totalRows}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
              <span className="text-muted-foreground">Credits remaining</span>
              <span className="font-semibold text-white">{data.credits.remaining}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
              <span className="text-muted-foreground">Credits max</span>
              <span className="font-semibold text-white">{data.credits.max}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
              <span className="text-muted-foreground">Recent swipe events</span>
              <span className="font-semibold text-white">{data.swipes.recentCount}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Projects by source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.projects.bySource).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2 text-sm">
                <span className="capitalize text-muted-foreground">{source}</span>
                <span className="font-semibold text-white">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Projects by chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.projects.byChain).map(([chain, count]) => (
              <div key={chain} className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2 text-sm">
                <span className="uppercase text-muted-foreground">{chain}</span>
                <span className="font-semibold text-white">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentUsers.map((user) => (
              <div key={user.id} className="rounded-md border border-surface-border px-3 py-2">
                <div className="mb-1 flex items-center justify-between">
                  <Badge variant="outline">{user.status}</Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="truncate text-xs text-gray-300">{user.wallet ?? "no wallet"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Synced projects ({data.recentProjects.length} / {data.projects.total})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentProjects.map((project) => (
              <div key={project.id} className="rounded-md border border-surface-border px-3 py-2">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-medium text-white">{project.title}</p>
                  <div className="flex items-center gap-1">
                    {project.featured ? <Badge>featured</Badge> : null}
                    <Badge variant="outline" className="uppercase">{project.chain}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{project.source}</span>
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      </div>
    </main>
  )
}
