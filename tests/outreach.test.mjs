import test from 'node:test'
import assert from 'node:assert/strict'
import { submitOutreach, labelize, titleCase } from '../lib/outreach.ts'

const request = { name: 'Marie Joseph', email: 'marie@example.com', phone: '+50912345678', business_name: 'Example Co', service: 'Renewal', call_reason: 'Renew', context: 'Policy expiring', preferred_language: 'English' }
const valid = { call_status: 'completed', outcome: 'interested', interest_level: 'high', summary: 'Interested in renewal', next_action: 'follow_up' }
const originalFetch = globalThis.fetch
const originalUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
const restore = () => { globalThis.fetch = originalFetch; if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL; else process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL = originalUrl }

test.afterEach(restore)
test('formats display labels', () => { assert.equal(labelize('send_information'), 'Send Information'); assert.equal(titleCase('HIGH'), 'High'); assert.equal(labelize(null), '—') })
test('sends correct JSON body and production endpoint', async () => {
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL = 'https://example.org/webhook/production'
  globalThis.fetch = async (url, options) => {
    assert.equal(url, process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL)
    assert.equal(options.method, 'POST')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(options.body), request)
    assert.ok(options.signal instanceof AbortSignal)
    return new Response(JSON.stringify(valid), { status: 200 })
  }
  assert.deepEqual(await submitOutreach(request), valid)
})
test('normalizes an array response', async () => { globalThis.fetch = async () => Response.json([valid]); assert.deepEqual(await submitOutreach(request), valid) })
test('normalizes JSON text wrapper', async () => { globalThis.fetch = async () => Response.json({ text: JSON.stringify(valid) }); assert.deepEqual(await submitOutreach(request), valid) })
test('normalizes JSON string response', async () => { globalThis.fetch = async () => Response.json(JSON.stringify(valid)); assert.deepEqual(await submitOutreach(request), valid) })
test('rejects malformed JSON in text wrapper', async () => { globalThis.fetch = async () => Response.json({ text: '{oops' }); await assert.rejects(submitOutreach(request), /invalid response/) })
test('rejects empty array and non-object response', async () => { globalThis.fetch = async () => Response.json([]); await assert.rejects(submitOutreach(request), /invalid response/); globalThis.fetch = async () => Response.json(42); await assert.rejects(submitOutreach(request), /invalid response/) })
test('reports non-success HTTP status', async () => { globalThis.fetch = async () => new Response('failed', { status: 503 }); await assert.rejects(submitOutreach(request), /503/) })
test('propagates network failures', async () => { globalThis.fetch = async () => { throw new TypeError('network unavailable') }; await assert.rejects(submitOutreach(request), /network unavailable/) })
test('reports aborted requests as timeouts', async () => { globalThis.fetch = async () => { throw new DOMException('Aborted', 'AbortError') }; await assert.rejects(submitOutreach(request), /timed out/) })
test.todo('rejects acknowledgment-only payload (current production bug: {message: "Workflow has started"} is accepted)')
test.todo('requires explicit production webhook URL (current code falls back to webhook-test)')
