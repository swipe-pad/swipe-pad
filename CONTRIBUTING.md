# Contributing

## Branches

- Use short topic branches: `feat/feed-routing`, `fix/profile-cards`, `chore/ci-hardening`
- Do not push directly to `main`; changes land through pull requests
- Branch prefixes: `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/`, `agent/`

## Commits

Use Gitmoji + Conventional Commits:

```
✨ feat(feed): add infinite scroll
🐛 fix(auth): wallet connection race
🔧 chore(deps): bump wagmi
```

Rules: 50 chars max, imperative mood, lowercase, no trailing period.

## Pull Requests

- Use a Conventional Commits PR title: `feat: add swipe feed`
- Keep PRs focused for fast review
- Wait for CI checks + at least one review before merging
- Prefer squash merge so the PR title becomes the commit history

## Local Development

```bash
bun run dev          # Start dev server (port 3030)
bun run check        # typecheck + lint + lint:css + knip
bun run test         # Unit tests (src/app + src/lib)
bun run test:e2e     # E2E routing tests
bun run build        # Production build
```

## Local Hooks

Git hooks are in `.githooks/`. Enable with:

```bash
git config core.hooksPath .githooks
```

Hooks run automatically on commit/push. Skip with `--no-verify`.

## Contracts (Foundry)

```bash
bun run contracts:build  # Build Solidity
bun run contracts:test   # Test Solidity
```

Run contracts checks when modifying `contracts/`.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 14+ (App Router)
- **Backend**: Convex
- **Web3**: Wagmi/viem
- **Contracts**: Foundry
- **Tests**: Bun test + Playwright

## Getting Help

- Run `just` (or `just --list`) to see available commands
- Check `.env.example` for required environment variables
