import { useState, useCallback } from 'react'
import { Loader2, FileText, Sparkles } from 'lucide-react'
import PRDOutput from './components/PRDOutput'
import LoadingPulse from './components/LoadingPulse'
import ExamplePrompts from './components/ExamplePrompts'

const MAX_DISPLAY_CHARS = 200

export default function App() {
  const [productIdea, setProductIdea] = useState('')
  const [prd, setPrd] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generatePRD = useCallback(async (idea) => {
    const ideaToUse = (idea ?? productIdea).trim()
    if (ideaToUse.length < 10) return

    setLoading(true)
    setError(null)
    setPrd(null)

    try {
      const res = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIdea: ideaToUse }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate PRD. Please try again.')
      }

      setPrd(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [productIdea])

  const handleExampleSelect = useCallback((example) => {
    setProductIdea(example)
    generatePRD(example)
  }, [generatePRD])

  const handleReset = useCallback(() => {
    setPrd(null)
    setProductIdea('')
    setError(null)
  }, [])

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      generatePRD()
    }
  }

  const isDisabled = loading || productIdea.trim().length < 10
  const charCount = productIdea.length
  const charOverLimit = charCount > MAX_DISPLAY_CHARS

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 lg:gap-12 items-start">

          {/* ── Left Column: Input Panel ── */}
          <div className="lg:sticky lg:top-8 lg:self-start space-y-6">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wide">
              <Sparkles size={11} />
              Personal Build · Fractional PM Deliverable
            </div>

            {/* Title */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">
                  AI PRD Generator
                </h1>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Type your product idea and get back a structured Product Requirements Document — the exact format I deliver for clients in a Fractional PM engagement.
              </p>
            </div>

            {/* Input Section */}
            <div className="space-y-3">
              <label htmlFor="product-idea" className="block text-xs font-medium text-zinc-500 uppercase tracking-widest">
                Your Product Idea
              </label>

              <textarea
                id="product-idea"
                value={productIdea}
                onChange={(e) => setProductIdea(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={'Describe your product idea... e.g. "A B2B tool that helps freelancers send branded invoices and track payment status in real-time"'}
                rows={3}
                style={{ maxHeight: '9rem', minHeight: '5rem' }}
                className="w-full resize-none rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm p-4 leading-relaxed
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  transition-all duration-200 hover:border-zinc-700"
                disabled={loading}
              />

              {/* Character count */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-600">
                  ⌘ + Enter to generate
                </span>
                <span className={`text-xs tabular-nums transition-colors duration-200 ${
                  charCount === 0
                    ? 'text-zinc-700'
                    : charOverLimit
                    ? 'text-amber-400'
                    : 'text-zinc-500'
                }`}>
                  {charCount}/{MAX_DISPLAY_CHARS}
                </span>
              </div>

              {/* Generate Button */}
              <button
                onClick={() => generatePRD()}
                disabled={isDisabled}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl
                  bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600
                  disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed
                  text-white font-semibold text-sm
                  transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating PRD…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate PRD
                  </>
                )}
              </button>

              {/* Error message */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm leading-relaxed">
                  {error}
                </div>
              )}
            </div>

            {/* Example Prompts */}
            <div className="space-y-3">
              <span className="text-xs font-medium text-zinc-600 uppercase tracking-widest">
                Try an example
              </span>
              <ExamplePrompts onSelect={handleExampleSelect} disabled={loading} />
            </div>

            {/* Attribution */}
            <p className="text-xs text-zinc-700 pt-2">
              Built by{' '}
              <a
                href="https://hrishikeshkumar.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-indigo-400 transition-colors duration-200 underline underline-offset-2"
              >
                Hrishikesh Kumar
              </a>
              {' '}·{' '}
              <a
                href="https://hrishikeshkumar.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-indigo-400 transition-colors duration-200 underline underline-offset-2"
              >
                hrishikeshkumar.me
              </a>
            </p>
          </div>

          {/* ── Right Column: Output Panel ── */}
          <div className="min-h-[500px]">
            {loading && <LoadingPulse />}

            {!loading && !prd && (
              <EmptyState />
            )}

            {!loading && prd && (
              <PRDOutput prd={prd} onReset={handleReset} />
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center px-8">
      <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-zinc-700"
        >
          <rect x="4" y="4" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="1.5" />
          <line x1="9" y1="12" x2="27" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="17" x2="27" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="22" x2="19" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-zinc-500 font-medium text-base mb-2">
        Your PRD will appear here
      </p>
      <p className="text-zinc-700 text-sm max-w-xs leading-relaxed">
        Describe your product idea on the left, then click Generate PRD to create a complete Product Requirements Document.
      </p>
    </div>
  )
}
