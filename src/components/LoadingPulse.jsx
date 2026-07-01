import { useState, useEffect } from 'react'
import { Sparkles, ShieldAlert, RefreshCw, Zap, FileCheck, CheckCircle2, Loader2 } from 'lucide-react'

const STEPS = [
  {
    label: "Analyzing Product Idea",
    description: "Deconstructing core assumptions & identifying key user personas.",
    icon: Sparkles,
    color: 'indigo'
  },
  {
    label: "Devil's Advocate: Critique 1",
    description: "Stress-testing target audience pain points & finding critical gaps.",
    icon: ShieldAlert,
    color: 'amber'
  },
  {
    label: "Refining Gaps & Scoping",
    description: "Resolving initial gaps and establishing P0/P1 feature scope.",
    icon: RefreshCw,
    color: 'emerald'
  },
  {
    label: "Devil's Advocate: Critique 2",
    description: "Re-evaluating revised features against success metrics.",
    icon: Zap,
    color: 'cyan'
  },
  {
    label: "Finalizing PRD",
    description: "Assembling sprint goals, recommended stack, and structured PRD.",
    icon: FileCheck,
    color: 'violet'
  }
]

const SKELETON_SECTIONS = [
  { titleWidth: 'w-36', lines: [{ w: 'w-full' }, { w: 'w-5/6' }] },
  { titleWidth: 'w-28', lines: [{ w: 'w-full' }, { w: 'w-4/5' }, { w: 'w-3/4' }] },
  { titleWidth: 'w-32', lines: [{ w: 'w-full' }, { w: 'w-full' }, { w: 'w-2/3' }] },
  { titleWidth: 'w-40', lines: [{ w: 'w-5/6' }, { w: 'w-3/4' }] },
]

function SkeletonBar({ className = '' }) {
  return (
    <div className={`h-3 rounded-full bg-indigo-500/10 animate-skeleton ${className}`} />
  )
}

function SkeletonCard({ titleWidth, lines, delay }) {
  return (
    <div
      className="rounded-2xl border border-zinc-900 bg-zinc-900/50 p-6 space-y-4"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-3 pb-1">
        <div className="w-5 h-5 rounded-md bg-indigo-500/10 animate-skeleton flex-shrink-0" />
        <SkeletonBar className={`h-2.5 ${titleWidth}`} />
      </div>
      <div className="space-y-2.5 pt-1">
        {lines.map((line, i) => (
          <SkeletonBar key={i} className={line.w} />
        ))}
      </div>
    </div>
  )
}

export default function LoadingPulse() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Distribute step transitions over ~10-12 seconds
    const intervals = [2200, 2600, 2400, 2600] 
    let timer
    
    const runNext = (step) => {
      if (step >= STEPS.length - 1) return
      timer = setTimeout(() => {
        setCurrentStep(step + 1)
        runNext(step + 1)
      }, intervals[step])
    }

    runNext(0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium">
          <Loader2 size={12} className="animate-spin text-indigo-400" />
          Fractional PM Agent is Active
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-50">
          Generating Product Requirements Document
        </h2>
        <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
          The AI is currently analyzing, questioning, and refining your product concept through double devil's advocate loops to produce an elite-level PM spec.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
        
        {/* Stepper Panel */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Execution Progress
          </h3>

          <div className="relative space-y-7">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = index < currentStep
              const isActive = index === currentStep
              const isPending = index > currentStep

              // Dynamic color themes for active step
              const colorClasses = {
                indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 ring-indigo-500/10',
                amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 ring-amber-500/10',
                emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 ring-emerald-500/10',
                cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 ring-cyan-500/10',
                violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20 ring-violet-500/10',
              }[step.color]

              return (
                <div key={index} className="relative flex items-start gap-4 group">
                  {/* Step Connector Line */}
                  {index < STEPS.length - 1 && (
                    <div 
                      className={`absolute left-[17px] top-9 bottom-[-28px] w-[2px] transition-all duration-500 ease-in-out ${
                        isCompleted ? 'bg-indigo-500' : 'bg-zinc-800'
                      }`} 
                    />
                  )}

                  {/* Step Indicator (Circle/Icon) */}
                  <div className="relative z-10 flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-500/5 transition-all duration-300">
                        <CheckCircle2 size={18} className="stroke-[2.5]" />
                      </div>
                    ) : isActive ? (
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center ring-4 transition-all duration-300 animate-pulse ${colorClasses}`}>
                        <StepIcon size={16} className="animate-spin-icon" style={{ animationDuration: '3s' }} />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-650 transition-all duration-300">
                        <StepIcon size={16} />
                      </div>
                    )}
                  </div>

                  {/* Step Details */}
                  <div className="space-y-1 pt-1.5 flex-1 min-w-0">
                    <p className={`text-xs font-semibold tracking-wide transition-colors duration-300 uppercase ${
                      isActive ? 'text-zinc-100' : isCompleted ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                      Step {index + 1}: {step.label}
                    </p>
                    <p className={`text-xs leading-relaxed transition-all duration-300 ${
                      isActive 
                        ? 'text-zinc-400 font-normal max-h-20 opacity-100 mt-1' 
                        : 'text-zinc-600 max-h-0 opacity-0 lg:max-h-20 lg:opacity-100 lg:mt-0.5'
                    } overflow-hidden`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pulsing Skeleton Preview Panel */}
        <div className="space-y-4 opacity-70">
          <div className="space-y-3 pb-2">
            <SkeletonBar className="w-64 h-7 bg-indigo-500/10 animate-skeleton rounded-lg" />
            <SkeletonBar className="w-96 h-4 bg-indigo-500/10 animate-skeleton" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SKELETON_SECTIONS.map((section, i) => (
              <SkeletonCard
                key={i}
                titleWidth={section.titleWidth}
                lines={section.lines}
                delay={i * 0.08}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
