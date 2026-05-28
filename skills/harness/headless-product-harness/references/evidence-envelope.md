# Evidence Envelope

Use this reference when defining JSON/JSONL output for headless proof commands.

## Success Envelope

```json
{
  "ok": true,
  "command": "smoke offline-import",
  "target_slice": "offline-import-core",
  "evidence": {
    "profile_loaded": true,
    "normalized_evidence_records_created": true
  },
  "claims": {
    "browser_ui_claim": false,
    "real_runtime_claim": false
  }
}
```

## Failure Envelope

```json
{
  "ok": false,
  "command": "source analyze",
  "error": {
    "code": "SOURCE_FILE_NOT_FOUND",
    "message": "source file does not exist"
  },
  "next_action": "check --source path or run source inventory"
}
```

Failure must return non-zero. Do not print uncaught stack traces, bare errors,
HTML, color logs, or mixed human prose as the default agent-facing output.

## JSONL Long Runs

Use JSONL only when the command streams progress. The final line must be a
terminal summary with `ok`, `command`, `target_slice`, `evidence`, and `claims`.

## Evidence Tokens

Evidence should be machine-readable and grep-friendly:

```text
target_slice=channel-realtime
snapshot_received=true
incremental_event_received=true
terminal_summary_seen=true
browser_ui_claim=false
```

Tokens may appear inside JSON fields or structured logs. They must reflect work
actually executed by the command.

Positive tokens require an executed path. Do not print a token for a state that
was assumed, skipped, hardcoded, or only described in a report. If a check is
manual, mark it as manual evidence and keep the claim_limit explicit.

## Not Claimed

Include non-claim tokens whenever adjacent surfaces are easy to overclaim:

```text
browser_ui_claim=false
db_claim=false
scheduled_sync_claim=false
runtime_mapping_ui_claim=false
real_runtime_claim=false
product_completion_claim=false
```

Non-claim tokens are not decoration. Emit one only when the command
actually checked or structurally bounded that surface. If the command did not
check the boundary, put it in `not_proven` or the report boundary instead of
printing a false token.

A non-claim limits what later agents may inherit from the evidence. It does not
prove product failure; it only says the current command did not prove that
surface. Existing schema fields may still be named `negative_claims`; the
human-facing concept is `not_claimed`.
