import { useRef, useState } from 'react'
import { Boxes, ChevronDown, Paperclip, Trash2 } from 'lucide-react'

export const MAX_CONTEXT_CHARS = 12_000
const MAX_FILE_BYTES = 1_000_000
const ACCEPT = '.md,.markdown,.txt,.json,.yaml,.yml,.csv'

const WHAT_TO_INCLUDE = [
  'What is already built: modules, key screens, user roles',
  'Current workflows this change touches',
  'Data model, APIs and integrations it relies on',
  'Tech stack and constraints (compliance, performance, legacy)',
  'Known edge cases, bugs or past decisions',
]

export default function ProductContextInput({ value, onChange, disabled }) {
  const [open, setOpen] = useState(value.length > 0)
  const [fileError, setFileError] = useState(null)
  const fileRef = useRef(null)
  const count = value.length
  const over = count > MAX_CONTEXT_CHARS

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    setFileError(null)
    let next = value
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        setFileError(`${file.name} is over 1 MB. Paste the relevant sections instead.`)
        continue
      }
      try {
        const text = (await file.text()).trim()
        if (!text) continue
        next = `${next.trim() ? `${next.trim()}\n\n` : ''}--- ${file.name} ---\n${text}`
      } catch {
        setFileError(`Could not read ${file.name}.`)
      }
    }
    onChange(next)
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left rounded-xl
          focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <Boxes size={15} className="text-indigo-400 flex-shrink-0" />
          <span className="text-sm text-zinc-300 font-medium">Enhancing an existing product?</span>
          {count > 0 && !open && (
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-bold tracking-wide">
              CONTEXT ADDED
            </span>
          )}
        </span>
        <ChevronDown size={15} className={`text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Add what's already built so the PRD maps dependencies, affected workflows and edge cases instead of guessing. Anything it has to assume is listed as a gap to confirm with engineering.
          </p>
          <ul className="text-xs text-zinc-600 space-y-1">
            {WHAT_TO_INCLUDE.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-600 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <textarea
            aria-label="Existing product context"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={6}
            placeholder="Paste notes, an existing PRD, a README or an API spec, or attach files below."
            className="w-full resize-y rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-600 text-[13px] p-3 leading-relaxed font-mono
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-zinc-700 transition-colors"
            style={{ maxHeight: '18rem' }}
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
              >
                <Paperclip size={13} />
                Attach .md / .txt / .json / .yaml
              </button>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => { onChange(''); setFileError(null) }}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-red-300 disabled:opacity-50 transition-colors"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              )}
              <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={handleFiles} />
            </div>
            <span className={`text-xs tabular-nums ${over ? 'text-red-400' : 'text-zinc-600'}`}>
              {count.toLocaleString('en-US')}/{MAX_CONTEXT_CHARS.toLocaleString('en-US')}
            </span>
          </div>

          {over && (
            <p className="text-xs text-red-400">Too long. Keep only the parts this change touches.</p>
          )}
          {fileError && <p className="text-xs text-amber-400">{fileError}</p>}
        </div>
      )}
    </div>
  )
}
