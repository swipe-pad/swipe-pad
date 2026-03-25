# Contributing to SwipePad 💖

Thank you for considering contributing to SwipePad! We're on a mission to make micro-donations seamless and impactful. Every contribution helps us get closer to that goal.

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute? 🤔

- 💡 **Suggesting Features:** Have an idea? We'd love to hear it!
- 🐛 **Reporting Bugs:** Found something unexpected? Let us know!
- 📄 **Improving Documentation:** Help us make our guides clearer.
- 🧑‍💻 **Writing Code:** Help us build new features or fix existing issues.

## Getting Started 🚀

1. **Fork the Repository:** Click the "Fork" button at the top right of the [SwipePad repository page](https://github.com/ReFi-Starter/swipe-pad).
2. **Clone Your Fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/swipe-pad.git
   cd swipe-pad
   ```
3. **Set Upstream Remote:**
   ```bash
   git remote add upstream https://github.com/ReFi-Starter/swipe-pad.git
   ```
4. **Install Dependencies:**
   ```bash
   bun install
   ```

## Tech Stack

- **Runtime/Package Manager**: Bun (never use npm/yarn/pnpm)
- **Framework**: Next.js 14+ (App Router)
- **Backend**: Convex
- **Web3**: Wagmi/viem
- **Contracts**: Foundry
- **Tests**: Bun test + Playwright

## Local Development

```bash
bun run dev          # Start dev server (port 3030)
bun run check        # typecheck + lint + lint:css + knip
bun run test         # Unit tests
bun run test:e2e     # E2E tests
bun run build        # Production build
```

### Contracts (Foundry)

```bash
bun run contracts:build  # Build Solidity
bun run contracts:test   # Test Solidity
```

Run contracts checks when modifying `contracts/`.

### Git Hooks

Git hooks are in `.githooks/`. Enable with:

```bash
git config core.hooksPath .githooks
```

Hooks run automatically on commit/push. Skip with `--no-verify`.

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

## Pull Requests 📬

1. **Push Your Branch:**
   ```bash
   git push origin feat/your-feature
   ```
2. **Open a Pull Request:** Go to the [SwipePad repository](https://github.com/ReFi-Starter/swipe-pad) and click "New pull request".
3. **PR Title:** Use a Conventional Commits title: `feat: add swipe feed`
4. **Keep PRs focused** for fast review
5. **Wait for CI checks** + at least one review before merging
6. **Prefer squash merge** so the PR title becomes the commit history

## Reporting Bugs & Suggesting Features 🐞💡

- **Bugs:** Check the [Issues tab](https://github.com/ReFi-Starter/swipe-pad/issues) first. If not reported, create a new issue using our "Bug Report" template.
- **Features:** Use the "Feature Request" template in the [Issues tab](https://github.com/ReFi-Starter/swipe-pad/issues) or start a conversation in our [Discussions tab](https://github.com/ReFi-Starter/swipe-pad/discussions).

## Project Management 📋

We use [GitHub Projects](https://github.com/users/ReFi-Starter/projects/1) to track work and organize sprints. Feel free to pick up an unassigned issue — just leave a comment to let us know you're working on it.

## Questions? 💬

- Start a new topic in our [Discussions tab](https://github.com/ReFi-Starter/swipe-pad/discussions)
- Comment on a relevant issue
- Run `just` (or `just --list`) to see available commands
- Check `.env.example` for required environment variables

Thank you for your interest in SwipePad! Let's build something amazing together. ✨
