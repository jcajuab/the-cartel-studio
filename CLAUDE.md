@AGENTS.md

---

# UI & React

**Components — default to the registry.** Before authoring anything new, search the configured shadcn registry via the `shadcn` MCP (`search_items_in_registries`, then `view_items_in_registries`, then `get_add_command_for_items`). Existing registry components keep the look uniform; reach for them first and only fall through if nothing fits.

**Custom UI — use the `frontend-design` skill.** Invoke it only when the registry has no match. Do not hand-roll bespoke styling without it.

**All React code — apply Vercel patterns.** Use the `vercel-composition-patterns` and `vercel-react-best-practices` skills whenever creating or refactoring components, including registry components you extend.
