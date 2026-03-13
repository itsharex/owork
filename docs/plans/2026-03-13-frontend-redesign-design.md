# Frontend Redesign Design

**Date:** 2026-03-13
**Scope:** 3 variants — Chat Interface, Task Management, Agent Management

## Variant 1: Modern AI Chat Interface

Refactor `ChatPage.tsx` in-place.

### Message Layout
- User messages: right-aligned, amber background bubble, `max-w-[70%] ml-auto`
- AI messages: left-aligned, no background or very light gray, relaxed typography
- Message spacing: `gap-6` for breathing room

### New Component: `ToolCallCard.tsx`
- Collapsible card, collapsed by default showing tool name + icon
- Expanded: JSON params and results
- Rounded card with left amber accent bar
- Located in `components/common/`

### Floating Input Bar
- Detached from bottom edge, centered floating, `max-w-3xl mx-auto`
- `rounded-2xl`, `shadow-lg`
- Attachment + send buttons inside the input box
- Background Task indicator above input bar (when tasks running)

### Top Agent Info
- Agent name + model centered at top of chat area
- Replaces current session sidebar title area

### Footer
- "POWERED BY CLAUDE CODE" branding text, centered, muted color

## Variant 2: Modern Task Management

Refactor `TasksPage.tsx` in-place.

### Table Styling
- Keep `ResizableTable` but restyle
- Row dividers: `border-b border-[var(--color-border)]/50` semi-transparent thin lines
- Remove table header background, use text + bottom thin line only
- Increase row height: `py-4` for breathing room

### Status Badges
- Pill shape: `rounded-full px-3 py-1`
- Softer colors: running=blue, completed=green, failed=red, cancelled=gray
- Text-only, no icons inside badges

### Action Buttons
- Hidden by default, fade-in on row hover
- Icon-only ghost buttons replacing current text buttons

### "New Task" Button
- Amber/orange: `bg-amber-500 hover:bg-amber-600 text-white`

## Variant 3: Agent Management Cards

Refactor `AgentsPage.tsx` in-place.

### Layout Change
- Remove `ResizableTable`, replace with CSS grid
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
- Keep existing `SearchBar` and `AgentFormModal`

### New Component: `AgentCard.tsx`
- Header: Agent name (bold) + status dot (green=active, gray=inactive)
- Model label: muted text
- Skills: Colored chips, truncate at ~4 with "+N" overflow
- MCP indicator: small badge if MCPs configured
- Footer: Hover-triggered action icons (chat, edit, delete), fade-in on hover
- Styling: `bg-[var(--color-card)]`, subtle border, `rounded-xl`, soft shadow on hover
- Located in `components/common/`

## Shared Changes

### New CSS Variables (index.css)
```css
--color-accent: #f59e0b;
--color-accent-hover: #d97706;
--color-accent-light: #fef3c7;        /* light theme bubble bg */
--color-accent-light-dark: #78350f1a; /* dark theme bubble bg */
```

### New Components
- `components/common/AgentCard.tsx`
- `components/common/ToolCallCard.tsx`

### Unchanged
- Sidebar structure and navigation
- All Modals / ConfirmDialog
- Service layer and API
- TypeScript types
- i18n key structure (may add a few new keys)
