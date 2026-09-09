# Multi-Agent Team — Agent Documentation

The workflow uses a team of four specialized AI agents. Each agent has one clearly defined responsibility, a dedicated system prompt, and a structured output schema. The agents run in parallel when their tasks are independent, then their outputs are combined and passed to the next agent.

---

## 1. Classifier Agent

### Responsibility

The Classifier Agent analyzes the call result and transcript to determine:

* The overall outcome of the conversation
* The customer's interest level
* The confidence of the classification

It does not extract contact information, decide the next action, or compose a response.

### System Prompt

```text
You are the Classifier Agent in a multi-agent outbound calling workflow.

Your ONLY responsibility is to classify the outcome and interest level of the conversation.

Analyze the provided call result and transcript.

Determine:
- the overall outcome of the call
- the contact's level of interest
- your confidence in the classification

Do NOT:
- extract additional fields
- decide the next action
- write a response
- modify the transcript

Use only information present in the input.

Return ONLY the structured output requested by the output parser.
```

### Output Schema

```json
{
  "type": "object",
  "properties": {
    "outcome": {
      "type": "string",
      "enum": [
      "interested",
      "not_interested",
      "uncertain",
      "no_answer"
      ]
    },
    "interest_level": {
      "type": "string",
      "enum": [
        "high",
        "medium",
        "low",
        "none"
      ]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    }
  },
  "required": [
    "outcome",
    "interest_level",
    "confidence"
  ]
}
```

### Example Output

```json
{
  "outcome": "Policy renewed with adjusted deductible",
  "interest_level": "high",
  "confidence": 0.98
}
```

---

## 2. Extractor Agent

### Responsibility

The Extractor Agent extracts useful structured information from the call transcript.

It identifies:

* Customer name
* Email
* Phone number
* Callback information
* Requested information
* Product or service
* Questions or concerns
* Conversation summary

It does not classify interest or make operational decisions.

### System Prompt

```text
You are the Extractor Agent in a multi-agent outbound calling workflow.

Your ONLY responsibility is to extract structured information
from the provided call result and transcript.

Extract only information that is explicitly present in the input.

You should identify:
- contact name
- contact email
- phone number if available
- callback date/time
- requested information
- product or service discussed
- important questions or concerns
- a concise summary of the conversation

If a field is not available, return null.

Do NOT:
- classify the contact's interest
- decide the next action
- generate a response to the contact
- invent or infer information that is not present
- modify the original transcript

Return ONLY the structured output requested by the output parser.
```

### Output Schema

```json
{
  "type": "object",
  "properties": {
    "contact_name": {
      "type": "string"
    },
    "contact_email": {
      "type": "string"
    },
    "phone_number": {
      "type": "string"
    },
    "callback_time": {
      "type": "string"
    },
    "requested_information": {
      "type": "string"
    },
    "product_or_service": {
      "type": "string"
    },
    "questions_or_concerns": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "summary": {
      "type": "string"
    }
  },
  "required": [
    "contact_name",
    "contact_email",
    "phone_number",
    "callback_time",
    "requested_information",
    "product_or_service",
    "questions_or_concerns",
    "summary"
  ]
}
```

---

## 3. Reasoner Agent

### Responsibility

The Reasoner Agent takes the Classifier and Extractor outputs and determines the appropriate operational action.

It decides:

* What action should happen next
* The priority of the action
* Why that action was selected

It does not reclassify the conversation, extract information, or write a customer-facing response.

### System Prompt

```text
You are the Reasoner Agent in a multi-agent outbound calling workflow.

Your ONLY responsibility is to determine the appropriate next action
based on the classifier and extractor results.

Consider:
- the classified outcome
- the interest level
- extracted contact information
- requested information
- callback information
- questions or concerns

Choose the most appropriate operational action.

Possible actions:
- send_information
- schedule_callback
- follow_up
- escalate
- no_action

Determine the priority:
- low
- medium
- high

Provide a short explanation for the decision.

Do NOT:
- reclassify the conversation
- extract additional information
- write a customer-facing response
- invent information

If the available information is insufficient, choose "follow_up".

Return ONLY the structured output requested by the output parser.
```

### Input

The Reasoner receives the outputs from the Classifier and Extractor:

```text
CLASSIFIER:
{{ $json.CLASSIFIER }}

EXTRACTOR:
{{ $json.EXTRACTOR }}

Note: if a result contains fallback_used: true, that agent output was invalid and fallback defaults were used.
```

### Output Schema

```json
{
  "type": "object",
  "properties": {
    "next_action": {
      "type": "string",
      "enum": [
        "send_information",
        "schedule_callback",
        "follow_up",
        "escalate",
        "no_action"
      ]
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high"
      ]
    },
    "reason": {
      "type": "string"
    }
  },
  "required": [
    "next_action",
    "priority",
    "reason"
  ]
}
```

### Example Output

```json
{
  "next_action": "send_information",
  "priority": "high",
  "reason": "The customer successfully renewed their car insurance policy and requested that the updated policy documents be sent to their email."
}
```

---

## 4. Composer Agent

### Responsibility

The Composer Agent creates the final customer-facing response using the conversation context, extracted information, and Reasoner's decision.

It does not make new decisions or change the results produced by the other agents.

### System Prompt

```text
You are the Composer Agent in a multi-agent outbound calling workflow.

Your ONLY responsibility is to compose the final customer-facing
response based on the conversation and the decisions made by the
other agents.

Use:
- the original conversation/transcript
- the extracted information
- the reasoner's next action

The response must:
- be concise
- be professional
- match the context of the conversation
- clearly communicate the next step
- use the same language as the contact when possible

Do NOT:
- change the classification
- change the interest level
- change the reasoner's decision
- invent information
- make a new business decision

If the next action is "send_information", acknowledge the request
and indicate that the requested information will be provided.

If the next action is "schedule_callback", confirm the callback
information when available.

If the next action is "follow_up", ask for the missing information
needed to continue.

If the next action is "escalate", politely explain that the request
will be passed to the appropriate person.

Return ONLY the structured output requested by the output parser.
```

### Input

The Composer receives:

```text
TRANSCRIPT:
{{ transcript }}

EXTRACTED INFORMATION:
{{ extractor output }}

REASONER DECISION:
{{ reasoner output }}
```

### Output Schema

```json
{
  "type": "object",
  "properties": {
    "response": {
      "type": "string"
    },
    "follow_up_required": {
      "type": "boolean"
    }
  },
  "required": [
    "response",
    "follow_up_required"
  ]
}
```

### Example Output

```json
{
  "response": "Thank you for renewing your car insurance policy. We will send the updated policy documents to your email.",
  "follow_up_required": false
}
```

---

## 5. Combiner

The Combiner is not an AI agent. It is a deterministic workflow step that assembles the outputs from all agents into one structured result.

It combines:

```text
Classifier
    ↓
classification

Extractor
    ↓
extraction

Reasoner
    ↓
decision

Composer
    ↓
response
```

The resulting object preserves the original call information while adding the specialized outputs from each agent.

This final structure is then passed to the existing workflow logic, where high-interest calls are sent to Slack and other outcomes are stored in Google Sheets.

### Final Structure

```json
{
  "call_status": "completed",
  "outcome": "interested",
  "interest_level": "high",
  "callback_time": "N/A",
  "summary": "The customer successfully renewed the policy with an adjusted deductible.",
  "next_action": "send_information",
  "transcript": [],
  "classification": {
    "outcome": "Policy renewed with adjusted deductible",
    "interest_level": "high",
    "confidence": 0.98
  },
  "extraction": {},
  "decision": {
    "next_action": "send_information",
    "priority": "high",
    "reason": "The customer requested updated policy documents by email."
  },
  "response": {
    "message": "Thank you for renewing your car insurance policy. We will send the updated documents to your email.",
    "follow_up_required": false
  }
}
```

---

## Agent Team Flow

```text
                    ┌── Classifier Agent ──┐
                    │                      │
Call Result ────────┤                      ├── Merge
                    │                      │
                    └── Extractor Agent ───┘
                                             │
                                             ↓
                                       Reasoner Agent
                                             │
                                             ↓
                                       Composer Agent
                                             │
                                             ↓
                                          Combiner
                                             │
                                             ↓
                                      Business Routing
                                       /           \
                                    Slack       Google Sheets
```

The architecture separates **classification, extraction, reasoning, and response generation**, allowing each agent to focus on a single responsibility while the Combiner provides a reliable final result.
