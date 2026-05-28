# Interface Capability Planning Workflow

Use this reference when producing an interface capability plan, IA handoff,
headless-to-interface growth plan, existing UI increment plan, or a durable
`interface-capabilities.yaml` companion artifact.

## Output Shape

Default inline output:

```text
Inputs And Authority Links
Product Capability Summary
Interface Capability Map
  Capability ID
  Intent
  Subject / Source Facts
  Entrypoint / Affordance
  Interaction Contract
IA / Surface Model
  Surface Inventory
  Navigation Model
  Route / Page Map
  Regions
State And Data Contract
  Server Truth
  Local Interaction State
  Remote Data State
  Async Command State
  Realtime State
  URL / Navigation State
  Derived View Model
Testability Plan
  Interface Headless
  Render Wiring
  Browser Visible
  Production Near
Harness Handoff
Concept And Label Mapping
Visual Constraints
Open Questions
Non-goals And Boundaries
```

Default durable artifact:

```text
docs/interface-capabilities/<surface>.yaml
```

When the work is inside a Goal Pack, use the optional companion:

```text
docs/goal-proof/goals/<goal-id>/interface-capabilities.yaml
```

Do not place the full Interface Capability DSL inside `goal.yaml`; the Goal
Pack should reference it by ID.

## Decomposition Depth

Use the shallowest depth that lets another agent implement and verify the
capability without inventing product truth:

```text
L1 Product Capability
L2 Interface Capability
L3 Surface / Route
L4 Page Region
L5 Interaction State
L6 Component Grammar
L7 Harness Contract
```

Default to L5 for AI-coding handoff. Deepen to L6/L7 when state, permissions,
realtime, async commands, accessibility, drawer/detail/workbench patterns, or
direct harness handoff would otherwise be ambiguous.

## Modes

### generic-interface-capability

Use when starting from product intent:

```text
Product intent -> User work item -> Interface Capability -> Surface / IA
-> State contract -> Harness handoff
```

### headless-to-interface-capability

Use when proven headless capability exists:

```text
Headless Capability -> User Work Item -> Interface Capability -> Surface
-> Interaction Contract -> State Cases -> UI Harness -> Evidence
```

Preserve headless `claim_ceiling`. A headless proof can prove facts; it does not
prove projection consumption, render wiring, or browser-visible behavior.

### existing-interface-increment

When UI code already exists:

1. Inventory current routes, app shell, component patterns, style system, state
   owners, query/cache owners, router model, realtime client, and test harness.
2. Preserve current patterns unless the user asks for redesign.
3. Output `Current Interface Inventory`, `Capability Gap To Target`, and
   `Incremental Interface Slices`.

### interaction-island

Use when the full IA is unsettled but a local user capability is testable.

Required minimum:

```text
subject identity
entrypoint
state transition
visible success
visible failure / recovery
proof boundary
```

Mark it `status: sketch` or `candidate` and avoid turning visual details into
regression requirements.

## Thin DSL Convention

Start with two object kinds:

```text
InterfaceCapability
InterfaceSurface
```

Use IDs as trace anchors:

```text
ic.<domain>.<action>
surface.<area>.<name>
region.<area>.<name>
hs.<domain>.<scenario>  # harness reference only; definition lives in product-harness
```

Example:

```yaml
kind: InterfaceCapability
id: ic.issue-intake.from-channel-message
status: candidate

intent: >
  A user can turn a visible message into a manageable Issue without learning
  internal execution objects.

authority_refs:
  product:
    - docs/product/contract.md
  object_authority:
    - docs/ssot/core-object-authority.md
  headless:
    - hp.issue-create.from-message

surface_refs:
  - surface.channel.workspace
  - surface.issue.detail-drawer

entrypoint:
  subject: channel_message
  affordance: create_issue
  preferred_label: Create issue
  agent_may_choose_selector: true

interaction_contract:
  user_action: create an Issue from a visible source message
  visible_pending:
    - draft or pending indicator is visible
  visible_success:
    - source message exposes an Issue affordance
    - Issue detail shows title, status, and source message context
  visible_failure:
    - no Issue affordance is shown as accepted
    - draft or input is recoverable
    - retry or cancel is available

state_ownership:
  server_truth:
    - Issue
    - source message link
  local_interaction_state:
    - drawer
    - draft
    - pending mutation
  remote_data_state:
    - channel projection
    - issue projection
  async_command_state:
    - create issue mutation lifecycle
  realtime_state:
    - optional issue-created projection notification
  url_state:
    - optional issue deep link
  derived_view_model:
    - issue affordance visible on source message

data_contract:
  command_intents:
    - create_issue_from_message
  projection_reads:
    - channel projection
    - issue projection
  mutation_ack: issue_id
  invalidation_or_backfill: channel and issue projection
  idempotency_key: optional clientMutationId

coverage_intent:
  required_levels:
    - interface_headless
    - render_wiring
    - browser_visible
  optional_levels:
    - realtime_patch
    - mobile_layout

forbidden_paths:
  - frontend_cache_authority
  - fake_success_chip_without_server_ack
  - internal_terms_in_default_ui

agent_freedom:
  may_choose_test_runner: true
  may_choose_browser_tool: true
  may_add_stable_testids: true
  may_reduce_visual_assertions_to_functional_layout: true

promotion_gate:
  accepted_when:
    - headless proof passes
    - browser harness proves visible success and reload consistency
    - not_claimed recorded
```

Keep the DSL thin. If a field can be derived from source, tests, or route code,
do not encode it unless it is part of the contract.

## Optional Context Blocks

Use these as claim-triggered additions, not default template fields. Add one only
when the current claim depends on it:

```text
execution_context
  Known role, tenant, auth, flags, environment, or data mode.
  If authority is missing, record a gap or stop; do not invent permission rules.

render_runtime_context
  SSR, RSC, hydration, loader, or server/client cache boundary.
  Use when rendering mode changes what the frontend can honestly prove.

client_persistence_state
  Local DB, draft persistence, offline queue, conflict, tab concurrency, or retry
  after reload. Pair durable sync or conflict facts with headless/product proof.

visibility_assertions_or_refs
  Sensitive fields, redaction, role-visible fields, or hidden internal terms.
  Reference authority where security or privacy policy is involved.

performance_claim
  Interaction readiness, mutation feedback, realtime latency, or large lists.
  Use only when the claim includes responsiveness or throughput expectations.
```

## Concept And Label Mapping

When internal, product, user-facing, UI, or frontend names differ, include:

```text
Canonical Concept | Product Meaning | User-facing Label
Surface / Route / Region | Frontend Name Hint | Authority
```

The mapping may expose naming gaps, but it must not rewrite SSoT, product
meaning, architecture names, or code naming standards by itself.

## Visual Constraints

Visual work is secondary to interface capability. Include it when it affects:

- user comprehension;
- information hierarchy;
- action reachability;
- accessibility;
- layout-critical behavior;
- repeated workbench ergonomics;
- asset needs.

Do not produce full brand strategy, moodboards, generated images, or final
design-system authority unless the user explicitly asks and the correct
downstream skill/tool is invoked.

## Quality Gate

The planning work is complete when another agent can answer:

```text
What capability is being planned?
Where does the user do it?
What state changes?
Which state owner owns each piece?
What must be visible in pending, success, failure, and recovery?
Which headless proof is needed?
Which UI harness level is required?
What is explicitly not claimed?
```

If any answer depends only on the planner's imagination, mark it as an open
question or `status: sketch`.
