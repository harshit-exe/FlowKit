# Development workflows

## Resilient REST API Sync

`resilient-rest-api-sync.json` is a credential-free n8n workflow for pulling
records from a REST API with bounded retries, required-field validation, and a
sanitized failure output.

- Demo source: JSONPlaceholder; no account or credential is required.
- Success path: normalizes records and reports missing required fields.
- Failure path: emits a retryable error record while redacting common secret
  patterns.
- Production setup: replace the demo URL, select an n8n credential, configure
  required fields, and connect both success and failure outputs.

The workflow was runtime-tested on n8n 2.31.5 through both its successful demo
and a forced request failure. It is contributed by
[BlaidLink Labs](https://github.com/BlaidLink/blaidlink-n8n-reliability-starters).
