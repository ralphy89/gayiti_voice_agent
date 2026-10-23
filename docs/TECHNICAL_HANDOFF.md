# AI Outreach Console — Technical Handoff

**Project:** Gayiti AI Fellowship · Production Prototype / Demo Day  
**Live application:** https://gayiti.ralphydumera.com  
**Source repository:** https://github.com/ralphy89/gayiti_voice_agent  
**Primary workflow export:** `Voice_Agent_workflow.json`  
**Status:** Prototype; production deployment and the checked-in workflow export must be reconciled before another engineer relies on the export as the deployed version.

## 1. Purpose and scope

AI Outreach Console gives an operator a browser-based interface to submit customer outreach context and inspect the results of an LLM-simulated outbound conversation. It does **not** place real phone calls. The frontend is built with Next.js and TypeScript; n8n coordinates simulation, four specialized agents, deterministic validation/combination, and Slack/Google Sheets routing.

The repository includes the Next.js frontend and an n8n JSON export. The main README contains the agents' full prompts, schemas, and fallback logic; treat it as the detailed agent reference rather than duplicating those prompts here.

## 2. Repository map

| Path | Responsibility |
| --- | --- |
| `app/page.tsx` | Renders the outreach console. |
| `components/outreach-console.tsx` | Input form, validation, progress feedback, error and results UI. |
| `lib/outreach.ts` | TypeScript request/result types, POST to n8n, timeout, response normalization. |
| `app/layout.tsx`, `app/globals.css` | App shell and global styles. |
| `Voice_Agent_workflow.json` | Checked-in n8n workflow export. |
| `README.md` | Product overview, setup and full multi-agent documentation. |
| `package.json` | Next.js scripts and dependencies. |

## 3. System architecture

```text
Operator → Next.js browser UI
                 │ POST JSON
                 ▼
             n8n Webhook
                 │
       Validation / call simulation
                 │
         ┌───────┴───────┐
         ▼               ▼
      Classifier      Extractor
         └───────┬───────┘
                 ▼
               Reasoner
                 ▼
               Composer
                 ▼
          Combiner (Code)
                 ▼
           Interest routing
          /                \
      Slack            Google Sheets
```

**Important export discrepancy:** In the checked-in `Voice_Agent_workflow.json`, the valid-input branch reaches **`Respond for good data`**, which returns `{"message":"Workflow has started"}` **before** the simulation/agent chain. There is no final `Respond to Webhook` node connected after Slack/Google Sheets in that export. Consequently, the exported workflow does **not** document a final synchronous result returned to the browser, even though the project README describes that behavior. Confirm the deployed n8n workflow and re-export its current version before relying on end-to-end result handling. Do not treat the diagram above as proof of the current response path.

The export also contains a **disabled** Vapi HTTP request node retained from an earlier voice integration attempt.

## 4. Frontend → workflow contract

`lib/outreach.ts` sends a `POST` with `Content-Type: application/json` and the following fields:

```json
{
  "name": "Example Contact",
  "email": "contact@example.com",
  "phone": "+15550123456",
  "business_name": "Example Business",
  "service": "Policy renewal",
  "call_reason": "Discuss upcoming renewal",
  "context": "Existing customer with a renewal due soon",
  "preferred_language": "English"
}
```

The frontend's `OutreachResult` type supports top-level `call_status`, `outcome`, `interest_level`, `callback_time`, `summary`, `next_action`, `transcript`, plus nested `classification`, `extraction`, `decision`, and `response`. The response parser accepts a JSON object, the first element of a JSON array, or a JSON string inside a `text` property. The frontend expects an HTTP success response containing usable JSON; a start-only acknowledgment is not equivalent to the full agent result.

### Configuration

`lib/outreach.ts` reads **`NEXT_PUBLIC_N8N_WEBHOOK_URL`**. Configure it in `.env.local` for development and in the deployment environment for production. The checked-in code falls back to a **`webhook-test`** URL if the variable is absent; that is a reliability risk and should be replaced with a fail-fast configuration error or a deliberately configured production endpoint. Because this variable is public in browser JavaScript, never store a secret in it. Configure CORS appropriately on the webhook endpoint.

The client aborts a request after **180 seconds** and reports request errors. This is a client-side timeout, not an n8n execution timeout.

## 5. n8n workflow responsibilities

1. **Webhook / Prepare contact Data / validation IF:** receive and prepare the submission, then branch on validation.
2. **Outbound call simulation:** use an LLM to simulate an outreach conversation (rather than making a real call).
3. **Classifier and Extractor:** evaluate interest/outcome and extract customer details; the checked-in workflow merges their validated outputs.
4. **Reasoner:** recommend an action and priority.
5. **Composer:** generate customer-facing text and follow-up indication.
6. **Combiner:** consolidate results into a structured payload with fallback logic.
7. **High interest?:** send high-interest cases to Slack; route other cases to Google Sheets.

The workflow export uses Google Gemini model nodes, Slack OAuth, and Google Sheets integration. Credentials are managed in n8n; they should not be embedded in frontend code or committed to GitHub. The export references a specific Slack channel and spreadsheet; verify those targets in the deployed n8n environment before reusing it.

**Export-specific integration concern:** The Google Sheets node maps several fields from `$json.output.*`, while the Combiner and other downstream nodes may expose fields at different levels. Check an actual execution's incoming JSON at the Sheets node before assuming records are populated correctly.

## 6. Local development and deployment

```bash
git clone https://github.com/ralphy89/gayiti_voice_agent.git
cd gayiti_voice_agent
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://YOUR-N8N-HOST/webhook/YOUR-PRODUCTION-PATH
```

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`. The repository defines `npm run build`, `npm run start`, and `npm run lint`. No automated test command is declared in the inspected `package.json`; add a test runner before claiming automated coverage. To deploy, configure the same public webhook environment variable in the hosting provider, deploy the Next.js app, and ensure the n8n workflow is active and reachable from browsers.

### Importing the workflow

Import `Voice_Agent_workflow.json` into n8n, reconnect Gemini, Slack, and Google Sheets credentials, inspect all node settings and destinations, and activate the workflow only after validating the response path. **The export is not guaranteed to match the currently deployed workflow.**

## 7. Error handling and observability

- The form checks required fields before sending the request.
- The browser shows processing feedback and catches HTTP/network failures.
- The request is aborted after 180 seconds.
- Agent validation Code nodes and the Combiner provide structured fallbacks.
- The n8n export has a separate invalid-input response branch.
- Review n8n execution history for failed model calls, schema mismatches, and Slack/Sheets errors; do not assume failures are automatically retried.

The frontend header displays **“Workflow Online”** as static UI text; it is **not** a live health check. Consider replacing it with an actual availability probe or a neutral status label.

## 8. Handoff verification checklist

Before another engineer takes over the deployment:

1. Compare the active n8n workflow with the checked-in JSON export; export the actual deployed version.
2. Verify that the browser receives the **final structured result**, not just `Workflow has started`.
3. Confirm production webhook URL and browser CORS settings; remove reliance on the test-webhook fallback.
4. Submit one valid request and one invalid request; inspect the frontend output and n8n execution trace.
5. Simulate an unavailable webhook and verify the displayed error state.
6. Verify high-interest Slack routing and non-high-interest Google Sheets mapping using test records.
7. Run `npm run lint` and `npm run build`; resolve any errors found.
8. Confirm the mobile layout and inspect browser-console output.
9. Check that credentials, personal data, and operational endpoints are not exposed unnecessarily.

These are **handoff checks**, not a statement that the tests have been performed.

## 9. Known limitations and recommended work

| Area | Current limitation | Recommended next step |
| --- | --- | --- |
| Calling | Conversation is simulated by an LLM. | Evaluate real voice provider integration when feasible. |
| Workflow versioning | Export response path differs from README's described behavior. | Re-export and validate the deployed workflow. |
| Configuration | Frontend has a test-webhook fallback. | Require an explicit production webhook URL. |
| Monitoring | “Workflow Online” is not a live probe. | Add a real health check and structured logs. |
| Tests | No automated test script in inspected package manifest. | Add unit and integration tests. |
| Access | Public prototype without authentication. | Add authentication and data-access controls if used with real customers. |
| Data handling | Customer details may flow to LLM and third-party integrations. | Define retention, consent, access, and deletion practices before production use. |
| Reliability | Model latency and free-tier limits can affect execution. | Add retries where safe, observability, and clearer timeout behavior. |

## 10. Suggested ownership / extension points

- **Frontend:** `components/outreach-console.tsx` for form and result presentation; `lib/outreach.ts` for the request/response contract.
- **Orchestration:** n8n workflow for prompts, model settings, branching, error handling, and integrations.
- **Integrations:** n8n credentials and the Slack/Google Sheets destination nodes.
- **Documentation:** update this handoff and `README.md` whenever the API contract, deployment URL, or agent schema changes.

**Source of truth:** The statements about repository files and the workflow export above were checked against the GitHub repository. The live deployment's runtime configuration and end-to-end behavior were **not independently verified** while preparing this document.
