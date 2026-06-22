const EXAMPLES = [
  'A B2B invoicing tool for freelancers with automatic payment reminders and branded invoice templates',
  'An AI meeting notes tool that joins calls, transcribes them, and sends structured summaries to Slack',
  'A mobile app for restaurant owners to manage reservations, waitlists, and table turnover in real-time',
  'A developer tool that reviews GitHub PRs using AI and leaves structured code review comments automatically',
]

export default function ExamplePrompts({ onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {EXAMPLES.map((example, i) => (
        <button
          key={i}
          onClick={() => !disabled && onSelect(example)}
          disabled={disabled}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs
            hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5
            disabled:cursor-not-allowed disabled:opacity-40
            transition-all duration-200 text-left leading-relaxed"
        >
          {example.length > 60 ? `${example.slice(0, 60)}…` : example}
        </button>
      ))}
    </div>
  )
}
