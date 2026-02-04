---
description: Commit changes using Conventional Commits and Gitmoji
---

# Workflow: Commit

## Procedure

### 1. Review status
```bash
git status
git diff --stat
```

### 2. If there are multiple unrelated changes

Identify logical chunks:
- Group by component (efi, docs, tooling, etc.)
- Order chronologically
- Create a commit plan before executing

### 3. Stage by chunk
```bash
# Only the files for the chunk
git add <files-for-chunk>
```

### 4. Format commit
```bash
git commit -m "<emoji> <type>(<scope>): <subject>"
```

**Format:**
- Emoji at the beginning
- Type: feat, fix, docs, chore, refactor
- Optional scope in parentheses
- Subject in imperative, lowercase, max 50 chars

**Examples:**
```bash
git commit -m "✨ feat(efi): add SSDT-PLUG"
git commit -m "📝 docs: update README"
git commit -m "🔧 chore: add justfile"
```

### 5. Repeat for each chunk

Until `git status` is clean.

## Rules

- **NEVER** group unrelated changes
- **NEVER** make commits with dozens of mixed files
- Each commit must be atomic and representative
- Prefer small and frequent commits

## Gitmoji Reference

| Emoji | Type | Usage |
|-------|------|-------|
| ✨ | feat | New functionality |
| 🐛 | fix | Fix |
| 📝 | docs | Documentation |
| 🔧 | chore | Config/maintenance |
| ♻️ | refactor | Refactoring |
| 🗑️ | chore | Delete |
