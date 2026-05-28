# Frontend Boundary Model

Use this model before choosing concrete testing tools or framework adapters.

## State Ownership Taxonomy

Classify every UI-related state into one of these categories:

| Category | Owns | Must Not Own |
|---|---|---|
| UI intent | User command meaning, e.g. submit, create, retry, open detail | business fact completion |
| Local interaction state | draft, selected item, open drawer, hover, tab, pending local affordance | server truth, domain status, durable facts |
| Remote data state | server projection cache, request lifecycle, stale/invalidate/backfill | canonical backend/domain facts |
| Async command state | mutation lifecycle, optimistic echo, retry/cancel, idempotency key | accepted fact unless acknowledged by authority |
| Realtime event state | decoded event, cursor, connection, dedupe, gap detection | business truth by itself |
| URL/navigation state | resource identity, shareable view state, deep link | transient draft, hover, non-shareable UI detail |
| Derived view model | display-ready projection from accepted inputs | wire contract or product authority |
| Render wiring | controls, roles, labels, intent wiring, visible state | business logic |
| Browser-visible proof | actual reachability, layout, console/network, reload, focus | domain proof without paired headless evidence |

## Boundary Rules

- The frontend sends intents and consumes projections. It does not own product
  truth.
- Optimistic UI may show pending state, not accepted fact.
- Realtime messages are notifications. Decode, dedupe, gap-check, then patch or
  backfill. If continuity is uncertain, do not invent missing facts.
- View models are derived projections. They may be pure-function tested, but
  they do not define the backend contract.
- Components should render and wire intent. Put long-lived state,
  side-effects, query/cache logic, and realtime reducers outside thin render
  components where the host architecture allows.

## Project Adapter Mapping

Do not assume a specific stack. Find the project's owners:

```text
local interaction state:
  Zustand | Redux | signals | XState | component reducer | custom store

remote data state:
  TanStack Query | Apollo | SWR | RTK Query | custom repository

async command state:
  mutation hook | action adapter | command service | Effect program

URL/navigation state:
  TanStack Router | React Router | Next router | native route model

realtime state:
  WebSocket client | SSE client | subscription link | event bus
```

Test against the role, not the library name.

## Anti-Patterns

- Local store stores server truth.
- Cache data is reported as product completion without refetch/backfill or
  backend proof.
- Component tests duplicate domain tests.
- Browser tests are the only place mutation/realtime races are tested.
- UI harness asserts pixels or DOM tree shape when the contract only needs
  reachability, role, or functional layout.
