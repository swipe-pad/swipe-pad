"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Globe, Github, Linkedin, Rocket, RotateCcw, ThumbsUp, Twitter, X, Zap } from "lucide-react"
import { useMemo, useState } from "react"

import type { Project } from "@/lib/useConvexData"
import { SafeImage } from "@/components/ui/safe-image"
import { getCategoryFallbackImage, getProjectImageSrc, getTopLevelCategory } from "@/lib/project-taxonomy"

function getCategoryType(category: string): "builders" | "eco" | "apps" | "agents" | "science" {
  const key = category.toLowerCase()
  if (key.includes("agent")) return "agents"
  if (key.includes("science") || key.includes("desci")) return "science"
  if (getTopLevelCategory(category) === "Eco Projects") return "eco"
  if (getTopLevelCategory(category) === "Dapps") return "apps"
  if (getTopLevelCategory(category) === "Agents") return "agents"
  if (getTopLevelCategory(category) === "DeScience") return "science"
  return "builders"
}

interface OzkCardProps {
  project: Project
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onUndo?: () => void
  onBoost?: () => void
}

export function OzkCard({ project, onSwipeLeft, onSwipeRight, onUndo, onBoost }: OzkCardProps) {
  const [isBoosting, setIsBoosting] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [isTurboActive, setIsTurboActive] = useState(Boolean(project.boostAmount && project.boostAmount > 0))
  const [imageFailed, setImageFailed] = useState(false)

  const categoryType = getCategoryType(project.category)
  const imageSrc = useMemo(() => {
    if (imageFailed) {
      return getCategoryFallbackImage({ category: project.category, source: project.source })
    }

    return getProjectImageSrc(project.imageUrl, { category: project.category, source: project.source })
  }, [imageFailed, project.category, project.imageUrl, project.source])

  const categoryStyle = {
    builders: "bg-blue-600/90",
    eco: "bg-emerald-600/90",
    apps: "bg-purple-600/90",
    agents: "bg-orange-500/90",
    science: "bg-cyan-600/90",
  }[categoryType]
  const categoryText = {
    builders: "BUILDERS",
    eco: "ECO PROJECT",
    apps: "DAPP",
    agents: "AGENT",
    science: "DE-SCI",
  }[categoryType]

  const triggerBoost = () => {
    if (isBoosting) return
    setIsBoosting(true)
    setShowParticles(true)
    onBoost?.()
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
          <SafeImage
            src={imageSrc}
            alt={project.name}
            fill
            className="object-cover"
            draggable={false}
            loading="eager"
            onError={() => setImageFailed(true)}
          />

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
              {project.verifiedLevel && project.verifiedLevel > 0 ? <Zap className="size-4 fill-current text-[#FFD600]" /> : null}
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-gray-400">{project.description}</p>
            <div className="mt-0.5 flex items-center gap-3 text-gray-500">
              {project.github ? <Github className="size-4" /> : null}
              {project.twitter ? <Twitter className="size-4" /> : null}
              {project.website ? <Globe className="size-4" /> : null}
              {project.linkedin ? <Linkedin className="size-4" /> : null}
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2 px-1 pb-2">
            <button onClick={onSwipeLeft} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[24px] border border-zinc-700/50 bg-zinc-800 text-white">
              <X className="size-5" /> <span className="text-base">Skip</span>
            </button>
            <button onClick={onUndo} className="flex size-11 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-800 text-blue-400">
              <RotateCcw className="size-4" />
            </button>
            <button onClick={onSwipeRight} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[24px] bg-[#F9DE4B] text-black">
              <ThumbsUp className="size-5" /> <span className="text-base">Like</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
