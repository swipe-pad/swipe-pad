---
name: commit-workflow
description: Gitmoji + Conventional Commits workflow for staging, formatting, and committing changes
license: MIT
---

## What I do

Guide the agent through the complete commit workflow:

1. Review changes with `git status` and `git diff --stat`
2. Group changes into logical chunks by component/purpose
3. Stage each chunk separately: `git add <files>`
4. Format each commit following the project rules
5. Ask user for confirmation before committing

## Commit Format

```
<emoji> <type>(<scope>): <subject>
```

Rules:
- Max 50 characters
- Imperative mood ("add", "fix", "remove")
- Lowercase subject
- No trailing period
- One emoji at the beginning

## Gitmoji Reference

| Emoji | Type | Usage |
|-------|------|-------|
| ✨ | feat | New functionality |
| 🐛 | fix | Bug fix |
| 📝 | docs | Documentation |
| 🔧 | chore | Maintenance/config |
| ♻️ | refactor | Refactoring |
| 🗑️ | chore | Delete code/files |
| 🚀 | feat | Deploy/release |
| 🔨 | chore | Scripts/tooling |
| 📦 | chore | Dependencies |
| 🏗️ | chore | Architecture changes |

## When to use me

Use this skill when the user asks to commit, stage, or when you detect uncommitted changes that should be saved.

## Critical Rule

**NEVER execute `git commit` without explicit user confirmation.**
