# Gayiti Module 6 — Testing Report (Path 1)

## Project and scope
AI Outreach Console is a Next.js frontend integrated with an n8n/Gemini multi-agent workflow. The test suite focuses on `lib/outreach.ts`, the frontend API boundary. It does not cover the complete UI or all n8n nodes.

## Evidence from initial local run (before regression fixes)
- **10 passing tests; 0 failing tests.**
- **1 skipped live n8n integration test; 2 TODO regression cases** at that time.
- **100% line coverage, 90% branch coverage, 85.71% function coverage** for the original API module, not for the full project.
- Node.js 22.16.0, built-in `node:test` runner.

## Changes since initial run
Two reliability defects were addressed on `test/stage-2-api-coverage`:
1. The frontend now rejects acknowledgment-only or incomplete responses unless nonempty `summary`, `outcome`, and `next_action` are present.
2. `NEXT_PUBLIC_N8N_WEBHOOK_URL` must explicitly identify an HTTP(S) production webhook; the hardcoded test-webhook fallback was removed.

Two corresponding regression tests replaced the original TODO cases. **The revised suite has not been rerun and no updated coverage percentage is available.** Do not treat the original coverage as evidence for the revised module.

## Production verification
On October 27, 2026, the project owner reported a **successful manual production test** of the deployed application and n8n workflow. This is user-reported manual end-to-end verification, not an automated integration-test execution or independent audit.

## How to run tests locally
From the repository root, using Node.js 22+:

```bash
npm ci
node --experimental-strip-types --test --experimental-test-coverage tests/outreach.test.mjs
```

To opt into a live n8n integration test (may trigger Slack or Google Sheets side effects):

```bash
RUN_N8N_INTEGRATION=1 N8N_INTEGRATION_WEBHOOK_URL=https://YOUR-N8N-HOST/webhook/YOUR-ID node --experimental-strip-types --test tests/n8n.integration.test.mjs
```

## CI configuration
`.github/workflows/test.yml` defines a job to install dependencies, run unit tests with coverage, and build Next.js on pull requests and configured pushes. **No successful CI execution has been verified.** The user elected to submit without CI verification.

## Outstanding limitations
- No measured post-fix coverage report or verified post-fix test execution.
- Live automated n8n integration test not executed.
- No React form or result-view component test coverage.
- Production deployment uses `main`, while the reliability fixes and tests are on a separate branch (draft PR #4).
- Production environment must configure `NEXT_PUBLIC_N8N_WEBHOOK_URL` before merging the changes.

## Submission references
- Production: https://gayiti.ralphydumera.com
- Tests: https://github.com/ralphy89/gayiti_voice_agent/tree/test/stage-2-api-coverage/tests
- Draft PR: https://github.com/ralphy89/gayiti_voice_agent/pull/4
