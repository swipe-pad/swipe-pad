import type { PanInfo } from "framer-motion"

export type SwipeDir = "left" | "right" | "up" | "down"

export type SwipeDecision = {
  dir: SwipeDir
  strength: number
  velocityNorm: number
  score: number
  offsetX: number
  offsetY: number
  angleRad: number
  angleDeg: number
}

export type FundingAction = "FUND" | "SUPER_FUND" | "SKIP" | "PASS"

export type FundingIntent = {
  action: FundingAction
  conviction: number
  quadraticMultiplier: number
}

export type CommitConfig = {
  minStrengthToCommit: number
  velocityWeight: number
  offsetWeight: number
  angleGateDeg?: number
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function radToDeg(rad: number) {
  return (rad * 180) / Math.PI
}

export function computeDecision(input: {
  offsetX: number
  offsetY: number
  velocityX: number
  velocityY: number
  containerW: number
  containerH: number
  cfg: CommitConfig
}): SwipeDecision | null {
  const { offsetX, offsetY, velocityX, velocityY, containerW, containerH, cfg } = input

  if (!containerW || !containerH) {
    return null
  }

  const nx = offsetX / containerW
  const ny = offsetY / containerH

  const angleRad = Math.atan2(offsetY, offsetX)
  const angleDeg = radToDeg(angleRad)

  if (typeof cfg.angleGateDeg === "number") {
    const gate = Math.max(0, Math.min(89, cfg.angleGateDeg))
    const absAngle = Math.abs(angleDeg)
    const rightWithinGate = absAngle <= gate
    const leftWithinGate = absAngle >= 180 - gate

    if (!rightWithinGate && !leftWithinGate) {
      return null
    }
  }

  let dir: SwipeDir
  if (angleDeg >= -45 && angleDeg <= 45) dir = "right"
  else if (angleDeg > 45 && angleDeg < 135) dir = "down"
  else if (angleDeg < -45 && angleDeg > -135) dir = "up"
  else dir = "left"

  const isHorizontal = dir === "left" || dir === "right"
  const offsetStrength = isHorizontal ? Math.abs(nx) : Math.abs(ny)
  const velocityNorm = isHorizontal ? Math.abs(velocityX) / containerW : Math.abs(velocityY) / containerH

  const score = offsetStrength * cfg.offsetWeight + velocityNorm * cfg.velocityWeight
  const strength = clamp01(offsetStrength * 1.5)

  if (strength < cfg.minStrengthToCommit && velocityNorm < 1.2) {
    return null
  }

  return {
    dir,
    strength,
    velocityNorm,
    score,
    offsetX,
    offsetY,
    angleRad,
    angleDeg,
  }
}

export function decisionFromPan(info: PanInfo, dims: { width: number; height: number }, cfg: CommitConfig) {
  return computeDecision({
    offsetX: info.offset.x,
    offsetY: info.offset.y,
    velocityX: info.velocity.x,
    velocityY: info.velocity.y,
    containerW: dims.width,
    containerH: dims.height,
    cfg,
  })
}

export function mapDecisionToFundingIntent(decision: SwipeDecision): FundingIntent {
  const conviction = Math.max(0, Math.min(1, decision.strength + decision.velocityNorm * 0.15))

  let action: FundingAction = "PASS"
  if (decision.dir === "right") {
    action = conviction >= 0.85 ? "SUPER_FUND" : "FUND"
  } else if (decision.dir === "left") {
    action = "SKIP"
  }

  return {
    action,
    conviction,
    quadraticMultiplier: 1 + conviction * 2,
  }
}
