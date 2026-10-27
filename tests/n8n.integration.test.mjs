import test from 'node:test'
import assert from 'node:assert/strict'
import { submitOutreach } from '../lib/outreach.ts'

const endpoint = process.env.N8N_INTEGRATION_WEBHOOK_URL
const enabled = process.env.RUN_N8N_INTEGRATION === '1'

test('live n8n workflow returns final structured result', { skip: !enabled ? 'Set RUN_N8N_INTEGRATION=1 and N8N_INTEGRATION_WEBHOOK_URL to run against live n8n' : false }, async () => {
  assert.ok(endpoint?.startsWith('https://'), 'Set an HTTPS n8n production webhook URL')
  assert.ok(!endpoint.includes('/webhook-test/'), 'Use a production webhook, not webhook-test')
  const previous = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL = endpoint
  try {
    const result = await submitOutreach({ name: 'Test Contact', email: 'test@example.com', phone: '+15550123456', business_name: 'Integration Test Business', service: 'Test inquiry', call_reason: 'Test workflow', context: 'Synthetic integration test; do not contact or store as a real customer.', preferred_language: 'English' })
    assert.ok(typeof result.summary === 'string' && result.summary.length > 0, 'Expected final conversation summary')
    assert.ok(typeof result.next_action === 'string' && result.next_action.length > 0, 'Expected next action')
    assert.ok(typeof result.outcome === 'string' && result.outcome.length > 0, 'Expected outcome')
  } finally { if (previous === undefined) delete process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL; else process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL = previous }
})
