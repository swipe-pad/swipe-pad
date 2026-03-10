---
name: farcaster-miniapps
description: Build and harden Farcaster Mini Apps. Use when implementing or auditing Mini App manifests, SDK bootstrap, wallet providers, embeds, cast sharing, host detection, and Farcaster-specific e2e coverage.
---

# Farcaster Mini Apps

Use this skill for Mini App work in SwipePad.

## Focus

- Host detection through the official Farcaster SDK first
- Dynamic manifests at `/.well-known/farcaster.json`
- `fc:miniapp` and `fc:frame` embed metadata
- Wallet access via `@farcaster/miniapp-sdk` and `@farcaster/miniapp-wagmi-connector`
- Cast composition and share flows
- Test hosts for local and Playwright validation

## Workflow

1. Read `references/swipepad-gap-audit.md` for the repo-specific integration map.
2. Read `references/official-docs.md` for the current platform rules.
3. Prefer the official SDK over `window.ethereum` heuristics.
4. Keep any fallback behavior explicit and isolated.
5. Add or update tests whenever touching manifests, metadata, or host-aware client flows.

## References

- Official platform notes: `references/official-docs.md`
- SwipePad integration map: `references/swipepad-gap-audit.md`
