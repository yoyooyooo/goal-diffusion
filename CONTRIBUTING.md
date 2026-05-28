# Contributing

Use Bun for all local development.

```bash
bun install
bun run check
```

Before opening a change:

- keep CLI source in `packages/cli/src/`;
- keep skill material in `skills/goal/goal-proof/`;
- update README or skill references when command names, paths, or Goal Pack
  fields change;
- add or update tests for CLI behavior changes;
- run `bun run check`.

Do not rewrite historical `evidence.jsonl` entries in real Goal Packs. Append a
new evidence record when evidence or interpretation changes.
