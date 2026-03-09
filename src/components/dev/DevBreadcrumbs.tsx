"use client"

import Link from "next/link"

interface DevBreadcrumbsProps {
  current: string
  segments?: Array<{ label: string; href?: string }>
}

const DEV_MENU_LINKS = [
  { href: "/dev/settings", label: "Dev Settings" },
  { href: "/ui", label: "UI" },
  { href: "/ui/cards", label: "Cards" },
  { href: "/dev/users", label: "Users" },
  { href: "/dev/projects", label: "Projects" },
  { href: "/observability", label: "Dashboard" },
] as const

export function DevBreadcrumbs({ current, segments }: DevBreadcrumbsProps) {
  const crumbs = segments && segments.length > 0 ? segments : [{ label: "Dev", href: "/dev/settings" }, { label: current }]

  return (
    <div className="mb-4 space-y-3">
      <nav className="surface-panel flex flex-wrap items-center gap-2 rounded-xl border border-surface-border px-3 py-2" aria-label="Developer menu">
        <Link href="/" className="font-display text-xs font-bold tracking-wide text-white transition-colors hover:text-primary">
          SwipePad
        </Link>
        <div className="mx-1 hidden h-4 w-px bg-surface-border sm:block" />
        <div className="flex flex-1 flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {DEV_MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-2 py-1 transition-colors hover:text-white ${link.label === current ? "bg-surface-3 text-white" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="text-xs text-muted-foreground">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <span key={`${crumb.label}-${index}`}>
              {crumb.href && !isLast ? <Link href={crumb.href} className="hover:text-white">{crumb.label}</Link> : <span className={isLast ? "text-white" : ""}>{crumb.label}</span>}
              {!isLast ? <span className="px-1">/</span> : null}
            </span>
          )
        })}
      </div>
    </div>
  )
}
