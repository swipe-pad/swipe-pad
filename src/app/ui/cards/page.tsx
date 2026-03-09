"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useState } from "react"
import { Globe, Github, Linkedin, Rocket, RotateCcw, ThumbsUp, Twitter, X, Zap } from "lucide-react"
import Link from "next/link"

import { DevBreadcrumbs } from "@/components/dev/DevBreadcrumbs"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { setStoredCardDesign } from "@/lib/card-design-preference"
import { CARD_DESIGN_IDS, CARD_DESIGN_META, type CardDesignId } from "@/lib/card-designs"
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
    linkedin: "https://www.linkedin.com/company/swipepad",
    id: "demo-regen-water",
    name: "Regen Water DAO",
    walletAddress: "0x2f5f8fE84D3A98df7BC2f2D1059A3F0732A0B6f2",
    likes: 124,
    comments: 17,
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
    linkedin: "https://www.linkedin.com/company/swipepad",
    id: "demo-river-agent",
    name: "River Agent Network",
    walletAddress: "0xB2f85e77f7b0C2f89d79A6A02c3d7ec6c6429A6F",
    likes: 208,
    comments: 41,
    boostAmount: 0,
  },
]

type OzkCardData = {
  name: string
  image: string
  description: string
  categoryType: "builders" | "eco" | "apps" | "agents"
  verified: boolean
  socials: {
    github?: string
    twitter?: string
    website?: string
    linkedin?: string
  }
}

function getOzkCategoryType(category: string): OzkCardData["categoryType"] {
  const key = category.toLowerCase()
  if (key.includes("eco") || key.includes("climate") || key.includes("regen")) return "eco"
  if (key.includes("agent")) return "agents"
  if (key.includes("dapp")) return "apps"
  return "builders"
}

function OzkExactCard({ project }: { project: OzkCardData }) {
  const [isBoosting, setIsBoosting] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [isTurboActive, setIsTurboActive] = useState(false)

  const categoryStyle = {
    builders: "bg-blue-600/90",
    eco: "bg-emerald-600/90",
    apps: "bg-purple-600/90",
    agents: "bg-orange-500/90",
  }[project.categoryType]

  const categoryText = {
    builders: "BUILDERS",
    eco: "ECO PROJECT",
    apps: "DAPP",
    agents: "AGENT",
  }[project.categoryType]

  const triggerBoost = () => {
    if (isBoosting) return
    setIsBoosting(true)
    setShowParticles(true)
    window.setTimeout(() => {
      setIsBoosting(false)
      setIsTurboActive(true)
    }, 600)
  }

  return (
    <motion.div
      animate={isBoosting ? { scale: [1, 0.95, 1.05, 1], x: [0, -3, 3, -3, 3, 0] } : { scale: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative mx-auto flex h-full w-full flex-col rounded-[26px] ${isTurboActive ? "p-[1px]" : "p-0"}`}
    >
      {isTurboActive ? (
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden rounded-[26px]"
          style={{ background: "linear-gradient(45deg, #00FFF0, #FF00E5, #E2FF3B, #00FFF0)", backgroundSize: "300% 300%" }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      ) : null}

      <AnimatePresence>
        {showParticles ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            onAnimationComplete={() => setShowParticles(false)}
          >
            <span className="text-3xl">✨</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 flex h-full w-full select-none flex-col overflow-hidden rounded-[25px] bg-[#0D0D0D]">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-[24px] border-b border-zinc-800/50 bg-black">
          <img src={project.image} alt={project.name} className="absolute inset-0 size-full object-cover" draggable={false} />

          <div className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider text-white ${categoryStyle}`}>
            {categoryText}
          </div>

          {isTurboActive ? (
            <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded border border-white/30 bg-gradient-to-r from-[#7C3AED] to-[#DB2777] px-2.5 py-1.5 text-[9px] font-bold tracking-wider text-white">
              <Rocket className="size-3 fill-current" /> BOOSTED
            </div>
          ) : null}

          <div className="absolute bottom-3 right-3 z-30">
            <button
              onClick={triggerBoost}
              className="rounded-full border border-indigo-400/30 bg-indigo-600/80 px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_4px_15px_rgba(79,70,229,0.5)] transition-all hover:bg-indigo-500"
            >
              ✨ Boost
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between bg-[#0D0D0D] px-4 pb-2 pt-3">
          <div className="min-h-[120px] space-y-1 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-lg leading-tight font-bold text-white">{project.name}</h2>
              {project.verified ? <Zap className="size-4 fill-current text-[#FFD600]" /> : null}
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-gray-400">{project.description}</p>
            <div className="mt-0.5 flex items-center gap-3 text-gray-500">
              {project.socials.github ? <Github className="size-4" /> : null}
              {project.socials.twitter ? <Twitter className="size-4" /> : null}
              {project.socials.website ? <Globe className="size-4" /> : null}
              {project.socials.linkedin ? <Linkedin className="size-4" /> : null}
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2 px-1 pb-2">
            <button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[24px] border border-zinc-700/50 bg-zinc-800 text-white">
              <X className="size-5" /> <span className="text-base">Skip</span>
            </button>
            <button className="flex size-11 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-800 text-blue-400">
              <RotateCcw className="size-4" />
            </button>
            <button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[24px] bg-[#F9DE4B] text-black">
              <ThumbsUp className="size-5" /> <span className="text-base">Like</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ExternalCardControls() {
  return (
    <div className="mx-auto mt-3 flex w-full max-w-[390px] items-center gap-2 px-1">
      <button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
        <X className="size-4" /> Skip
      </button>
      <button
        aria-label="Undo"
        className="flex size-12 items-center justify-center rounded-full border border-zinc-600/50 bg-zinc-800 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
      >
        <RotateCcw className="size-5" />
      </button>
      <button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#F9DE4B] text-sm font-semibold text-black transition-colors hover:bg-[#f2cb22]">
        <ThumbsUp className="size-4" /> Like
      </button>
    </div>
  )
}

export default function UICardsPage() {
  const [selectedDesign, setSelectedDesign] = useState<CardDesignId>(CARD_DESIGN_IDS[0])
  const [projectIndex, setProjectIndex] = useState(0)

  const selectedProject = projectFixtures[projectIndex] ?? projectFixtures[0]

  const ozkProject = useMemo<OzkCardData>(
    () => ({
      name: selectedProject.name,
      image: selectedProject.imageUrl,
      description: selectedProject.description,
      categoryType: getOzkCategoryType(selectedProject.category),
      verified: Boolean(selectedProject.verifiedLevel && selectedProject.verifiedLevel > 0),
      socials: {
        github: selectedProject.github,
        twitter: selectedProject.twitter,
        website: selectedProject.website,
        linkedin: selectedProject.linkedin,
      },
    }),
    [selectedProject],
  )

  const nextDesign = () => {
    const currentIndex = CARD_DESIGN_IDS.indexOf(selectedDesign)
    const nextIndex = (currentIndex + 1) % CARD_DESIGN_IDS.length
    setSelectedDesign(CARD_DESIGN_IDS[nextIndex])
  }

  return (
    <main className="relative min-h-screen px-4 py-6 text-white sm:px-6" data-testid="ui-cards-page">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <DevBreadcrumbs current="Cards" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xs tracking-[0.24em]">Cards</h1>
          <div className="flex items-center gap-2">
            <Link href="/ui" className="text-xs text-muted-foreground hover:text-white">
              Back to UI
            </Link>
            <select
              value={projectIndex}
              onChange={(event) => setProjectIndex(Number(event.target.value))}
              className="rounded-md border border-surface-border bg-surface-2 px-2 py-1 text-xs"
            >
              {projectFixtures.map((project, index) => (
                <option key={project.id} value={index}>
                  {project.name}
                </option>
              ))}
            </select>
            <Button onClick={nextDesign} data-testid="cards-next-design">
              Cambiar diseno
            </Button>
            <Button
              variant="secondary"
              onClick={() => setStoredCardDesign(selectedDesign)}
              data-testid="cards-activate-design"
            >
              Activar en app
            </Button>
          </div>
        </div>

        <div className="surface-panel rounded-2xl border border-surface-border p-3">
          <div className="flex flex-wrap gap-2">
            {CARD_DESIGN_IDS.map((designId) => (
              <Button
                key={designId}
                size="sm"
                variant={selectedDesign === designId ? "default" : "secondary"}
                onClick={() => setSelectedDesign(designId)}
              >
                {designId}
              </Button>
            ))}
          </div>
        </div>

        <div className="surface-panel rounded-2xl border border-surface-border px-4 py-3 text-sm text-muted-foreground" data-testid="cards-design-label">
          Diseno actual: <span className="text-white">{selectedDesign}</span> - {CARD_DESIGN_META[selectedDesign].label}
        </div>

        <p className="text-xs text-muted-foreground">{CARD_DESIGN_META[selectedDesign].notes}</p>

        {selectedDesign === "SP_CARD_V2_STACK" ? (
          <div>
            <div className="mx-auto w-full max-w-[390px] aspect-[5/7]" data-testid="cards-canvas">
              <ProjectCard
                project={selectedProject}
                onBoost={() => undefined}
                onDonate={() => undefined}
                onSwipeLeft={() => undefined}
                onSwipeRight={() => undefined}
                swipeControlMode="external"
              />
            </div>
            <ExternalCardControls />
          </div>
        ) : null}

        {selectedDesign === "SP_CARD_V2_INLINE" ? (
          <div className="mx-auto w-full max-w-[390px] aspect-[5/7]" data-testid="cards-canvas">
            <ProjectCard
              project={selectedProject}
              onBoost={() => undefined}
              onDonate={() => undefined}
              onSwipeLeft={() => undefined}
              onSwipeRight={() => undefined}
              swipeControlMode="internal"
            />
          </div>
        ) : null}

        {selectedDesign === "OZK_CARD_V1_NEON" ? (
          <div className="mx-auto w-full max-w-[390px] aspect-[5/7]" data-testid="cards-canvas">
            <OzkExactCard project={ozkProject} />
          </div>
        ) : null}
      </div>
    </main>
  )
}
