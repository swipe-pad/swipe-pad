# SwipePad

Next.js app (port 3030) with Convex backend, Foundry/Solidity contracts, and Web3 integrations.

## Tech Stack

- **Runtime/PM**: Bun (never use npm/yarn/pnpm)
- **Framework**: Next.js 14+ App Router
- **Backend**: Convex (see `convex/`)
- **Contracts**: Foundry in `contracts/` (forge build/test/deploy)
- **Web3**: Wagmi/viem
- **Tests**: Bun test + Playwright

## Commands

| What | Command |
|------|---------|
| Dev server | `bun run dev` (port 3030) |
| Full check | `bun run check` (typecheck + lint + lint:css + knip) |
| Unit tests | `bun run test` |
| E2E tests | `bun run test:e2e` |
| Build | `bun run build` |

## Contract Commands

| What | Command |
|------|---------|
| Build | `bun run contracts:build` |
| Test | `bun run contracts:test` |

## Project Conventions

### Auto-Generated Output

All auto-generated files (build artifacts, test outputs, screenshots, etc.) go to `.cache/` subdirectories. Never commit them.

```
.cache/
├── artifacts/    # Agent/browser screenshots and test artifacts
├── next/        # Next.js build output (alternative to .next/)
└── ...          # Other generated content
```

Keep the project root clean. Only committed source files and standard config should live there.

## Agent Setup

If you need extended configuration (commands, skills, rules), run:

```bash
just agent-setup <tool>
```

Supported tools: `opencode`, `cursor`, `claude`, `codex`, `gemini`

Example for OpenCode:
```bash
just agent-setup opencode
```

This generates tool-specific config in `.opencode/`, `.cursor/`, etc.

## Critical Rules

- **Never commit autonomously**. Ask the user before `git commit`.
- **Always use `bun`**. No npm, yarn, or pnpm commands.
- **Run checks before committing**: `bun run check`

## Commit Format

Use Gitmoji + Conventional Commits:

```
<emoji> <type>(<scope>): <subject>
```

Examples:
```
✨ feat(feed): add infinite scroll
🐛 fix(auth): wallet connection race
```

Rules: max 50 chars, imperative mood, lowercase, no trailing period.

| Emoji | Type |
|-------|------|
| ✨ | feat |
| 🐛 | fix |
| 📝 | docs |
| 🔧 | chore |
| ♻️ | refactor |


