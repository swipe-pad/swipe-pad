All commits must follow **Conventional Commits** with **Gitmoji**.

**Format:**
```
<emoji> <type>(<scope>): <subject>
```

**Examples:**
```
✨ feat(efi): add SSDT-PLUG for CPU PM
🐛 fix(config): remove duplicate USBToolBox entry
📝 docs(readme): add justfile commands
```

**Rules:**
1. Short titles - Maximum 50 characters
2. One emoji - Always at the beginning, before the type
3. Imperative verb - "add", "fix", "remove"
4. Lowercase - The subject always in lowercase
5. No trailing period

**Gitmoji Reference:**

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

**Process for Multiple Changes:**
1. Identify logical chunks - Group by component/purpose
2. Order chronologically - From oldest to newest
3. Stage by chunk - `git add` only the files for the chunk
4. Atomic commit - One commit per logical chunk
5. Avoid mega-commits

**Critical Rule:**
**The agent MUST NEVER execute `git commit` automatically.**
It can only commit via explicit user command.
