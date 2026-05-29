# Realtime Capability

Use this reference when a frontend task mentions WebSocket, SSE, subscriptions,
streams, live updates, cursor, gap recovery, realtime events, or projection
notifications.

## Core Principles

```text
Fact authority != realtime delivery
Realtime transport != React hook
Runtime lifecycle != feature logic
Feature adapter != business fact owner
```

Realtime delivery wakes or updates the frontend. It does not create product
truth. Business facts belong to the authority layer named by the host project:
domain/application, durable store, accepted projection, or a backfill endpoint.

## Decision Tree

1. Is this a business fact or durable truth?
   - Yes: put it in the authority/backend/projection/backfill source.
   - No: continue.
2. Is this realtime delivery or subscription capability?
   - Yes: put the contract, live/fake implementation, transport, decode, error,
     retry, cancellation, and close semantics in `packages/client`.
   - No: continue.
3. Does the transport have resource lifecycle?
   - Yes: default to Effect runtime/service/Layer/Scope or the repo's equivalent
     runtime boundary. Do not hide it in React.
4. Is this feature-level event consumption?
   - Yes: put envelope -> reducer/cache/store adapter logic in
     `<feature>.realtime.ts`.
5. Is this React lifecycle glue?
   - Yes: the hook may subscribe/unsubscribe with an injected client contract.
     It must not create WebSocket/EventSource, live client, config, or runtime.
6. Is this user-visible state?
   - Yes: derive it through Query cache, local interaction store, view-model, and
     surface boundaries. Do not treat realtime events as facts.

## Ownership Map

```text
authority layer
  owns business facts, durable projection, and HTTP/backfill source

contract/generated layer
  owns typed realtime envelope, event DTO, cursor, gap and error shape

packages/client
  owns realtime capability contract, transport live/fake, decode/assert,
  retry/timeout/cancel/close, normalized errors, and host variants

app
  owns config, runtime, live client construction, and dependency injection

features/<feature>/<feature>.realtime.ts
  owns event -> reducer/cache/store adapter and pure reduction rules

React hook
  owns mount/unmount glue only

Query / local store / view-model / surface
  own server projection cache, local interaction state, derived display model,
  and visible controls
```

## Standard Subscription Shape

Use capability-specific names in real code. This shape shows the boundary:

```ts
export type Subscription = {
  close: () => void;
};

export type RealtimeHandlers<TEnvelope> = {
  onEnvelope: (envelope: TEnvelope) => void;
  onDecodeError?: (error: unknown) => void;
  onClose?: () => void;
};

export type ChannelClient = {
  fetchProjection(channelId: string): Promise<ChannelProjectionDto>;
  sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
  subscribeProjection(
    input: { channelId: string; cursor?: string | null },
    handlers: RealtimeHandlers<ProductRealtimeEnvelopeDto>
  ): Subscription;
};
```

React lifecycle glue should look like this:

```ts
useEffect(() => {
  const subscription = client.subscribeProjection({ channelId, cursor }, handlers);
  return () => subscription.close();
}, [client, channelId, cursor, handlers]);
```

The hook may choose when to subscribe and when to close. It must not own the
transport or live implementation.

`handlers` must be stable. Use `useMemo` / `useCallback`, or keep the latest
handler implementation in refs while the subscription dependency list stays tied
to the subscription identity. Do not reconnect on every render just because a
handler object was recreated.

## Reduction Rules

Feature realtime adapters should reduce typed envelopes, not transport frames.

```text
envelope + current cache/local snapshot
  -> decode/assert already completed or failed
  -> dedupe by event id when available
  -> cursor/requiresBackfill/gap check
  -> small patch or invalidate/backfill
  -> local connection UI state update
```

On decode failure, cursor gap, permission mismatch, unknown event type, or shape
drift, prefer invalidate/backfill over local invention.

## Forbidden Patterns

- React component creates `new WebSocket()` or `new EventSource()`.
- Hook creates live client, Effect Layer, runtime, or reads env/config.
- Hook reconnects on every render because handlers are not stable.
- Feature `.realtime.ts` imports transport or creates a module-level live
  singleton.
- Store keeps server truth, DTO mirrors, or canonical domain facts.
- Realtime event, WebSocket frame, relay frame, daemon ack, or runtime stdout is
  reported as business fact.
- Fake client is used as a production fallback.
- Missing events are reconstructed locally instead of backfilled from authority.

## Testing Requirements

Prefer fake subscription tests before browser-level transport tests.

Minimum cases for a realtime capability:

```text
fake stream emits event -> cache/store reduction happens
duplicate event id -> no duplicate visible item
requiresBackfill / gap -> invalidate or backfill, no invented facts
decode failure -> diagnostic/recoverable state only
close/unmount -> subscription closes
fake client covers success/error/gap/close paths
```

Browser-visible and production-near proof belong to UI/product harness workflows.
This reference only fixes architecture boundaries.
