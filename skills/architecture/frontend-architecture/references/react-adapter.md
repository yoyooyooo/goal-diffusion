# React Adapter

## Default Capability Slots

The default stack is:

```text
React + TanStack Router/Start + TanStack Query + Zustand + Effect + Oxc
```

These are default implementations of capability slots, not permanent laws. Replacements need an ADR or repo adapter that proves equivalent capability.

| Slot | Default | Replacement must prove |
| --- | --- | --- |
| Route adapter | TanStack Router/Start | params/search ownership, loader/action/prefetch, route context, error boundary |
| Server-state cache | TanStack Query | query key, invalidation, mutation lifecycle, SSR/dehydrate strategy when relevant |
| Local interaction state | Zustand | feature ownership, reset/isolation, testability, no server truth |
| Effect/runtime boundary | Effect | DI, fake replacement, typed errors, timeout/retry/cancel, resource lifecycle |
| Typed gateway | `packages/client` | cross-host use, DTO decode/assert, normalized errors, no React/UI |
| UI primitives | `packages/ui` or `shared/ui` | business-neutral primitives, token use, source-only package boundary |
| Format/lint | Oxc | formatter/linter coverage and speed |
| Typecheck | `tsc --noEmit` | TypeScript authority |
| Tests | Vitest default, Bun test allowed by adapter | unit, headless, surface, layout, e2e where needed |
| Boundary check | custom semantic script first | import graph, forbidden names, production/test split |

## React Ownership

React owns component tree, render lifecycle, and event handlers. It does not own backend capabilities or runtime dependency assembly.

Do not put these in React components:

- `Effect.runPromise`;
- `new WebSocket` / `new EventSource`;
- live client construction;
- config/env reads;
- DTO decode policy;
- Query key string literals;
- server truth mirrors in local state.

## Query

Feature `.query.ts` owns TanStack Query options and optional hooks.

Preferred shape:

```ts
export function channelProjectionQueryOptions(
  client: ChannelClient,
  channelId: string
) {
  return queryOptions({
    queryKey: channelKeys.projection(channelId),
    queryFn: () => client.fetchProjection(channelId)
  });
}

export function useChannelProjectionQuery(client: ChannelClient, channelId: string) {
  return useQuery(channelProjectionQueryOptions(client, channelId));
}
```

This lets routes prefetch and headless harnesses call the same query semantics without rendering the final UI.

## Mutation / Command

Feature `.query.ts` also owns mutation options for async commands. Mutation
options should consume client contracts and receive local interaction callbacks
as explicit dependencies. They must not create live clients, read config, or run
Effect directly.

Preferred shape:

```ts
export function sendChannelMessageMutationOptions(deps: {
  client: ChannelClient;
  channelId: string;
  addPendingEcho: (echo: PendingEcho) => void;
  reconcilePendingEcho: (clientMutationId: string) => void;
  failPendingEcho: (clientMutationId: string) => void;
  invalidateProjection: () => void | Promise<void>;
}) {
  return {
    mutationFn: (command: ComposerCommand) => deps.client.sendMessage(command),
    onMutate: (command: ComposerCommand) => {
      deps.addPendingEcho(commandToPendingEcho(command));
    },
    onSuccess: (accepted: SendMessageAccepted) => {
      deps.reconcilePendingEcho(accepted.clientMutationId);
      void deps.invalidateProjection();
    },
    onError: (_error: unknown, command: ComposerCommand) => {
      deps.failPendingEcho(command.clientMutationId);
    }
  };
}
```

The React hook is a thin adapter:

```ts
export function useSendChannelMessageMutation(client: ChannelClient, channelId: string) {
  const queryClient = useQueryClient();
  const addPendingEcho = useChannelStore((state) => state.addPendingEcho);
  const reconcilePendingEcho = useChannelStore((state) => state.reconcilePendingEcho);
  const failPendingEcho = useChannelStore((state) => state.failPendingEcho);

  return useMutation(
    sendChannelMessageMutationOptions({
      client,
      channelId,
      addPendingEcho,
      reconcilePendingEcho,
      failPendingEcho,
      invalidateProjection: () =>
        queryClient.invalidateQueries({ queryKey: channelKeys.projection(channelId) })
    })
  );
}
```

Headless harnesses can call the options factory with a fake client and fake
callbacks to verify command trace without rendering the final UI.

## Store

Zustand stores only local interaction state.

Allowed:

- draft;
- drawer target;
- local selected panel/filter/tab;
- pending echo;
- local connection UI state;
- viewport/scroll interaction state.

Forbidden:

- server projection truth;
- DTO mirror;
- canonical domain facts;
- fetch/mutation side effects;
- realtime connection ownership.

If state can be derived from server projection and local interaction state, derive it in a mapper or view-model.

## Realtime

`packages/client` owns realtime transport and subscription capability.

Feature `.realtime.ts` adapts subscription events into Query cache, reducer state, and local interaction state. It does not construct WebSocket or live clients.

Keep reducers pure where possible:

```text
envelope + current projection/cache snapshot -> reduction
reduction -> cache patch or invalidate + local UI state update
```

On cursor gap, decode failure, permission mismatch, or shape drift, prefer backfill/invalidate over complex manual patching.

React hooks are lifecycle adapters only. A hook may subscribe through an injected
client contract and close the subscription on unmount. It must not create
WebSocket/EventSource, Effect runtime, live client, config, or transport.

Recommended shape:

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

```ts
useEffect(() => {
  const subscription = client.subscribeProjection({ channelId, cursor }, handlers);
  return () => subscription.close();
}, [client, channelId, cursor, handlers]);
```

`handlers` must be referentially stable. Build them with `useMemo` /
`useCallback`, or use a stable-ref adapter inside the hook so ordinary renders
do not reconnect the subscription.

For detailed decision rules, read [Realtime Capability](realtime-capability.md).

## Effect Integration

Effect belongs at the boundary:

- `packages/client`: service, Tag, Layer, live/fake, request/realtime, errors, timeout/retry/cancel;
- `app`: runtime wiring, provider/context injection, config selection;
- `features`: consume client contracts through props/context/query options.

Feature code should not import `app/runtime`. The app creates the live client and route/provider context passes the contract downward.

Bad:

```ts
import { appConfig } from "../../app/env";
import { runAppEffect } from "../../app/runtime";

queryFn: () => runAppEffect(fetchProjectionEffect(appConfig, channelId));
```

Good:

```tsx
function ChannelRoute() {
  const { client } = Route.useRouteContext();
  const { channelId } = Route.useParams();
  return <ChannelPage channelId={channelId} client={client.channel} />;
}
```

## Page And Surface

`.page.tsx` is the feature container. It can connect query/store/realtime, build view-model, and create event glue.

`.surface.tsx` is the harnessable surface. It consumes view-model and callbacks. It can import same-feature child surfaces and `shared/ui`, but it should not import query/store/client/realtime.

This split lets teams build headless proof and surface tests before final UI/UX settles.

## Route Adapters Across Frameworks

Keep the rule framework-neutral:

```text
route adapter owns URL boundary
feature owns capability UI logic
client owns backend/runtime capability access
```

TanStack Router/Start:

- route loader/beforeLoad parses params/search;
- route context carries queryClient/client;
- loader uses feature query options for prefetch.

Next.js App Router:

- route segment/page/layout parses params/searchParams;
- server component may fetch, but feature view-model logic should not be buried in route files;
- client components receive stable props, dehydrated data, or client contracts through an adapter;
- server actions still map to capability clients rather than ad hoc fetch code.

Remix/React Router:

- loader/action owns params/search/form boundary;
- route module calls feature query/action adapters.

## Harness Readiness

Before final UI/UX, the minimum headless UI harness object is:

```text
view-model + command trace
```

A headless proof can validate:

- fixture/fake client input;
- query options and mutation command;
- local store transition;
- realtime reducer/cache effect;
- view-model state and available actions;
- command trace and invalidation.

Browser-visible proof and screenshot/viewport matrix belong to UI harness skills. This skill ensures the code structure can support those proofs.

Route harness work by owner:

- frontend structure, suffixes, imports, client/query/store/realtime/surface
  split -> this skill;
- interface-headless, render-wiring, browser-visible evidence envelope ->
  `ui-product-harness`;
- Harness Scenario / Fixture / Coverage Matrix / lifecycle / claim ceiling ->
  `product-harness-system`;
- command/smoke/evidence envelope for product facts ->
  `headless-product-harness`.
