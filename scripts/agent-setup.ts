#!/usr/bin/env bun
/**
 * Agent Setup Script
 *
 * Generates agent-specific configuration from templates in configs/agents/.
 *
 * Usage: bun run scripts/agent-setup.ts [tool]
 *
 * Supported tools:
 *   - opencode
 *   - cursor
 *   - claude
 *   - codex
 *   - gemini
 *
 * Examples:
 *   bun run scripts/agent-setup.ts opencode    # Generate .opencode/
 *   bun run scripts/agent-setup.ts cursor      # Generate .cursor/
 *   bun run scripts/agent-setup.ts all         # Generate all
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative, basename } from 'path'
import { execSync } from 'child_process'

const SOURCE_DIR = 'configs/agents'
const SUPPORTED_TOOLS = ['opencode', 'cursor', 'claude', 'codex', 'gemini']

interface ToolConfig {
  targetDir: string
  transforms: {
    commands?: (content: string, filename: string) => string
    rules?: (content: string, filename: string) => string
    skills?: (content: string, filename: string) => string
  }
  extraFiles?: Array<{ path: string; content: string }>
}

/**
 * OpenCode transforms
 */
const opencodeTransforms: ToolConfig['transforms'] = {
  commands: (content, filename) => {
    const name = basename(filename, '.md')
    const descriptions: Record<string, string> = {
      'commit': 'Commit changes with conventional commits + gitmoji',
      'check': 'Run full project verification',
      'contracts-build': 'Build Solidity contracts',
      'contracts-test': 'Test Solidity contracts',
    }
    const desc = descriptions[name] || name
    return `---\ndescription: ${desc}\n---\n${content}`
  },
  skills: (content) => content, // Skills already have frontmatter
  rules: (content) => content, // Rules are just markdown in opencode
}

/**
 * Cursor transforms
 */
const cursorTransforms: ToolConfig['transforms'] = {
  commands: undefined, // Cursor doesn't have commands
  skills: undefined, // Cursor doesn't have skills
  rules: (content, filename) => {
    const name = basename(filename, '.md')
    return `---\ndescription: ${name} rule\nglobs: *\n---\n${content}`
  },
}

/**
 * Claude transforms
 */
const claudeTransforms: ToolConfig['transforms'] = {
  commands: undefined,
  skills: (content) => content, // Skills are compatible
  rules: (content) => content,
}

/**
 * Codex transforms
 */
const codexTransforms: ToolConfig['transforms'] = {
  commands: undefined,
  skills: undefined,
  rules: undefined,
}

/**
 * Gemini transforms
 */
const geminiTransforms: ToolConfig['transforms'] = {
  commands: undefined,
  skills: undefined,
  rules: undefined,
}

const toolConfigs: Record<string, ToolConfig> = {
  opencode: {
    targetDir: '.opencode',
    transforms: opencodeTransforms,
    extraFiles: [
      {
        path: '.gitignore',
        content: 'node_modules/\npackage.json\nbun.lock\npackage-lock.json\n',
      },
    ],
  },
  cursor: {
    targetDir: '.cursor',
    transforms: cursorTransforms,
    extraFiles: [],
  },
  claude: {
    targetDir: '.claude',
    transforms: claudeTransforms,
    extraFiles: [],
  },
  codex: {
    targetDir: '.',
    transforms: codexTransforms,
    extraFiles: [],
  },
  gemini: {
    targetDir: '.gemini',
    transforms: geminiTransforms,
    extraFiles: [
      {
        path: '.gitignore',
        content: 'mcp.json\nantigravity/\n*.json\n',
      },
    ],
  },
}

/**
 * Walk a directory recursively and return all files
 */
function* walkDir(dir: string): Generator<string> {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      yield* walkDir(fullPath)
    } else {
      yield fullPath
    }
  }
}

/**
 * Copy directory tree from source to target, applying transforms
 */
function copyWithTransforms(
  sourceSubdir: string,
  targetDir: string,
  transform?: (content: string, filename: string) => string
): void {
  const fullSource = join(SOURCE_DIR, sourceSubdir)
  if (!existsSync(fullSource)) return

  for (const filePath of walkDir(fullSource)) {
    const relPath = relative(fullSource, filePath)
    const content = readFileSync(filePath, 'utf-8')
    const transformed = transform ? transform(content, filePath) : content

    const targetPath = join(targetDir, sourceSubdir, relPath)
    mkdirSync(dirname(targetPath), { recursive: true })
    writeFileSync(targetPath, transformed)
    console.log(`  Created: ${targetPath}`)
  }
}

function generateTool(tool: string): void {
  const config = toolConfigs[tool]
  if (!config) {
    console.error(`Error: Unknown tool "${tool}"`)
    console.error(`Supported tools: ${SUPPORTED_TOOLS.join(', ')}`)
    process.exit(1)
  }

  console.log(`\nGenerating config for: ${tool}`)

  // Create target directory
  if (config.targetDir !== '.') {
    mkdirSync(config.targetDir, { recursive: true })
    console.log(`  Created: ${config.targetDir}/`)
  }

  // Copy commands
  if (config.transforms.commands) {
    copyWithTransforms('commands', config.targetDir, config.transforms.commands)
  }

  // Copy skills
  if (config.transforms.skills) {
    copyWithTransforms('skills', config.targetDir, config.transforms.skills)
  }

  // Copy rules
  if (config.transforms.rules) {
    copyWithTransforms('rules', config.targetDir, config.transforms.rules)
  }

  // Extra files
  for (const file of config.extraFiles || []) {
    const targetPath = join(config.targetDir, file.path)
    mkdirSync(dirname(targetPath), { recursive: true })
    writeFileSync(targetPath, file.content)
    console.log(`  Created: ${targetPath}`)
  }

  // For Gemini, create settings.json
  if (tool === 'gemini') {
    const settingsPath = join(config.targetDir, 'settings.json')
    writeFileSync(
      settingsPath,
      JSON.stringify({ context: { fileName: 'AGENTS.md' } }, null, 2)
    )
    console.log(`  Created: ${settingsPath}`)
  }
}

function cleanArtifacts(): void {
  console.log('\nCleaning generated artifacts...')
  const dirs = ['.opencode', '.cursor', '.claude', '.gemini', '.kilocode', '.agent', '.agents']

  for (const dir of dirs) {
      if (existsSync(dir)) {
        execSync(`rm -rf ${dir}`)
        console.log(`  Removed: ${dir}/`)
      }
  }

  console.log('Done. Run `bun run scripts/agent-setup.ts [tool]` to regenerate.')
}

function main(): void {
  const args = process.argv.slice(2)
  const tool = args[0]

  if (!tool || tool === '--help' || tool === '-h') {
    console.log(`
Agent Setup Script

Generates agent-specific configuration from templates in configs/agents/

Usage:
  bun run scripts/agent-setup.ts <tool>
  bun run scripts/agent-setup.ts all
  bun run scripts/agent-setup.ts clean

Tools:
  opencode    Generate .opencode/ (commands, skills, rules)
  cursor      Generate .cursor/ (rules with .mdc frontmatter)
  claude      Generate .claude/ (skills and rules)
  codex       No-op (AGENTS.md already at root)
  gemini      Generate .gemini/ (settings.json)
  all         Generate all configurations
  clean       Remove all generated artifacts

Examples:
  bun run scripts/agent-setup.ts opencode
  bun run scripts/agent-setup.ts all
`)
    process.exit(0)
  }

  if (tool === 'clean') {
    cleanArtifacts()
    return
  }

  if (tool === 'all') {
    for (const t of SUPPORTED_TOOLS) {
      generateTool(t)
    }
  } else {
    generateTool(tool)
  }

  console.log('\nDone!')
  console.log('\nGenerated artifacts are gitignored.')
  console.log('Source templates are in configs/agents/ (committed).')
}

main()
