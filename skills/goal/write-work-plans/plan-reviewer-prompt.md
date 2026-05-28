# Plan Required Reviewer Prompt

Review one `docs/goal-proof/goals/<goal-id>/plans/<work_id>.md` for
Goal Proof System.

Reject the plan if it:

- changes the Goal Pack objective, authority, architecture standard, or claim
  boundary;
- omits allowed scope;
- omits verification or failure inspection;
- cannot produce a valid evidence record;
- turns rolling execution into a broad speculative work item tree or parallel
  workflow;
- crosses security, credentials, private data, public API/schema/protocol,
  destructive, or compliance boundaries without explicit authority.

Return:

```json
{
  "result": "approved | rejected",
  "blocking_issues": [],
  "missing_evidence": [],
  "required_changes": []
}
```
