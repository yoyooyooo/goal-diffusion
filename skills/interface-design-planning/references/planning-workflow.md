# Planning Workflow

Use this reference when producing an interface design plan, headless-to-interface
growth plan, existing UI increment plan, or frontend handoff.

## Output Shape

Default durable artifact: `docs/design/interface-design-plan.md` or a narrower
`docs/design/<surface>-interface-design-plan.md`.

```text
Inputs And Authority Links
Product Intent Summary
Interface Model
  Surface Inventory
  Information Architecture
  Navigation Model
  Route / Page Map
  User Flows / Task Flows
  Interaction States
  Permissions / Visibility
Concept And Label Mapping
Visual Decomposition
  Visual Intent
  Visual Hierarchy
  Layout Grammar
  Component Grammar
  States And Responsive Notes
Frontend Handoff
Verification Notes
Open Questions
Non-goals And Boundaries
```

## Decomposition Depth

Default to L4 when the user wants AI-coding handoff:

```text
L1 App Shell
L2 Navigation Section
L3 Route / Page
L4 Page Region
L5 Interaction State
L6 Component Grammar
```

Stop at the shallowest level that removes ambiguity for user understanding,
cross-surface consistency, and frontend implementation. Deepen to L5/L6 when
state, permission, visual consistency, shared objects, drawer/detail/workbench
patterns, or direct implementation handoff would otherwise be ambiguous.

If the user gives a target depth, follow it. If unclear, ask one short question:
"要粗粒度导航规划，还是能交给前端 agent 实现的页面/组件级拆解？"

## Headless-to-Interface Growth

For AI Coding Project OS projects, preserve this chain from proven capability to
visible UI:

```text
Headless Capability -> User Task -> Surface -> Route/Page
-> Component Boundary -> State Cases -> Evidence/Harness
```

Do not invent product truth or domain objects. Link outward to product, SSoT,
architecture, standards, Goal Pack receipts, and headless evidence.

## Existing UI Increment

When UI code already exists:

1. Inventory current routes, app shell, component patterns, style system, and
   interaction conventions.
2. Preserve current patterns unless the user asks for redesign.
3. Output `Current UI Inventory`, `Gap To Target Interface`, and
   `Incremental Slices`.

## Concept And Label Mapping

When internal, product, user-facing, UI, or frontend names differ, include:

```text
Canonical Concept | Product Meaning | User-facing Label
UI Surface / Route | Frontend Name Hint | Authority
```

Example:

```text
Goal Pack | 长期目标计划 | Project Run | Runs / run detail
GoalRunView | docs/ssot/README.md
```

The mapping may expose naming gaps, but it must not rewrite SSoT, product
meaning, architecture names, or code naming standards by itself.

## Frontend Handoff

Handoff is a design-to-coding interface, not a full implementation plan.

Include:

- route boundaries;
- component candidates;
- state/data hints;
- interaction contracts;
- visual implementation notes;
- UI-facing implementation slices;
- verification ideas;
- open ADR / architecture questions.

Do not include:

- file-by-file task lists;
- frontend framework choices;
- API schemas;
- store design;
- implementation completion claims.

## Visual And Asset Policy

Express visual work as product rationale plus implementable constraints:
visual hierarchy, layout density, spacing/token assumptions, component grammar,
states, responsive behavior, accessibility notes, and asset needs.

Do not produce full brand strategy, moodboards, generated images, or final design
system authority unless the user explicitly asks and the correct downstream
skill/tool is invoked.

## Verification And Quality Gate

Always include UI verification notes:

- route smoke;
- screenshot checks;
- keyboard / focus checks;
- responsive viewport checks;
- empty/loading/error/permission state coverage.

Use `headless-product-harness` for proof commands, fixture / replay, and
evidence envelopes.

The design-planning work is complete when key surfaces, navigation, route/page
responsibilities, page regions, interaction states, concept labels, visual
decomposition, frontend handoff, verification notes, and real blockers are clear
enough for the next agent to proceed without inventing missing authority.
