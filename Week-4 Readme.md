# AI Outreach Console — Production Prototype

**Live App:** https://gayiti.ralphydumera.com

## Problem

The AI outreach workflow built in the previous modules runs inside n8n, making it difficult for a non-technical user to interact with directly.

The goal of this prototype is to provide a simple interface where an operator can launch an AI-powered outreach request and review the result without needing access to n8n or knowledge of the underlying automation.

## What It Does

AI Outreach Console provides a responsive web interface connected to the existing n8n workflow.

A user submits customer and business information through the application. The request is sent to n8n, where the workflow:

**Validates the input → Simulates the outbound conversation → Runs the multi-agent team → Combines and validates the results → Routes the result to Slack/Google Sheets → Returns the final result to the application.**

The interface displays the conversation summary, customer information, interest level, recommended next action, priority, and generated response.

The application also provides visible validation and workflow error states and is usable on both desktop and mobile.

## Run Locally

```bash id="sdrwxh"
git clone https://github.com/ralphy89/gayiti_voice_agent.git
cd gayiti_voice_agent

npm install
```

Create a `.env.local` file:

```env id="ng4oqm"
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
```

Start the development server:

```bash id="e2h5pr"
npm run dev
```

Then open `http://localhost:3000`.

## Known Limitations

* Outbound conversations are currently simulated by an LLM instead of using a live voice provider.
* Processing time depends on n8n and LLM provider latency.
* External integrations can be affected by free-tier quotas and rate limits.
* Authentication is not implemented for this prototype.
* LLM-generated results may vary between executions.
