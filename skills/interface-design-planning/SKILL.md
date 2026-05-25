---
name: interface-design-planning
description: >-
  Turns product intent or proven headless capabilities into interface modules,
  information architecture, visual decomposition, frontend handoff, and UI
  verification notes. Use when planning UI surfaces, app shell, navigation,
  route/page structure, component grammar, visual hierarchy, DESIGN.md, or
  headless-to-interface growth for AI coding.
---

# Interface Design Planning

Status: experimental candidate skill. It is usable as a downloadable skill, but
the host repository has not promoted it into the formal AI Coding Project OS
method narrative yet.

## Quick Start

1. Read the host language and docs policy first: `AGENTS.md`, `docs/README.md`,
   and existing `docs/design/**` when present.
2. Read upstream planning before decomposing UI: `docs/product/**`,
   `docs/features/**`, `docs/ssot/**`, `docs/architecture/**`,
   `docs/standards/**`, Goal Pack evidence, and headless proof artifacts when
   available.
3. Choose mode:
   - `generic-interface-planning`: start from product intent and user tasks.
   - `headless-to-interface-growth`: map proven headless capabilities to user
     tasks, surfaces, routes, interactions, visual hierarchy, and frontend
     handoff.
   - `existing-ui-increment`: inventory existing routes/components/styles, then
     produce gaps and incremental slices.
4. Write inline output unless a durable artifact is needed. If `docs/design/**`
   exists, place durable plans there. If it is absent, create it only when the
   repo is interface-heavy or the user asks for a durable design artifact.

## Mode Selection

- `generic-interface-planning`: start from product intent and user tasks.
- `headless-to-interface-growth`: map proven headless capabilities to user
  tasks, surfaces, routes, interactions, visual hierarchy, and frontend handoff.
- `existing-ui-increment`: inventory existing routes/components/styles, then
  produce gaps and incremental slices.

Use [Planning Workflow](references/planning-workflow.md) for output templates,
depth rules, concept mapping, frontend handoff, verification notes, and quality
gates.

## Core Rules

Default durable artifact: `docs/design/interface-design-plan.md` or a narrower
`docs/design/<surface>-interface-design-plan.md`.

Default depth is L4 `Page Region` for AI-coding handoff. Deepen to L5/L6 only
when state, permission, visual consistency, shared objects, drawer/detail /
workbench patterns, or direct implementation handoff would otherwise be
ambiguous.

When internal, product, user-facing, UI, or frontend names differ, include
`Concept And Label Mapping`. The mapping may expose naming gaps, but it must not
rewrite SSoT, product meaning, architecture names, or code naming standards.

Always include lightweight `Frontend Handoff` and `Verification Notes` when the
user wants implementation handoff. Do not write file-by-file task lists, choose
frontend frameworks, define API schemas, design stores, claim implementation
completion, or replace Goal Pack / implementation-plan flow.

Express visual work as product rationale plus implementable constraints:
visual hierarchy, layout density, spacing/token assumptions, component grammar,
states, responsive behavior, accessibility notes, and asset needs.

When visual-system consistency matters, read or produce `DESIGN.md` as an
optional companion artifact. See [DESIGN.md Adapter](references/design-md-adapter.md).

## Stop / Ask

Ask one short clarifying question only when deeper decomposition would otherwise
invent product truth, SSoT, architecture, visual direction, or frontend choices.
Otherwise state assumptions and continue.
