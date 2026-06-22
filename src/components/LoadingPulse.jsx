const SKELETON_SECTIONS = [
  { titleWidth: 'w-36', lines: [{ w: 'w-full' }, { w: 'w-5/6' }] },
  { titleWidth: 'w-28', lines: [{ w: 'w-full' }, { w: 'w-4/5' }, { w: 'w-3/4' }] },
  { titleWidth: 'w-32', lines: [{ w: 'w-full' }, { w: 'w-full' }, { w: 'w-2/3' }] },
  { titleWidth: 'w-40', lines: [{ w: 'w-5/6' }, { w: 'w-3/4' }] },
  { titleWidth: 'w-24', lines: [{ w: 'w-full' }, { w: 'w-4/6' }] },
  { titleWidth: 'w-44', lines: [{ w: 'w-full' }, { w: 'w-5/6' }, { w: 'w-3/5' }] },
]

function SkeletonBar({ className = '' }) {
  return (
    <div className={`h-3 rounded-full bg-indigo-500/10 animate-skeleton ${className}`} />
  )
}

function SkeletonCard({ titleWidth, lines, delay }) {
  return (
    <div
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Section title area */}
      <div className="flex items-center gap-3 pb-1">
        <div className="w-5 h-5 rounded-md bg-indigo-500/10 animate-skeleton flex-shrink-0" />
        <SkeletonBar className={`h-2.5 ${titleWidth}`} />
      </div>
      {/* Content lines */}
      <div className="space-y-2.5 pt-1">
        {lines.map((line, i) => (
          <SkeletonBar key={i} className={line.w} />
        ))}
      </div>
    </div>
  )
}

export default function LoadingPulse() {
  return (
    <div className="space-y-4">
      {/* Large title skeleton */}
      <div className="space-y-3 pb-2">
        <SkeletonBar className="w-64 h-7 bg-indigo-500/10 animate-skeleton rounded-lg" />
        <SkeletonBar className="w-96 h-4 bg-indigo-500/10 animate-skeleton" />
      </div>

      {SKELETON_SECTIONS.map((section, i) => (
        <SkeletonCard
          key={i}
          titleWidth={section.titleWidth}
          lines={section.lines}
          delay={i * 0.06}
        />
      ))}

      <p className="text-center text-xs text-zinc-700 pt-2 animate-skeleton">
        Generating your PRD…
      </p>
    </div>
  )
}
