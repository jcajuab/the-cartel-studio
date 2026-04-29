<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## UI Component Policy (strict)

1. **shadcn primitives come first.** Before authoring or modifying any UI primitive (button, input, select, dialog, sheet, table, badge, alert, tooltip, dropdown, tabs, form, sidebar, etc.), search the configured shadcn registry via the `shadcn` MCP: `search_items_in_registries` → `view_items_in_registries` → `get_add_command_for_items`. If a registry primitive exists for what you need, use it.
2. **Always call the shadcn MCP before building or modifying UI primitives.** This is non-negotiable. Do not edit files in `src/components/ui/` unless you have first checked the registry and confirmed no upstream change is available.
3. **Never duplicate shadcn functionality with custom-built components.** No raw `<select>`, `<input>`, `<button>`, `<table>` etc. when a shadcn equivalent is installed. If the primitive isn't installed, install it via `pnpm dlx shadcn@latest add @shadcn/<name>` rather than rolling your own.
4. **Custom components must be thin wrappers.** A custom component is acceptable when it (a) composes shadcn primitives for a domain-specific layout (e.g., `category-tile.tsx`, `receipt-screen.tsx`) or (b) wraps a single primitive with conditional variants (e.g., `stock-badge.tsx`). Anything else is suspect.
5. **Only create truly custom components when no suitable registry primitive or block exists**.
6. **Keep `src/components/ui/*` at registry defaults.** These files are reset-on-rebuild from the registry. Do not embed app-specific styling there. Override at the call site via `className`.
7. **Prefer registry-backed components for consistency, maintainability, and UX.**

## Workflow when touching UI

- **New primitive needed**: search registry → install via shadcn MCP add command → use directly.
- **All React code (custom or registry-extended)**: apply `vercel-composition-patterns` and `vercel-react-best-practices` skills whenever creating or refactoring components.
