export type OutreachRequest = { name: string; email: string; phone: string; business_name: string; service: string; call_reason: string; context: string; preferred_language: string }
export type Classification = { outcome?: string; interest_level?: string; confidence?: number }
export type Extraction = { contact_name?: string; contact_email?: string; phone_number?: string; callback_time?: string | null; requested_information?: string; product_or_service?: string; questions_or_concerns?: string[]; summary?: string }
export type Decision = { next_action?: string; priority?: string; reason?: string }
export type GeneratedResponse = { message?: string; follow_up_required?: boolean }
export type OutreachResult = { call_status?: string; outcome?: string; interest_level?: string; callback_time?: string | null; summary?: string; next_action?: string; classification?: Classification; extraction?: Extraction; decision?: Decision; response?: GeneratedResponse; transcript?: Array<{ speaker?: string; message?: string }> }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeOutreachResult(json: unknown): OutreachResult {
  const candidate = Array.isArray(json) ? json[0] : json

  if (typeof candidate === 'string') {
    try {
      return normalizeOutreachResult(JSON.parse(candidate))
    } catch {
      throw new Error('Workflow returned an invalid response.')
    }
  }

  if (!isRecord(candidate)) throw new Error('Workflow returned an invalid response.')

  // n8n can wrap the JSON payload in a `text` field, especially when the
  // webhook response is produced by an AI node.
  if (typeof candidate.text === 'string') {
    try {
      return normalizeOutreachResult(JSON.parse(candidate.text))
    } catch {
      throw new Error('Workflow returned an invalid response.')
    }
  }

  return candidate as OutreachResult
}

export async function submitOutreach(data: OutreachRequest): Promise<OutreachResult> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://gayiti.app.n8n.cloud/webhook/88903ce7-2386-4582-9f4d-06c8edd14555'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 180000)
  try {
    const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: controller.signal })
    if (!response.ok) throw new Error(`Workflow returned ${response.status}`)
    const json: unknown = await response.json()
    return normalizeOutreachResult(json)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error('The workflow timed out.')
    throw error
  } finally { clearTimeout(timeout) }
}

export const labelize = (value?: string | null) => value ? value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : '—'
export const titleCase = (value?: string | null) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '—'
