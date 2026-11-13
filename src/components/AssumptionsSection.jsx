import { useState } from 'react'
import {
  FlaskConical,
  Gauge,
  MessageSquarePlus,
  MessageSquare,
  CalendarClock,
  UserRound,
  Wand2,
} from 'lucide-react'
import SectionCard from './SectionCard'

// Marty Cagan's four product risks (Inspired)
export const RISK_TYPES = [
  { key: 'Value', question: 'Will customers buy or choose to use it?' },
  { key: 'Usability', question: 'Can users figure out how to use it?' },
  { key: 'Feasibility', question: 'Can we build it with what we have?' },
  { key: 'Viability', question: 'Does it work for the business?' },
]

const RISK_STYLES = {
  Value: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  Usability: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  Feasibility: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25',
  Viability: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
}

export const STATUS_OPTIONS = [
  { key: 'open', label: 'Open', active: 'bg-zinc-700 text-zinc-100' },
  { key: 'validated', label: 'Validated', active: 'bg-emerald-500/20 text-emerald-300' },
  { key: 'invalidated', label: 'Invalidated', active: 'bg-red-500/20 text-red-300' },
]

const LEVEL_STYLES = {
  high: { label: 'High risk', cls: 'text-red-300 bg-red-500/10 border-red-500/25' },
  medium: { label: 'Medium risk', cls: 'text-amber-300 bg-amber-500/10 border-amber-500/25' },
  low: { label: 'Low risk', cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' },
  revise: { label: 'Needs revision', cls: 'text-red-300 bg-red-500/10 border-red-500/25' },
}

function parseDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatDate(iso) {
  const d = parseDate(iso)
  return d ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : iso
}

export function isOverdue(iso, status) {
  const d = parseDate(iso)
  return status === 'open' && d !== null && d < startOfToday()
}

export function riskLevel(statuses) {
  const total = statuses.length
  if (total === 0) return null
  const validated = statuses.filter((s) => s === 'validated').length
  const invalidated = statuses.filter((s) => s === 'invalidated').length
  if (invalidated > 0) return 'revise'
  if (validated === total) return 'low'
  if (validated / total >= 0.5) return 'medium'
  return 'high'
}

export function RiskBadge({ riskType }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide ${RISK_STYLES[riskType] || RISK_STYLES.Value}`}>
      {riskType} risk
    </span>
  )
}

/* ── At-a-glance risk summary, shown near the top of the PRD ── */
export function RiskSummary({ assumptions, review }) {
  const statuses = assumptions.map((a, i) => review[i]?.status || a.status)
  const level = riskLevel(statuses)
  if (!level) return null

  const validated = statuses.filter((s) => s === 'validated').length
  const invalidated = statuses.filter((s) => s === 'invalidated').length
  const overdue = assumptions.filter((a, i) => isOverdue(a.validateBy, statuses[i])).length
  const { label, cls } = LEVEL_STYLES[level]

  return (
    <a
      href="#assumptions"
      className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors duration-200"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2.5">
          <Gauge size={15} className="text-indigo-400" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">PRD risk level</h2>
          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold tracking-wide ${cls}`}>{label}</span>
        </div>
        <p className="text-xs text-zinc-500 tabular-nums">
          {validated} of {statuses.length} assumptions validated
          {invalidated > 0 && <span className="text-red-400"> · {invalidated} invalidated</span>}
          {overdue > 0 && <span className="text-amber-400"> · {overdue} overdue</span>}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {RISK_TYPES.map(({ key }) => {
          const idx = assumptions.map((a, i) => (a.riskType === key ? i : -1)).filter((i) => i >= 0)
          return (
            <div key={key} className="rounded-xl bg-zinc-950/60 border border-zinc-800/60 px-3 py-2.5">
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-1.5">{key}</p>
              {idx.length === 0 ? (
                <p className="text-xs text-zinc-600">Not covered</p>
              ) : (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {idx.map((i) => (
                    <span
                      key={i}
                      title={`${STATUS_OPTIONS.find((s) => s.key === statuses[i])?.label}: ${assumptions[i].assumption}`}
                      className={`w-2.5 h-2.5 rounded-full ${
                        statuses[i] === 'validated'
                          ? 'bg-emerald-400'
                          : statuses[i] === 'invalidated'
                          ? 'bg-red-400'
                          : 'bg-zinc-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {level === 'revise' && (
        <p className="text-xs text-red-300/80 mt-3">
          An assumption was proven wrong. Regenerate with your feedback to update the plan.
        </p>
      )}
    </a>
  )
}

function StatusToggle({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Assumption status" className="inline-flex rounded-lg bg-zinc-950 border border-zinc-800 p-0.5">
      {STATUS_OPTIONS.map((opt) => {
        const selected = value === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.key)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              selected ? opt.active : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function AssumptionItem({ assumption, review, onChange }) {
  const status = review?.status || assumption.status
  const note = review?.note || ''
  const [noteOpen, setNoteOpen] = useState(note.length > 0)
  const overdue = isOverdue(assumption.validateBy, status)

  const borderCls =
    status === 'validated'
      ? 'border-emerald-500/30'
      : status === 'invalidated'
      ? 'border-red-500/30'
      : 'border-zinc-800/60'

  return (
    <div className={`rounded-xl bg-zinc-950/60 border p-4 space-y-3 transition-colors duration-200 ${borderCls}`}>
      <div className="space-y-1.5">
        <RiskBadge riskType={assumption.riskType} />
        <p className={`font-semibold text-sm text-zinc-100 ${status === 'invalidated' ? 'line-through decoration-red-400/60' : ''}`}>
          {assumption.assumption}
        </p>
        {assumption.validationMethod && (
          <p className="text-zinc-400 text-[13px] leading-relaxed">
            <span className="text-zinc-500 font-medium">Test: </span>
            {assumption.validationMethod}
          </p>
        )}
      </div>

      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-[12px] text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <UserRound size={12} />
          {assumption.owner}
        </span>
        {assumption.validateBy && (
          <span className={`inline-flex items-center gap-1.5 ${overdue ? 'text-amber-400' : ''}`}>
            <CalendarClock size={12} />
            Validate by {formatDate(assumption.validateBy)}
            {overdue && ' · overdue'}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <StatusToggle value={status} onChange={(s) => onChange({ status: s })} />
        {!noteOpen && (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-indigo-300 transition-colors"
          >
            <MessageSquarePlus size={13} />
            Add note
          </button>
        )}
      </div>

      {noteOpen && (
        <textarea
          value={note}
          onChange={(e) => onChange({ note: e.target.value })}
          maxLength={500}
          rows={2}
          autoFocus={note.length === 0}
          placeholder="What did you learn? e.g. 7 of 10 interviewees already use a spreadsheet for this and won't switch."
          className="w-full resize-y rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-600 text-[13px] p-3 leading-relaxed
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      )}
    </div>
  )
}

export function AssumptionsCard({ assumptions, review, onReviewChange }) {
  return (
    <div id="assumptions" className="scroll-mt-6">
      <SectionCard title="Assumptions to Test" icon={FlaskConical}>
        <p className="text-zinc-500 text-[12px] mb-4">
          The risks the critique could not remove, grouped by Cagan's four product risks. Mark each one as you learn, and add notes on what you found.
        </p>
        <div className="space-y-3">
          {assumptions.map((a, i) => (
            <AssumptionItem
              key={`${i}-${a.assumption}`}
              assumption={a}
              review={review[i]}
              onChange={(patch) => onReviewChange(i, patch)}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

/* ── Human-in-the-loop: send the PM's review back for a revised PRD ── */
export function FeedbackPanel({ prd, review, feedback, onFeedbackChange, onRefine, error }) {
  const changedStatuses = prd.assumptions.filter((a, i) => (review[i]?.status || a.status) !== a.status).length
  const notes = review.filter((r) => r.note.trim()).length
  const hasInput = feedback.trim().length > 0 || changedStatuses > 0 || notes > 0

  const parts = []
  if (changedStatuses) parts.push(`${changedStatuses} status change${changedStatuses > 1 ? 's' : ''}`)
  if (notes) parts.push(`${notes} note${notes > 1 ? 's' : ''}`)
  if (feedback.trim()) parts.push('general feedback')

  return (
    <SectionCard title="Your Feedback" icon={MessageSquare}>
      <p className="text-zinc-500 text-[12px] mb-3">
        Correct anything the AI got wrong. Your statuses, notes and feedback go back to the AI, which revises the PRD and lists what it changed.
      </p>
      <textarea
        value={feedback}
        onChange={(e) => onFeedbackChange(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="e.g. Our buyers are agency owners, not solo freelancers. Drop the mobile app from P0; Stripe is already in our stack."
        className="w-full resize-y rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-600 text-sm p-3.5 leading-relaxed
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-zinc-700 transition-colors"
      />
      <div className="flex items-center justify-between gap-3 flex-wrap mt-3">
        <span className="text-xs text-zinc-600">
          {parts.length ? `Will send: ${parts.join(', ')}` : 'Mark an assumption, add a note, or write feedback to revise.'}
        </span>
        <button
          type="button"
          onClick={onRefine}
          disabled={!hasInput}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600
            disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-sm font-semibold
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          <Wand2 size={15} />
          Revise PRD with my feedback
        </button>
      </div>
      {error && (
        <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm leading-relaxed">
          {error}
        </div>
      )}
    </SectionCard>
  )
}
