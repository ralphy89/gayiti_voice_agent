export type OutreachRequest = { name: string; phone: string; business_name: string; service: string; call_reason: string; context: string; preferred_language: string }
export type Classification = { outcome?: string; interest_level?: string; confidence?: number }
export type Extraction = { contact_name?: string; contact_email?: string; phone_number?: string; callback_time?: string | null; requested_information?: string; product_or_service?: string; questions_or_concerns?: string[]; summary?: string }
export type Decision = { next_action?: string; priority?: string; reason?: string }
export type GeneratedResponse = { message?: string; follow_up_required?: boolean }
export type OutreachResult = { call_status?: string; outcome?: string; interest_level?: string; callback_time?: string | null; summary?: string; next_action?: string; classification?: Classification; extraction?: Extraction; decision?: Decision; response?: GeneratedResponse }

export async function submitOutreach(data: OutreachRequest): Promise<OutreachResult> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
  if (!webhookUrl) throw new Error('NEXT_PUBLIC_N8N_WEBHOOK_URL is not configured.')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)
  try {
    const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: controller.signal })
    if (!response.ok) throw new Error(`Workflow returned ${response.status}`)
    const json: unknown = await response.json()
    if (!json || typeof json !== 'object') throw new Error('Workflow returned an invalid response.')
    return json as OutreachResult
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error('The workflow timed out.')
    throw error
  } finally { clearTimeout(timeout) }
}

export const labelize = (value?: string | null) => value ? value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : '—'
export const titleCase = (value?: string | null) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '—'
