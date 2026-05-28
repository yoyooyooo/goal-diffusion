# Harness Claim Ceilings

A harness may support a claim only up to the level it actually exercised.

## Default Levels

```text
headless_product
  May claim bounded product facts, projection facts, idempotency, persistence,
  adapter mapping, or runtime behavior depending on the proof level.

interface_headless
  May claim frontend state/cache/router/realtime/view-model behavior without
  full UI rendering.

render_wiring
  May claim UI controls and visible states are wired to the intended frontend
  boundary.

browser_visible
  May claim a user-visible browser path is reachable, operable, reloadable, and
  free of checked console/network failures for the bounded scenario.

production_near
  May claim local or staged acceptance only for the bounded scenario and only
  when paired with the needed backend/runtime evidence.
```

## Claim Ceiling Shape

Use this shape in durable harness artifacts and evidence records:

```yaml
claim_ceiling:
  level: headless_product | interface_headless | render_wiring | browser_visible | production_near
  headless_sublevel: null | boundary | offline_fixture | replay | adapter | projection | db_backed | real_runtime_opt_in
  environment: local | test | staged | production
```

`headless_sublevel` is set only when `level: headless_product`.

## Not Claimed

Use `not_claimed` tokens to prevent over-reporting.

```text
business_fact_claim=false unless paired with headless product proof
browser_ui_claim=false unless browser-visible proof ran
render_wiring_claim=false unless render-wiring proof ran
interface_headless_claim=false unless frontend boundary proof ran
frontend_cache_authority=false
realtime_event_authority=false
optimistic_state_is_business_fact=false
final_visual_design_claim=false unless explicitly reviewed
production_auth_claim=false unless auth was part of the proof
production_data_claim=false unless production or production-like data was used
```

## Reporting Rule

Every closeout or evidence record should include:

```text
claim_ceiling:
positive_tokens:
not_claimed:
not_proven:
status:
```

If a stronger claim is desired, route to the harness layer that can honestly
prove it instead of stretching the current proof.
