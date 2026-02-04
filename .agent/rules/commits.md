---
trigger: model_decision
description: Rules for commits with Conventional Commits and Gitmoji
---

# Commit Rules

> [!CAUTION]
> **AUTONOMOUS COMMIT FORBIDDEN**
> The agent/model MUST NEVER execute `git commit` autonomously.
> It can only commit when explicitly requested by the user or via the `/commit` workflow.

## Format

All commits must follow **Conventional Commits** with **Gitmoji**:

```
<emoji> <type>(<scope>): <subject>
```

### Examples

```
✨ feat(efi): add SSDT-PLUG for CPU PM
🐛 fix(config): remove duplicate USBToolBox entry
📝 docs(readme): add justfile commands
🔧 chore(justfile): add backup recipe
♻️ refactor(acpi): reorganize SSDTs
🗑️ chore: remove obsolete OpenCore 1.0.2
```

## Rules

1. **Short titles** - Maximum 50 characters (GitHub limit)
2. **No description** - Only use body if strictly necessary
3. **One emoji** - Always at the beginning, before the type
4. **Imperative verb** - "add", "fix", "remove", not "added", "fixes"
5. **Lowercase** - The subject always in lowercase
6. **No trailing period** - Do not end with a period

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

## Process for Multiple Changes

1. **Identify logical chunks** - Group by component/purpose
2. **Order chronologically** - From oldest to newest
3. **Stage by chunk** - `git add` only the files for the chunk
4. **Atomic commit** - One commit per logical chunk
5. **Avoid mega-commits** - Never group unrelated changes

## ⚠️ Agent Rule

**The agent MUST NEVER execute `git commit` automatically.**

It can only commit via:
- Explicit user command
- `/commit` workflow defined in `.agent/workflows/`