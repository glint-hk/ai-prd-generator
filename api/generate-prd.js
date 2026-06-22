const SYSTEM_PROMPT = `You are an elite Product Manager with 10 years experience at top-tier tech companies. Your job is to generate a concise, actionable Product Requirements Document (PRD) from a founder's product idea.

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

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set')
    return res.status(500).json({
      error: 'Server configuration error. API key not set.',
    })
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Generate a PRD for this product idea: ${productIdea.trim()}`,
          },
        ],
      }),
    })

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.json().catch(() => ({}))
      const message = errBody?.error?.message || anthropicRes.statusText
      console.error('Anthropic API error:', anthropicRes.status, message)
      return res.status(502).json({
        error: `AI service error: ${message}`,
      })
    }

    const anthropicData = await anthropicRes.json()
    const rawText = anthropicData?.content?.[0]?.text

    if (!rawText) {
      return res.status(502).json({ error: 'Empty response from AI service.' })
    }

    const cleanText = stripMarkdownFences(rawText)

    let prd
    try {
      prd = JSON.parse(cleanText)
    } catch (parseErr) {
      console.error('JSON parse failed. Raw text:', cleanText.slice(0, 500))
      return res.status(502).json({
        error: 'Failed to parse AI response as JSON. Please try again.',
      })
    }

    return res.status(200).json(prd)
  } catch (err) {
    console.error('Unhandled error in generate-prd:', err)
    return res.status(500).json({
      error: err.message || 'Failed to generate PRD. Please try again.',
    })
  }
}
