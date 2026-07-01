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

const GEMINI_MODELS = ['gemini-3.1-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite']

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

  let lastError = null

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`
      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: requestBody,
      })

      if (!geminiRes.ok) {
        const errBody = await geminiRes.json().catch(() => ({}))
        const message = errBody?.error?.message || geminiRes.statusText
        console.warn(`Gemini model ${model} failed (${geminiRes.status}): ${message}`)
        lastError = message
        // Only fall through to next model on quota errors (429) or server errors (5xx)
        if (geminiRes.status === 429 || geminiRes.status >= 500) continue
        return res.status(502).json({ error: `AI service error: ${message}` })
      }

      const geminiData = await geminiRes.json()
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!rawText) {
        console.error(`Empty response from ${model}:`, JSON.stringify(geminiData))
        return res.status(502).json({ error: 'Empty response from AI service.' })
      }

      const cleanText = stripMarkdownFences(rawText)

      let prd
      try {
        prd = JSON.parse(cleanText)
      } catch (parseErr) {
        console.error('JSON parse failed. Raw text:', cleanText.slice(0, 500))
        return res.status(502).json({ error: 'Failed to parse AI response as JSON. Please try again.' })
      }

      return res.status(200).json(prd)
    } catch (err) {
      console.error(`Unhandled error with model ${model}:`, err)
      lastError = err.message
    }
  }

  return res.status(502).json({
    error: `AI service error: ${lastError || 'All models failed. Please try again later.'}`,
  })
}
