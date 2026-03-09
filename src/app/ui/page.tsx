"use client"

import { Command } from "cmdk"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"

import { BoostModal } from "@/components/boost-modal"
import { DevBreadcrumbs } from "@/components/dev/DevBreadcrumbs"
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView"
import { ProjectCard } from "@/components/project-card"
import { SwipeStack, type SwipeStackHandle } from "@/components/swipe/SwipeStack"
import { type SwipeItem, useSwipeDeck } from "@/components/swipe/use-swipe-deck"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Project } from "@/lib/useConvexData"

const projectFixtures: Project[] = [
  {
    _id: "demo-regen-water",
    projectId: "demo-regen-water",
    routeId: "demo-regen-water",
    title: "Regen Water DAO",
    description: "Community-led water restoration with open source sensors and transparent onchain grants.",
    category: "Eco Projects",
    imageUrl: "https://images.unsplash.com/photo-1618477460930-d8bffff64172?auto=format&fit=crop&w=1200&q=80",
    recipientWallet: "0x2f5f8fE84D3A98df7BC2f2D1059A3F0732A0B6f2",
    chain: "celo",
    source: "curated",
    verifiedLevel: 3,
    featured: true,
    active: true,
    website: "https://swipepad.example/demo",
    twitter: "https://x.com/swipepadxyz",
    github: "https://github.com/swipe-pad/swipe-pad",
    farcaster: "https://warpcast.com/swipepad",
    linkedin: "https://www.linkedin.com/company/swipepad",
    discord: "https://discord.gg/swipepad",
    id: "demo-regen-water",
    name: "Regen Water DAO",
    walletAddress: "0x2f5f8fE84D3A98df7BC2f2D1059A3F0732A0B6f2",
    likes: 124,
    comments: 17,
    boostAmount: 0,
  },
  {
    _id: "demo-solar-loom",
    projectId: "demo-solar-loom",
    routeId: "demo-solar-loom",
    title: "Solar Loom Collective",
    description: "Rural microgrids stitched into a shared treasury where contributors co-own production.",
    category: "Builders",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    recipientWallet: "0x75A17C88De4Bfd0d7be7f0e2aD7E6F8D6428d77f",
    chain: "celo",
    source: "curated",
    verifiedLevel: 2,
    featured: false,
    active: true,
    website: "https://swipepad.example/solar",
    twitter: "https://x.com/swipepadxyz",
    github: "https://github.com/swipe-pad/swipe-pad",
    farcaster: "https://warpcast.com/swipepad",
    linkedin: "https://www.linkedin.com/company/swipepad",
    discord: "https://discord.gg/swipepad",
    id: "demo-solar-loom",
    name: "Solar Loom Collective",
    walletAddress: "0x75A17C88De4Bfd0d7be7f0e2aD7E6F8D6428d77f",
    likes: 82,
    comments: 9,
    boostAmount: 0,
  },
  {
    _id: "demo-river-agent",
    projectId: "demo-river-agent",
    routeId: "demo-river-agent",
    title: "River Agent Network",
    description: "Autonomous watershed monitoring agents coordinating bounties for rapid impact fixes.",
    category: "Dapps",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    recipientWallet: "0xB2f85e77f7b0C2f89d79A6A02c3d7ec6c6429A6F",
    chain: "celo",
    source: "curated",
    verifiedLevel: 4,
    featured: true,
    active: true,
    website: "https://swipepad.example/agents",
    twitter: "https://x.com/swipepadxyz",
    github: "https://github.com/swipe-pad/swipe-pad",
    farcaster: "https://warpcast.com/swipepad",
    linkedin: "https://www.linkedin.com/company/swipepad",
    discord: "https://discord.gg/swipepad",
    id: "demo-river-agent",
    name: "River Agent Network",
    walletAddress: "0xB2f85e77f7b0C2f89d79A6A02c3d7ec6c6429A6F",
    likes: 208,
    comments: 41,
    boostAmount: 0,
  },
]

function ButtonCardInputDemo() {
  return (
    <Card className="surface-panel-strong border-surface-border bg-surface-2 text-white">
      <CardHeader>
        <CardTitle>UI primitives</CardTitle>
        <CardDescription className="text-muted-foreground">Botones, cards e input del sistema principal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Search test value..." />
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function BoostModalDemo() {
  const [open, setOpen] = useState(false)

  return (
    <div className="surface-panel-strong rounded-2xl border border-surface-border p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Boost Modal</h3>
        <p className="text-sm text-muted-foreground">Prueba de flujo de presets y monto custom.</p>
      </div>
      <Button onClick={() => setOpen(true)}>Open Boost Modal</Button>
      <BoostModal isOpen={open} onClose={() => setOpen(false)} projectName="Regen Water DAO" onBoost={() => setOpen(false)} />
    </div>
  )
}

function ButtonCatalogDemo() {
  const [clickCount, setClickCount] = useState(0)

  const onClick = () => setClickCount((value) => value + 1)

  return (
    <div className="space-y-6" data-testid="demo-button-catalog">
      <div className="surface-panel rounded-2xl border border-surface-border p-3">
        <p className="text-xs text-muted-foreground">Catalogo de botones del sistema y estilos locales.</p>
        <p className="mt-1 text-xs text-white" data-testid="ui-button-catalog-clicks">
          Clicks de prueba: {clickCount}
        </p>
      </div>

      <Card className="surface-panel-strong border-surface-border bg-surface-2 text-white">
        <CardHeader>
          <CardTitle className="text-base">Design system button variants</CardTitle>
          <CardDescription className="text-muted-foreground">Componente `Button` (variant + size).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={onClick}>Default</Button>
            <Button variant="secondary" onClick={onClick}>Secondary</Button>
            <Button variant="outline" onClick={onClick}>Outline</Button>
            <Button variant="ghost" onClick={onClick}>Ghost</Button>
            <Button variant="link" onClick={onClick}>Link</Button>
            <Button variant="destructive" onClick={onClick}>Destructive</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={onClick}>Small</Button>
            <Button size="default" onClick={onClick}>Default</Button>
            <Button size="lg" onClick={onClick}>Large</Button>
            <Button size="icon" aria-label="Icon button sample" onClick={onClick}>+</Button>
            <Button disabled>Disabled</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-panel-strong border-surface-border bg-surface-2 text-white">
        <CardHeader>
          <CardTitle className="text-base">Product custom buttons</CardTitle>
          <CardDescription className="text-muted-foreground">Estilos locales usados en header, card, nav y acciones de swipe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClick}
              className="mx-auto flex shrink-0 items-center rounded-full border border-surface-border bg-[#25314d]/75 px-2.5 py-1 text-[11px] transition-colors hover:bg-[#2b3a5a]"
            >
              <span className="mr-1 inline-flex size-1.5 rounded-full bg-emerald-400" />
              <span className="mr-1 font-semibold text-white">0.10 cUSD</span>
              <span className="text-muted-foreground">v</span>
            </button>

            <button
              type="button"
              onClick={onClick}
              className="relative flex size-9 items-center justify-center rounded-full bg-[#6a86ff] text-white transition-colors hover:brightness-110"
            >
              Cart
            </button>

            <button
              type="button"
              onClick={onClick}
              className="flex size-9 items-center justify-center rounded-full bg-[#23314f] text-white transition-all hover:bg-[#2e4066]"
            >
              T
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClick}
              className="relative flex shrink-0 items-center space-x-1 overflow-hidden rounded-full bg-[#4E45D6] px-3 py-1 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(78,69,214,0.38)] transition-all duration-300 hover:brightness-110"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-20deg] animate-[boost-sheen_3.8s_ease-in-out_infinite] bg-white/30 blur-[1px]" />
              <span className="relative">Boost</span>
            </button>

            <button
              type="button"
              onClick={onClick}
              className="flex h-12 items-center justify-center rounded-full border border-zinc-600/50 bg-zinc-800 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={onClick}
              className="flex h-12 items-center justify-center rounded-full bg-[#F9DE4B] px-5 text-sm font-semibold text-black transition-colors hover:bg-[#f2cb22]"
            >
              Like
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClick}
              className="flex flex-1 items-center justify-center rounded-lg bg-gray-700 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-600 min-w-32"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onClick}
              className="flex flex-1 items-center justify-center rounded-lg bg-yellow-400 px-4 py-3 font-medium text-black transition-colors hover:bg-yellow-500 min-w-32"
            >
              Boost project
            </button>

            <button
              type="button"
              onClick={onClick}
              className="rounded-lg bg-[#677FEB] px-3 py-1 text-sm text-white hover:bg-[#5A6FD3]"
            >
              Donate
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CardsCatalogEntry() {
  return (
    <div className="surface-panel-strong rounded-2xl border border-surface-border p-5" data-testid="demo-cards-catalog">
      <h3 className="text-base font-semibold text-white">Cards catalog</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Catalogo de disenos de carta (Stack, Inline, OZK) con selector de proyecto y toggle de diseno.
      </p>
      <div className="mt-4 flex gap-2">
        <Link href="/ui/cards" className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground">
          Open /ui/cards
        </Link>
        <Link href="/" className="inline-flex h-9 items-center rounded-md border border-surface-border px-3 text-sm text-white">
          Go Home
        </Link>
      </div>
    </div>
  )
}

function ProjectCardDemo() {
  const [projectIndex, setProjectIndex] = useState(0)
  const [boosted, setBoosted] = useState(false)

  const selectedProject = useMemo(() => {
    const base = projectFixtures[projectIndex] ?? projectFixtures[0]
    return {
      ...base,
      boostAmount: boosted ? 35 : 0,
    }
  }, [boosted, projectIndex])

  return (
    <div className="space-y-4" data-testid="demo-project-card">
      <div className="surface-panel rounded-2xl border border-surface-border p-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="ui-card-project-select">
            Project
          </label>
          <select
            id="ui-card-project-select"
            data-testid="ui-card-project-select"
            value={projectIndex}
            onChange={(event) => setProjectIndex(Number(event.target.value))}
            className="rounded-md border border-surface-border bg-surface-2 px-2 py-1 text-xs text-white"
          >
            {projectFixtures.map((project, index) => (
              <option key={project.id} value={index}>
                {project.name}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant={boosted ? "default" : "secondary"}
            size="sm"
            onClick={() => setBoosted((value) => !value)}
            data-testid="ui-card-boost-toggle"
          >
            {boosted ? "Boost on" : "Boost off"}
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[380px] aspect-[5/7]" data-testid="ui-card-canvas">
        <ProjectCard
          project={selectedProject}
          onDonate={() => undefined}
          onBoost={() => undefined}
          onSwipeLeft={() => undefined}
          onSwipeRight={() => undefined}
        />
      </div>
    </div>
  )
}

function SwipeDeckDemo() {
  const stackRef = useRef<SwipeStackHandle>(null)
  const counterRef = useRef(0)

  const nextItem = () => {
    const absoluteIndex = counterRef.current
    const project = projectFixtures[absoluteIndex % projectFixtures.length]
    counterRef.current += 1

    return {
      id: `ui-deck-${absoluteIndex}-${project.id}`,
      absoluteIndex,
      data: project,
    } satisfies SwipeItem<Project>
  }

  const initial = useMemo(() => Array.from({ length: 6 }, () => nextItem()), [])

  const deck = useSwipeDeck<Project>({
    config: { visible: 4 },
    initial,
    refill: (need) => Array.from({ length: need }, () => nextItem()),
  })

  return (
    <div className="space-y-4" data-testid="demo-swipe-deck">
      <div className="surface-panel rounded-2xl border border-surface-border p-3">
        <p className="text-xs text-muted-foreground">
          Deck infinito visual: mantiene 4 cartas visibles y repone por debajo.
        </p>
        <p className="mt-1 text-xs text-white" data-testid="ui-deck-top-name">
          Top card: {deck.items[0]?.data.name ?? "n/a"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => stackRef.current?.swipe("left")} data-testid="ui-deck-swipe-left">
            Swipe left
          </Button>
          <Button size="sm" onClick={() => stackRef.current?.swipe("right")} data-testid="ui-deck-swipe-right">
            Swipe right
          </Button>
          <Button size="sm" variant="outline" onClick={() => deck.undo()} data-testid="ui-deck-undo">
            Undo
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[380px] aspect-[5/7]" data-testid="ui-deck-canvas">
        <SwipeStack
          ref={stackRef}
          items={deck.items}
          busyRef={deck.busyRef}
          onCommit={deck.commit}
          visible={4}
          visualDepth={3}
          rotationsEnabled={true}
          className="relative h-full w-full max-w-none"
          renderCard={(item, isTop) => (
            <ProjectCard
              project={item.data}
              onDonate={() => undefined}
              onBoost={() => undefined}
              onSwipeLeft={() => undefined}
              onSwipeRight={() => undefined}
              swipeControlMode={isTop ? "internal" : "external"}
              className={isTop ? undefined : "pointer-events-none"}
            />
          )}
        />
      </div>
    </div>
  )
}

const demos = [
  {
    id: "cards-catalog",
    label: "Cards catalog",
    keywords: ["cards", "catalog", "ozk", "design"],
    render: () => <CardsCatalogEntry />,
  },
  {
    id: "project-card",
    label: "ProjectCard (full)",
    keywords: ["card", "swipe", "project", "boost"],
    render: () => <ProjectCardDemo />,
  },
  {
    id: "swipe-deck",
    label: "SwipeDeck (4 cards)",
    keywords: ["deck", "infinite", "stack", "swipe"],
    render: () => <SwipeDeckDemo />,
  },
  {
    id: "button-catalog",
    label: "Button catalog",
    keywords: ["buttons", "catalog", "styles", "hover"],
    render: () => <ButtonCatalogDemo />,
  },
  {
    id: "boost-modal",
    label: "BoostModal",
    keywords: ["boost", "modal", "donation"],
    render: () => <BoostModalDemo />,
  },
  {
    id: "leaderboard-view",
    label: "LeaderboardView",
    keywords: ["leaderboard", "ranking", "badges"],
    render: () => (
      <LeaderboardView
        currentUserName="You"
        currentUserLevel={7}
        currentUserPoints={894}
        currentUserRank={5}
        entries={[
          { rank: 1, name: "Ada Regen", level: 9, points: 1230 },
          { rank: 2, name: "CeloNomad", level: 8, points: 1104 },
          { rank: 3, name: "Sol Garden", level: 8, points: 1035 },
          { rank: 4, name: "Forest Loop", level: 7, points: 920 },
          { rank: 5, name: "You", level: 7, points: 894, isCurrentUser: true },
        ]}
      />
    ),
  },
  {
    id: "ui-primitives",
    label: "Button + Input + Card",
    keywords: ["button", "input", "card", "ui"],
    render: () => <ButtonCardInputDemo />,
  },
] as const

export default function UiKitchenSinkPage() {
  const [commandOpen, setCommandOpen] = useState(false)
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null)
  const [quickQuery, setQuickQuery] = useState("")

  const activeDemo = useMemo(() => {
    if (!activeDemoId) return null
    return demos.find((demo) => demo.id === activeDemoId) ?? null
  }, [activeDemoId])

  const quickMatches = useMemo(() => {
    const query = quickQuery.trim().toLowerCase()
    if (!query) return demos.slice(0, 6)
    return demos.filter((demo) => [demo.label, ...demo.keywords].join(" ").toLowerCase().includes(query)).slice(0, 6)
  }, [quickQuery])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) return

      const target = event.target
      if (target instanceof HTMLElement) {
        if (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
          return
        }
      }

      event.preventDefault()
      setCommandOpen((value) => !value)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <main className="relative min-h-screen px-4 py-6 text-white sm:px-6" data-testid="ui-kitchen-sink">
      <div className="mx-auto w-full max-w-6xl">
        <DevBreadcrumbs current="UI" />
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xs tracking-[0.24em] text-white">SwipePad UI Lab</h1>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xs text-muted-foreground hover:text-white">
              Home
            </Link>
            <Button variant="outline" onClick={() => setCommandOpen(true)} data-testid="ui-cmdk-trigger">
              Open CmdK
            </Button>
          </div>
        </div>

        {!activeDemo ? (
          <div className="surface-panel mt-6 rounded-3xl border border-surface-border p-4 sm:p-6">
            <h2 className="text-base font-semibold text-white">Welcome</h2>
            <p className="mt-1 text-sm text-muted-foreground">Busca componente o diseno y cargalo en el canvas.</p>
            <Input
              value={quickQuery}
              onChange={(event) => setQuickQuery(event.target.value)}
              placeholder="Search components or designs..."
              className="mt-4"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {quickMatches.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => setActiveDemoId(demo.id)}
                  className="rounded-full border border-surface-border bg-surface-2 px-3 py-1 text-xs text-white hover:bg-surface-3"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <section className="mx-auto mt-8 w-full max-w-6xl" data-testid="ui-canvas">
        {activeDemo ? (
          <div className="surface-panel rounded-3xl border border-surface-border p-4 sm:p-6" data-testid="ui-loaded-demo">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Loaded component</p>
              <Button variant="ghost" onClick={() => setActiveDemoId(null)}>
                Clear canvas
              </Button>
            </div>
            {activeDemo.render()}
          </div>
        ) : (
          <div className="flex min-h-[70vh] items-center justify-center">
            <h2 className="font-display text-sm tracking-[0.22em] text-white/95">SwipePad</h2>
          </div>
        )}
      </section>

      {commandOpen ? (
        <div className="fixed inset-0 z-[120] bg-black/60 p-4 backdrop-blur-sm" onClick={() => setCommandOpen(false)} data-testid="ui-cmdk-overlay">
          <div
            className="surface-panel-strong mx-auto mt-[12vh] w-full max-w-xl overflow-hidden rounded-2xl border border-surface-border"
            onClick={(event) => event.stopPropagation()}
            data-testid="ui-cmdk"
          >
            <Command className="w-full" label="UI Component Picker">
              <Command.Input
                autoFocus
                placeholder="Search components..."
                className="w-full border-b border-surface-border bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-muted-foreground"
                data-testid="ui-cmdk-input"
              />
              <Command.List className="max-h-[340px] overflow-y-auto p-2">
                <Command.Empty className="px-2 py-4 text-sm text-muted-foreground">No component found.</Command.Empty>
                <Command.Group heading="Components">
                  {demos.map((demo) => (
                    <Command.Item
                      key={demo.id}
                      value={[demo.label, ...demo.keywords].join(" ")}
                      onSelect={() => {
                        setActiveDemoId(demo.id)
                        setCommandOpen(false)
                      }}
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm text-white data-[selected=true]:bg-surface-3"
                      data-testid={`ui-cmdk-item-${demo.id}`}
                    >
                      {demo.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      ) : null}
    </main>
  )
}
