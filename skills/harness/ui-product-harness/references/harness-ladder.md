# Harness Ladder

Use the smallest harness that can honestly prove the current claim.

## interface_headless

No full component render. Use for:

- DTO -> view model;
- event -> reducer;
- command intent -> request payload;
- mutation lifecycle -> optimistic / ack / rollback;
- cache patch / invalidation / backfill;
- local interaction store transitions;
- router model / URL state derivation;
- realtime decode / dedupe / cursor / gap / reconnect.

Typical evidence:

```text
view_model_mapping_verified=true
optimistic_ack_reconciled=true
duplicate_event_deduped=true
gap_triggers_backfill=true
local_store_does_not_hold_server_truth=true
```

Claim ceiling:

```text
interface_headless_passed=true
browser_ui_claim=false
business_fact_claim=false unless paired with headless proof
```

## render_wiring

Thin component or render test. Use for:

- button/input/menu wires the right UI intent;
- accessible name / role exists;
- pending, disabled, error, empty, success states render;
- local state resets on subject switch;
- no internal-only terms leak into default UI;
- critical affordance is reachable without relying on final visual polish.

Typical evidence:

```text
intent_command_wired=true
accessible_affordance_present=true
pending_state_visible=true
error_recovery_visible=true
internal_terms_default_hidden=true
```

Claim ceiling:

```text
render_wiring_passed=true
reload_consistency_claim=false
production_near_claim=false
```

## browser_visible

Real page in a browser. Use for:

- complete user path through visible controls;
- console / React / hydration errors;
- failed network requests;
- reload/deep-link consistency;
- critical layout: fixed composer, drawers, modals, keyboard/focus, mobile;
- screenshot or video evidence for UX regressions;
- exploratory dogfood before a stable regression test exists.

Typical evidence:

```text
browser_visible_path_passed=true
reload_consistent=true
console_errors=false
network_failures=false
critical_layout_passed=true
```

Claim ceiling:

```text
browser_visible_passed=true
business_fact_claim=false unless paired with headless proof
final_visual_design_claim=false
```

## production_near

Real backend/DB/runtime or local production-like stack. Use only when the claim
requires real integration.

Typical evidence:

```text
production_near_stack_started=true
real_backend_used=true
db_projection_backed=true
real_runtime_opt_in_used=true
browser_visible_path_passed=true
headless_proof_ref_verified=true
```

Claim ceiling must name the environment and exclusions. Do not infer
production deployment, production auth, distribution, or public availability
from a local production-near harness.

## Lifecycle

Use the shared lifecycle statuses:

```text
candidate    useful but not a regression gate
accepted     stable enough for implementation guidance
regression   must run in CI or release gate
retired      replaced by equivalent coverage or intentionally removed
```

Promote only when the scenario has stable subjects, stable entrypoint semantics,
paired authority proof where needed, and low flake risk.
