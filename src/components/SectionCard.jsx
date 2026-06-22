export default function SectionCard({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 overflow-hidden transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20 ${className}`}>
      {/* Left border accent — slides in on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-4">
        {Icon && (
          <div className="w-6 h-6 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Icon size={15} />
          </div>
        )}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {title}
        </h2>
      </div>

      {/* Content */}
      <div className="text-zinc-300 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  )
}
