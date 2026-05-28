# Adapter Discovery

Use this checklist to map the generic UI harness language to the host project.

## Discovery Questions

Find these owners before designing tests:

```text
What sends user intents?
What owns local interaction state?
What owns remote data cache?
What owns async command/mutation lifecycle?
What owns realtime events, cursor, dedupe, gap, reconnect?
What owns URL/resource state?
Where are view models or mappers derived?
What component layer dispatches intent?
What browser tool or E2E harness already exists?
What headless proof command proves the same product facts?
```

## React-Oriented Notes

For React projects, inspect:

- hooks that run commands or mutations;
- query key factories and invalidation points;
- store slices or reducers;
- realtime client / subscription boundary;
- route loaders and route params;
- view-model mappers;
- thin render components and accessibility roles;
- error boundaries and loading states.

React-specific risks:

- unstable effect dependencies causing render loops;
- StrictMode duplicate side effects;
- external store updates during render;
- stale closures after route/subject switch;
- async completion after unmount;
- local state keeping old subject detail open.

## Query / Cache Notes

For any remote data cache:

- keys must be stable and centralized where the stack supports it;
- mutation ack should reconcile optimistic state by stable id or idempotency key;
- success should invalidate or patch the right projections;
- failures should roll back or preserve recoverable local input;
- stale cache must not be reported as accepted fact when authority is uncertain;
- cross-query changes should prefer invalidate/backfill over broad hand patches.

## Realtime Notes

Realtime harnesses should cover:

- decode failure -> diagnostic only;
- duplicate event -> no duplicate visible item;
- missing cursor/gap -> backfill/invalidate;
- terminal event -> does not necessarily close the subscription;
- reconnect -> visible state and backfill where required;
- unknown event -> no invented facts.

## Browser Tool Notes

Use browser automation to inspect what smaller tests cannot:

- user reachability;
- focus and keyboard path;
- reload/deep link;
- console and network;
- actual layout and viewport;
- screenshots/videos for repro.

Prefer agent-friendly accessibility roles or stable test ids for harness
anchors. Do not use fragile selectors when the contract can be expressed by
role, label, text, or semantic test id.
