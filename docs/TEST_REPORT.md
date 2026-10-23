# Stage 2 — Initial Automated Test Report

**Scope:** API request handling and response normalization in `lib/outreach.ts`.

**Execution:** Node.js v22.16.0, built-in `node:test` runner and `--experimental-strip-types`.

**Command:** `node --experimental-strip-types --test --experimental-test-coverage tests/*.test.mjs`

**Local result (before GitHub upload):** 10 passed, 0 failed, 1 skipped (live integration requires a configured webhook), 2 TODO regression cases.

**Coverage of `lib/outreach.ts` (local copy):** 100% lines, 90% branches, 85.71% functions. These figures do not represent total frontend or n8n coverage.

**Covered:** payload/method/headers, successful result, JSON string/array/text wrappers, malformed wrappers, empty arrays, HTTP 503, network errors, abort handling, label formatting.

**Not yet covered:** React form/UI tests, live n8n integration execution, real timer expiry, acknowledgment-only response rejection, and removal of test webhook fallback. The two latter behaviors are explicitly marked TODO because the current application accepts an acknowledgment and has a hardcoded test endpoint fallback.

**Run live integration:** `RUN_N8N_INTEGRATION=1 N8N_INTEGRATION_WEBHOOK_URL=https://YOUR-N8N-HOST/webhook/YOUR-ID node --experimental-strip-types --test tests/n8n.integration.test.mjs`.

**Caution:** The live integration test can trigger Slack notifications and Google Sheets writes. Use a test environment or safe test routing.

**Status:** Tests executed locally on a copy of the checked-in API module. No live n8n calls have been made. The branch upload does not establish a CI run or deployed integration verification.
