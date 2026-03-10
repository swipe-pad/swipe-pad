import { readFileSync } from "node:fs"
import { join } from "node:path"
import { createHash } from "node:crypto"

import { ConvexHttpClient } from "convex/browser"

type DatasetName = "agents" | "builders" | "descience" | "eco" | "karma"

type NormalizedRecord = {
  projectId: string
  title: string
  description: string
  imageUrl: string
  category: string
  rawCategory: string
  recipientWallet: string
  chain: string
  source: "json"
  sourceDataset: string
  rawSourceId: string
  profileUrl?: string
  network?: string
  website?: string
  twitter?: string
  github?: string
  farcaster?: string
  linkedin?: string
  discord?: string
  verifiedLevel?: number
  featured?: boolean
  active?: boolean
}

type ImportStats = {
  dataset: string
  totalRows: number
  normalizedRows: number
  skippedRows: number
  duplicateRows: number
  writtenRows: number
}

const DATA_DIR = join(process.cwd(), "data/imports/ui-lab")
const DEFAULT_DATASETS: DatasetName[] = ["builders", "eco", "karma", "agents", "descience"]
const VALID_DATASETS = new Set(DEFAULT_DATASETS)
const SHOULD_WRITE = process.argv.includes("--write")

const datasetArg = process.argv.find((arg) => arg.startsWith("--dataset="))
const onlyDataset = datasetArg?.split("=")[1] as DatasetName | undefined

if (onlyDataset && !VALID_DATASETS.has(onlyDataset)) {
  console.error(`[import:ui-lab:json] unknown dataset: ${onlyDataset}`)
  process.exit(1)
}

const enabledDatasets = onlyDataset ? [onlyDataset] : DEFAULT_DATASETS

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? ""
const adminKey = process.env.ADMIN_API_KEY ?? ""
const callerWallet =
  process.env.ADMIN_E2E_CALLER_WALLET ??
  process.env.ADMIN_WALLETS?.split(",").map((value) => value.trim()).filter(Boolean)[0]

function readJson<T>(fileName: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, fileName), "utf8")) as T
}

function stableHash(value: string): string {
  return createHash("sha1").update(value).digest("hex").slice(0, 16)
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeUrl(value: unknown): string | undefined {
  const raw = normalizeText(value)
  if (!raw || raw.toLowerCase() === "n/a" || raw.toLowerCase() === "null") return undefined
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw
  if (raw.startsWith("@")) return raw.slice(1)
  return raw
}

function normalizeWallet(value: unknown): string {
  const raw = normalizeText(value).toLowerCase()
  if (!raw || raw === "n/a" || raw === "0x") return ""
  if (!raw.startsWith("0x")) return ""
  return raw
}

function normalizeChain(value: unknown, fallback = "celo"): string {
  const raw = normalizeText(value).toLowerCase()
  if (raw === "base") return "base"
  if (raw === "ethereum") return "ethereum"
  if (raw === "celo") return "celo"
  return fallback
}

function buildProjectId(dataset: string, rawSourceId: string): string {
  return `json-${dataset}-${stableHash(rawSourceId)}`
}

function isMeaningfulRecord(title: string, description: string, imageUrl?: string): boolean {
  return Boolean(title || description || imageUrl)
}

function dedupeKey(record: NormalizedRecord): string {
  const title = record.title.trim().toLowerCase()
  const wallet = record.recipientWallet.trim().toLowerCase()
  if (wallet) return `${record.category}|${wallet}|${title}`
  return `${record.category}|${record.rawSourceId}`
}

function normalizeAgents(): NormalizedRecord[] {
  const rows = readJson<Array<Record<string, unknown>>>("agents_8004scan.json")
  return rows.map((row) => {
    const title = normalizeText(row.name) || "Unknown Agent"
    const profileUrl = normalizeUrl(row.profile_url)
    const network = normalizeText(row.network)
    const recipientWallet = normalizeWallet(row.agent_wallet)
    const rawSourceId = profileUrl ?? `${network}:${recipientWallet}:${title}`
    return {
      projectId: buildProjectId("agents", rawSourceId),
      title,
      description: normalizeText(row.description),
      imageUrl: normalizeUrl(row.image_url) ?? "",
      category: "Agents",
      rawCategory: "Agents",
      recipientWallet,
      chain: normalizeChain(network, "base"),
      source: "json",
      sourceDataset: "agents_8004scan",
      rawSourceId,
      profileUrl,
      network: network || undefined,
      website: normalizeUrl(row.website),
      verifiedLevel: 0,
      featured: false,
      active: true,
    }
  })
}

function normalizeBuilders(): NormalizedRecord[] {
  const rows = readJson<Array<Record<string, unknown>>>("builders_curated.json")
  return rows.map((row) => {
    const title = normalizeText(row.Name) || "Unknown Builder"
    const recipientWallet = normalizeWallet(row["Wallet Address"]) || normalizeWallet(row["Wallet 2"])
    const rawSourceId = recipientWallet || normalizeUrl(row.Farcaster) || title
    return {
      projectId: buildProjectId("builders", rawSourceId),
      title,
      description: normalizeText(row.Description),
      imageUrl: normalizeUrl(row["Profile Image URL"]) ?? "",
      category: "Builders",
      rawCategory: "Builders",
      recipientWallet,
      chain: "celo",
      source: "json",
      sourceDataset: "builders_curated",
      rawSourceId,
      website: undefined,
      twitter: normalizeUrl(row.Twitter),
      github: normalizeUrl(row.GitHub),
      farcaster: normalizeUrl(row.Farcaster),
      linkedin: normalizeUrl(row.LinkedIn),
      verifiedLevel: recipientWallet ? 1 : 0,
      featured: false,
      active: true,
    }
  })
}

function normalizeDeScience(): NormalizedRecord[] {
  const rows = readJson<Array<Record<string, unknown>>>("descience_world.json")
  return rows.map((row) => {
    const title = normalizeText(row.name) || "Unknown DeScience Project"
    const projectUrl = normalizeUrl(row.project_url)
    const rawSourceId = projectUrl ?? title
    return {
      projectId: buildProjectId("descience", rawSourceId),
      title,
      description: normalizeText(row.description),
      imageUrl: normalizeUrl(row.image_url) ?? "",
      category: "DeScience",
      rawCategory: "DeScience",
      recipientWallet: "",
      chain: "celo",
      source: "json",
      sourceDataset: "descience_world",
      rawSourceId,
      profileUrl: projectUrl,
      website: normalizeUrl(row.website) ?? projectUrl,
      verifiedLevel: 0,
      featured: false,
      active: true,
    }
  })
}

function normalizeEco(): NormalizedRecord[] {
  const rows = readJson<Array<Record<string, unknown>>>("eco_hypercerts.json")
  return rows.map((row) => {
    const title = normalizeText(row["Project Name"]) || "Unknown Eco Project"
    const ecocertainUrl = normalizeUrl(row["Ecocertain URL"])
    const hypercertUrl = normalizeUrl(row["Hypercerts URL"])
    const rawSourceId = ecocertainUrl ?? hypercertUrl ?? title
    return {
      projectId: buildProjectId("eco", rawSourceId),
      title,
      description: normalizeText(row.Description),
      imageUrl: normalizeUrl(row["Image url"]) ?? "",
      category: "Eco Projects",
      rawCategory: "Eco Projects",
      recipientWallet: normalizeWallet(row.Wallet),
      chain: "celo",
      source: "json",
      sourceDataset: "eco_hypercerts",
      rawSourceId,
      profileUrl: ecocertainUrl ?? hypercertUrl,
      website: normalizeUrl(row.Website) ?? ecocertainUrl ?? hypercertUrl,
      verifiedLevel: 1,
      featured: false,
      active: true,
    }
  })
}

function normalizeKarma(): NormalizedRecord[] {
  const rows = readJson<Array<Record<string, unknown>>>("karma_projects.json")
  return rows.map((row) => {
    const title = normalizeText(row.project_name) || "Unknown Project"
    const projectUrl = normalizeUrl(row.project_url)
    const recipientWallet = normalizeWallet(row.wallet_address)
    const rawSourceId = projectUrl ?? `${recipientWallet}:${title}`
    return {
      projectId: buildProjectId("karma", rawSourceId),
      title,
      description: normalizeText(row.Description),
      imageUrl: normalizeUrl(row.project_image) ?? "",
      category: "Dapps",
      rawCategory: "Dapps",
      recipientWallet,
      chain: "celo",
      source: "json",
      sourceDataset: "karma_projects",
      rawSourceId,
      profileUrl: projectUrl,
      website: normalizeUrl(row.website) ?? projectUrl,
      twitter: normalizeUrl(row.twitter),
      github: normalizeUrl(row.github),
      farcaster: normalizeUrl(row.farcaster),
      linkedin: normalizeUrl(row.linkedin),
      discord: normalizeUrl(row.discord),
      verifiedLevel: recipientWallet ? 1 : 0,
      featured: false,
      active: true,
    }
  })
}

function getNormalizedRows(dataset: DatasetName): NormalizedRecord[] {
  switch (dataset) {
    case "agents":
      return normalizeAgents()
    case "builders":
      return normalizeBuilders()
    case "descience":
      return normalizeDeScience()
    case "eco":
      return normalizeEco()
    case "karma":
      return normalizeKarma()
  }
}

async function main() {
  const client = SHOULD_WRITE ? new ConvexHttpClient(convexUrl) : null
  const mutationName = adminKey ? "projects:upsertImportedProject" : "projects:upsertImportedProjectDev"

  if (SHOULD_WRITE && !convexUrl) {
    console.error("[import:ui-lab:json] NEXT_PUBLIC_CONVEX_URL is required with --write")
    process.exit(1)
  }

  if (SHOULD_WRITE && !adminKey) {
    console.warn("[import:ui-lab:json] ADMIN_API_KEY not found, using dev import mutation")
  }

  const summaries: ImportStats[] = []

  for (const dataset of enabledDatasets) {
    const normalized = getNormalizedRows(dataset)
    const seenKeys = new Set<string>()
    const filtered: NormalizedRecord[] = []
    let skippedRows = 0
    let duplicateRows = 0

    for (const record of normalized) {
      if (!isMeaningfulRecord(record.title, record.description, record.imageUrl)) {
        skippedRows += 1
        continue
      }

      const key = dedupeKey(record)
      if (seenKeys.has(key)) {
        duplicateRows += 1
        continue
      }

      seenKeys.add(key)
      filtered.push(record)
    }

    let writtenRows = 0
    if (client) {
      for (const record of filtered) {
        const payload = adminKey
          ? { adminKey, callerWallet, ...record }
          : record
        await client.mutation(mutationName as never, payload as never)
        writtenRows += 1
      }
    }

    summaries.push({
      dataset,
      totalRows: normalized.length,
      normalizedRows: filtered.length,
      skippedRows,
      duplicateRows,
      writtenRows,
    })
  }

  console.table(summaries)
  console.log(`[import:ui-lab:json] mode=${SHOULD_WRITE ? "write" : "dry-run"}`)
}

main().catch((error) => {
  console.error("[import:ui-lab:json] failed", error)
  process.exit(1)
})
