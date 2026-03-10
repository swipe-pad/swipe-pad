---
name: neynar-miniapps
description: Use when adding Neynar support around Farcaster Mini Apps, especially auth, server-side validation, webhooks, and API-backed utilities. Favor official Neynar docs and keep Neynar optional unless product requirements demand it.
---

# Neynar Mini Apps

Use this skill when SwipePad needs Neynar-backed server features for Farcaster.

## Focus

- Auth and session verification
- Webhooks and event ingestion
- API-backed profile or cast utilities
- Keeping Neynar integration optional and well-bounded

## Workflow

1. Read `references/official-docs.md`.
2. Confirm whether the current task really needs Neynar or only the Farcaster SDK.
3. Keep server-only secrets off the client.
4. Prefer feature flags and small seams around Neynar-specific behavior.

## References

- Official docs: `references/official-docs.md`
