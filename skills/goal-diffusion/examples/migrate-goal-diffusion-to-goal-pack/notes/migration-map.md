# Self Migration Map

This Goal Pack validates the vNext model by migrating Goal Diffusion itself.

## Source Material

- Existing `skills/goal-diffusion/SKILL.md`
- Existing phase skills under `skills/*/SKILL.md`
- Existing routing references
- Handoff discussion that approved Goal Pack, harnessed edges, append-only
  receipts, checker gate, and continuation by default.

## Mapping

| Previous route | Current role |
|---|---|
| goal plan | contract phase |
| first path brief | edge phase |
| rolling implementation | run phase |
| detailed implementation plan | plan_required phase |
| report | receipt plus optional note |
| run state | `state.yaml` |
| source/proposal/seed material | `inbox/` or `sources/` |

## Completion Evidence

The migration is complete only when:

- the checker validates this Goal Pack;
- the public skill points to Goal Pack operation;
- phase skills no longer act as competing user workflows;
- routing references describe inbox, sources, Goal Packs, receipts, and optional specs;
- final audit receipt sets `oracle_satisfied: true`.
