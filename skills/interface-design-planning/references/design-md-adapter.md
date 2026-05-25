# DESIGN.md Adapter

This reference defines how `interface-design-planning` uses Google's `DESIGN.md`
format without turning it into the whole interface-planning method.

Source: <https://github.com/google-labs-code/design.md/blob/main/docs/spec.md>

## Role

`DESIGN.md` is a visual-system handoff artifact. Use it for visual identity,
tokens, layout guidance, component visual grammar, and do/don't guardrails.

Do not use `DESIGN.md` for:

- product strategy;
- capability meaning;
- information architecture;
- navigation model;
- route map;
- domain object authority;
- system architecture;
- API / protocol authority;
- implementation task plans.

## When To Read

Read existing `DESIGN.md` when:

- the user asks for visual decomposition;
- the repo has an existing UI;
- the output includes frontend handoff;
- visual consistency is a risk;
- a coding agent will implement the UI.

Treat existing `DESIGN.md` as visual guidance. If it conflicts with SSoT,
product, architecture, standards, or code reality, report the conflict instead
of silently overriding higher authority.

## When To Write

Draft or update `DESIGN.md` only when:

- the user asks for durable visual guidance;
- the project needs visual consistency across multiple surfaces;
- no stronger design-system artifact already owns the same role;
- the host docs policy allows the artifact path.

If the repo uses `docs/design/**`, prefer:

```text
docs/design/DESIGN.md
```

If the repo already has a root `DESIGN.md`, follow the existing convention and
cross-link from `docs/design/**` when needed.

## Mapping To Interface Design Plan

Keep these concerns in `interface-design-plan.md`:

```text
surface inventory
information architecture
navigation model
route / page map
user flows / task flows
interaction states
permissions / visibility
concept and label mapping
frontend handoff
verification notes
```

Move or mirror these concerns into `DESIGN.md` when useful:

```text
overview / visual intent
colors
typography
spacing / density
layout grammar
elevation / depth
shapes / radius
component visual grammar
motion / feedback guidance
do's and don'ts
```

## Minimal DESIGN.md-Compatible Shape

Use a compact shape unless the user asks for a full design-system pass:

```md
# DESIGN.md

## Overview

## Tokens

### Colors

### Typography

### Spacing And Density

### Shape And Elevation

## Layout

## Components

## States

## Do's And Don'ts
```

YAML token blocks may be used when the project needs machine-readable guidance,
but do not invent a full token system for a small one-off surface.

## Alpha / Stability Note

The upstream `DESIGN.md` format is useful for agent-facing visual guidance, but
the skill treats it as an adapter target rather than immutable protocol law.
Prefer compatibility, clarity, and host conventions over strict ceremony.
