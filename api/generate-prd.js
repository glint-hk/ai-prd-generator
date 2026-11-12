const SYSTEM_PROMPT = `You are an elite Product Manager with 10 years experience at top-tier tech companies. Your job is to generate a concise, actionable Product Requirements Document (PRD) from a founder's product idea.

Before generating the final JSON output, perform the following cognitive process internally:
1. Critique: Adopt a strict "devil's advocate" perspective on the founder's initial product idea. Identify hidden assumptions, critical gaps, potential failure modes, and scoping issues.
2. Refine: Revise and patch the product concept to address these gaps.
3. Repeat: Conduct a second round of devil's advocate critique on the newly revised concept, identifying any remaining or new gaps, and refine it once more.
4. Finalize: Produce the final PRD JSON based on this twice-refined, robust version of the product concept.

You must respond ONLY with a valid JSON object — no markdown, no preamble, no explanation outside the JSON. The JSON must follow this exact structure:

{
  "productName": "string — infer a clean product name from the idea",
  "oneLiner": "string — one crisp sentence describing what this product does and for whom",
  "problemStatement": {
    "headline": "string — the core problem in one sentence",
    "context": "string — 2-3 sentences of market/user context explaining why this problem matters right now"
  },
  "targetUser": {
    "primary": "string — specific description of the primary user persona",
    "painPoints": ["string", "string", "string"]
  },
  "coreFeatures": [
    {
      "name": "string",
      "description": "string — one sentence",
      "priority": "P0" | "P1" | "P2",
      "rationale": "string — one sentence explaining why this priority"
    }
  ],
  "successMetrics": [
    {
      "metric": "string — specific, measurable metric name",
      "target": "string — concrete target with timeframe",
      "why": "string — one sentence on why this metric matters"
    }
  ],
  "outOfScope": ["string", "string", "string"],
  "openQuestions": [
    {
      "question": "string",
      "why": "string — one sentence on why this needs answering before build"
    }
  ],
  "recommendedStack": {
    "frontend": "string",
    "backend": "string",
    "database": "string",
    "keyIntegrations": ["string", "string"]
  },
  "sprintOneGoal": "string — what should be shipped in the first 2-week sprint to validate the core assumption"
}

Rules:
- coreFeatures: minimum 4, maximum 6. Always include at least 2 P0 features.
- successMetrics: exactly 3
- outOfScope: exactly 3 items (important for keeping scope tight)
- openQuestions: exactly 3
- Be specific and opinionated — avoid generic filler like "improve user experience". Name real tools, real metrics, real user types.
- If the idea is vague, make reasonable assumptions and note them in openQuestions`

// Ordered fastest first; gemini-2.5-flash thinks before answering (~20s) so it is the last resort
const GEMINI_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-2.5-flash']

// Keep under the Vercel maxDuration in vercel.json so we always return a clean error
const TOTAL_BUDGET_MS = 55_000
const ATTEMPT_TIMEOUT_MS = 35_000
const MIN_ATTEMPT_MS = 5_000

const isStr = (v) => typeof v === 'string' && v.trim().length > 0
const isArr = (v) => Array.isArray(v) && v.length > 0

// The UI dereferences every one of these fields, so a missing one would crash the page
function isValidPrd(p) {
  return (
    p && typeof p === 'object' &&
    isStr(p.productName) && isStr(p.oneLiner) &&
    isStr(p.problemStatement?.headline) && isStr(p.problemStatement?.context) &&
    isStr(p.targetUser?.primary) && isArr(p.targetUser?.painPoints) &&
    isArr(p.coreFeatures) && p.coreFeatures.every((f) => isStr(f?.name) && isStr(f?.priority)) &&
    isArr(p.successMetrics) && p.successMetrics.every((m) => isStr(m?.metric)) &&
    isArr(p.outOfScope) &&
    isArr(p.openQuestions) && p.openQuestions.every((q) => isStr(q?.question)) &&
    p.recommendedStack && typeof p.recommendedStack === 'object' &&
    Array.isArray(p.recommendedStack.keyIntegrations) &&
    isStr(p.sprintOneGoal)
  )
}

function stripMarkdownFences(text) {
  return text
    .replace(/^﻿/, '')
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim()
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const { productIdea } = req.body || {}

  if (!productIdea || typeof productIdea !== 'string' || productIdea.trim().length < 10) {
    return res.status(400).json({
      error: 'Please provide a product idea of at least 10 characters.',
    })
  }

  if (productIdea.trim().length > 2000) {
    return res.status(400).json({
      error: 'Product idea must be under 2000 characters.',
    })
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set')
    return res.status(500).json({
      error: 'Server configuration error. API key not set.',
    })
  }

  const requestBody = JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [{ text: `Generate a PRD for this product idea: ${productIdea.trim()}` }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  })

  const deadline = Date.now() + TOTAL_BUDGET_MS
  let lastError = null

  for (const model of GEMINI_MODELS) {
    const remaining = deadline - Date.now()
    if (remaining < MIN_ATTEMPT_MS) break

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`
      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: requestBody,
        signal: AbortSignal.timeout(Math.min(ATTEMPT_TIMEOUT_MS, remaining)),
      })

      if (!geminiRes.ok) {
        const errBody = await geminiRes.json().catch(() => ({}))
        const message = errBody?.error?.message || geminiRes.statusText
        console.warn(`Gemini model ${model} failed (${geminiRes.status}): ${message}`)
        // 400/401 mean a bad request or API key, which every model would reject the same way
        if (geminiRes.status === 400 || geminiRes.status === 401) {
          return res.status(502).json({ error: 'The AI service rejected the request. Please try again later.' })
        }
        lastError = 'The AI models are busy right now.'
        continue
      }

      const geminiData = await geminiRes.json()
      const candidate = geminiData?.candidates?.[0]
      const rawText = (candidate?.content?.parts || [])
        .filter((p) => typeof p.text === 'string' && !p.thought)
        .map((p) => p.text)
        .join('')

      if (!rawText) {
        console.warn(`Empty response from ${model} (finishReason: ${candidate?.finishReason}, blockReason: ${geminiData?.promptFeedback?.blockReason})`)
        lastError = 'The AI returned an empty response.'
        continue
      }

      let prd
      try {
        prd = JSON.parse(stripMarkdownFences(rawText))
      } catch {
        console.warn(`Invalid JSON from ${model} (finishReason: ${candidate?.finishReason}):`, rawText.slice(0, 300))
        lastError = 'The AI returned an incomplete response.'
        continue
      }

      if (!isValidPrd(prd)) {
        console.warn(`Malformed PRD from ${model}:`, JSON.stringify(prd).slice(0, 300))
        lastError = 'The AI returned an incomplete PRD.'
        continue
      }

      return res.status(200).json(prd)
    } catch (err) {
      const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError'
      console.warn(`Gemini model ${model} ${timedOut ? 'timed out' : 'errored'}:`, err.message)
      lastError = timedOut ? 'The AI service took too long to respond.' : 'Could not reach the AI service.'
    }
  }

  return res.status(502).json({
    error: `${lastError || 'The AI models are busy right now.'} Please try again in a minute.`,
  })
}
