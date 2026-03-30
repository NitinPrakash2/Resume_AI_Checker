import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getResult } from '../services/resumeService'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl ${className}`} />
}

function ScoreRing({ score, size = 140 }) {
  const r = size / 2 - 10
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#3b82f6' : '#fb7185'
  const darkColor = score >= 80 ? '#4ade80' : score >= 60 ? '#A6ADFF' : '#fb7185'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'
  const glowColor = score >= 80 ? 'rgba(74, 222, 128, 0.3)' : score >= 60 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(251, 113, 133, 0.3)'
  const darkGlowColor = score >= 80 ? 'rgba(74, 222, 128, 0.3)' : score >= 60 ? 'rgba(166, 173, 255, 0.3)' : 'rgba(251, 113, 133, 0.3)'
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full blur-2xl opacity-40 dark:hidden" style={{ background: glowColor }} />
        <div className="absolute inset-0 rounded-full blur-2xl opacity-40 hidden dark:block" style={{ background: darkGlowColor }} />
        <svg width={size} height={size} className="-rotate-90 relative z-10">
          <circle cx={size/2} cy={size/2} r={r} fill="none" className="stroke-gray-200 dark:stroke-[#1a2540]" strokeWidth="10" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" className="dark:hidden transition-all duration-1000 ease-out" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" className="hidden dark:block transition-all duration-1000 ease-out" stroke={darkColor} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-gray-900 dark:text-white text-4xl">{score}</span>
          <span className="text-gray-500 dark:text-slate-400 text-xs font-medium">out of 100</span>
        </div>
      </div>
      <span className="text-xs font-bold px-3 py-1.5 rounded-xl border dark:hidden" style={{ color, borderColor: `${color}30`, background: `${color}15` }}>{label}</span>
      <span className="text-xs font-bold px-3 py-1.5 rounded-xl border hidden dark:inline-block" style={{ color: darkColor, borderColor: `${darkColor}30`, background: `${darkColor}15` }}>{label}</span>
    </div>
  )
}

function ProgressBar({ value, color = 'bg-blue-600 dark:bg-[#A6ADFF]' }) {
  return (
    <div className="h-2 bg-gray-200 dark:bg-slate-800/50 rounded-full overflow-hidden relative">
      <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`} style={{ width: `${value}%` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  )
}

function AnswerModal({ question, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      {/* Enhanced backdrop with strong blur */}
      <div className="absolute inset-0 bg-slate-900/60" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }} />
      
      <div className="relative bg-[#0f1829]/95 border border-slate-700/50 rounded-3xl p-4 sm:p-8 max-w-3xl w-full shadow-2xl animate-scale-in overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()} style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 via-transparent to-slate-900/20 rounded-3xl pointer-events-none" />
        
        {/* Close button */}
        <button onClick={onClose} className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all group z-10">
          <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">close</span>
        </button>
        
        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 mb-5 sm:mb-8 pr-10">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#A6ADFF] to-[#8892FF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#A6ADFF]/30 relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#A6ADFF] to-[#8892FF] rounded-2xl blur-xl opacity-50 animate-pulse" />
            <span className="material-symbols-outlined text-white text-xl sm:text-2xl relative z-10">auto_awesome</span>
          </div>
          <div>
            <p className="text-base sm:text-xl font-bold text-white mb-1">AI Answer Framework</p>
            <p className="text-xs sm:text-sm text-slate-400">Use the STAR method for structured, impactful responses</p>
          </div>
        </div>
        
        {/* Question card */}
        <div className="relative z-10 p-6 bg-gradient-to-br from-[#1a2540]/80 to-[#0f1829]/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl mb-8 shadow-inner">
          <div className="flex items-start gap-3 mb-3">
            <span className="material-symbols-outlined text-[#A6ADFF] text-xl flex-shrink-0">format_quote</span>
            <p className="text-base text-white leading-relaxed font-medium">{question}</p>
          </div>
        </div>
        
        {/* STAR Framework */}
        <div className="relative z-10 space-y-3 mb-5 sm:mb-8">
          {[
            { 
              label: 'S', 
              title: 'Situation', 
              desc: 'Set the scene by describing the context and background of the scenario.', 
              color: 'from-blue-500/20 to-blue-600/20', 
              borderColor: 'border-blue-400/30',
              textColor: 'text-blue-400',
              icon: 'location_on',
              bgGlow: 'bg-blue-500/10'
            },
            { 
              label: 'T', 
              title: 'Task', 
              desc: 'Explain your specific responsibility or the challenge you faced.', 
              color: 'from-purple-500/20 to-purple-600/20', 
              borderColor: 'border-purple-400/30',
              textColor: 'text-purple-400',
              icon: 'assignment',
              bgGlow: 'bg-purple-500/10'
            },
            { 
              label: 'A', 
              title: 'Action', 
              desc: 'Detail the specific steps you took to address the task or challenge.', 
              color: 'from-[#A6ADFF]/20 to-[#8892FF]/20', 
              borderColor: 'border-[#A6ADFF]/30',
              textColor: 'text-[#A6ADFF]',
              icon: 'bolt',
              bgGlow: 'bg-[#A6ADFF]/10'
            },
            { 
              label: 'R', 
              title: 'Result', 
              desc: 'Share the outcome with quantifiable metrics and measurable impact.', 
              color: 'from-green-500/20 to-green-600/20', 
              borderColor: 'border-green-400/30',
              textColor: 'text-green-400',
              icon: 'trending_up',
              bgGlow: 'bg-green-500/10'
            },
          ].map(({ label, title, desc, color, borderColor, textColor, icon, bgGlow }, idx) => (
            <div key={label} 
              className={`group relative bg-gradient-to-br ${color} backdrop-blur-xl border ${borderColor} rounded-2xl p-5 transition-all hover:scale-[1.02] cursor-default`}
              style={{ animationDelay: `${idx * 0.1}s` }}>
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 ${bgGlow} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
              
              <div className="relative z-10 flex items-start gap-3">
                {/* Letter badge */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgGlow} border ${borderColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <span className={`text-lg sm:text-xl font-bold ${textColor}`}>{label}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`material-symbols-outlined text-lg ${textColor}`}>{icon}</span>
                    <p className={`text-base font-bold ${textColor}`}>{title}</p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pro tip */}
        <div className="relative z-10 p-5 bg-gradient-to-r from-[#A6ADFF]/10 to-blue-500/10 backdrop-blur-xl border border-[#A6ADFF]/20 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#A6ADFF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#A6ADFF] text-lg">tips_and_updates</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#A6ADFF] mb-1">Pro Tip</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Practice your answer out loud and aim for 1-2 minutes. Include specific numbers, percentages, and measurable outcomes whenever possible to make your response more compelling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const TABS = ['Overview', 'ATS Report', 'Skill Gaps', 'Interview Prep']

export default function Result() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [tab, setTab] = useState(0)
  const [activeQ, setActiveQ] = useState(null)
  const [showJobsNotif, setShowJobsNotif] = useState(false)

  useEffect(() => {
    if (!id) return
    getResult(id).then(setResult).catch(() => setError('Could not load result.')).finally(() => setLoading(false))
    // Show jobs notification if coming from upload
    if (location.state?.showJobsPrompt) {
      setShowJobsNotif(true)
      setTimeout(() => setShowJobsNotif(false), 8000)
    }
  }, [id, location])

  if (!id) return (
    <div className="flex flex-col items-center justify-center h-96 text-center animate-fade-up">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-[#A6ADFF]/20 dark:to-[#8892FF]/20 rounded-3xl flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-[#A6ADFF] dark:to-[#8892FF] rounded-3xl blur-xl opacity-20 animate-pulse" />
        <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-[#A6ADFF] relative z-10">analytics</span>
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Analysis Selected</p>
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-8 max-w-md">Upload your resume to get AI-powered insights, ATS scoring, and personalized recommendations</p>
      <button onClick={() => navigate('/upload')} className="px-6 py-3 btn-primary rounded-xl text-sm hover:scale-105">
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">upload</span>
          Upload Resume
        </span>
      </button>
    </div>
  )

  if (loading) return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-12 w-96" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80 lg:col-span-2" />
      </div>
    </div>
  )

  if (error || !result) return (
    <div className="flex flex-col items-center justify-center h-96 gap-5 animate-fade-up">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-3xl flex items-center justify-center relative">
        <div className="absolute inset-0 bg-red-500 rounded-3xl blur-xl opacity-20 animate-pulse" />
        <span className="material-symbols-outlined text-5xl text-red-500 dark:text-red-400 relative z-10">error</span>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Analysis</p>
        <p className="text-gray-600 dark:text-slate-400 text-sm">{error || 'Result not found. Please try uploading again.'}</p>
      </div>
      <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">refresh</span>
        Try Again
      </button>
    </div>
  )

  const keywords    = result.keywords    || []
  const missing     = result.missing     || []
  const suggestions = result.suggestions || []
  const questions   = result.questions   || []
  const score       = result.score       ?? 0
  const atsScore    = result.atsScore    ?? score

  return (
    <>
      {activeQ && <AnswerModal question={activeQ} onClose={() => setActiveQ(null)} />}

      {/* Jobs notification */}
      {showJobsNotif && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 animate-slide-in-right w-[calc(100vw-2rem)] sm:w-auto max-w-sm">
          <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-blue-200 dark:border-[#A6ADFF]/30 rounded-2xl p-5 shadow-2xl shadow-blue-600/10 dark:shadow-[#A6ADFF]/10 max-w-sm backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 dark:from-[#A6ADFF] dark:to-[#8892FF] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20 dark:shadow-[#A6ADFF]/20">
                <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Resume Analyzed Successfully!</p>
                <p className="text-xs text-gray-600 dark:text-slate-400 mb-4">We've found jobs that match your skills</p>
                <button onClick={() => navigate('/jobs')}
                  className="w-full py-2.5 btn-primary text-sm rounded-xl hover:scale-[1.02] flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">work</span>
                  View Matched Jobs
                </button>
              </div>
              <button onClick={() => setShowJobsNotif(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 animate-fade-up">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-[#A6ADFF] transition-all group">
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="text-sm font-semibold">Back to Dashboard</span>
        </button>
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-[#A6ADFF]/10 dark:to-[#8892FF]/10 border border-blue-300 dark:border-[#A6ADFF]/20 text-blue-600 dark:text-[#A6ADFF] text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                AI Analysis
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-500">{new Date(result.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2 flex items-start gap-2 sm:gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-[#A6ADFF] text-2xl sm:text-3xl flex-shrink-0 mt-0.5">description</span>
              <span className="break-all">{result.fileName}</span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">Comprehensive resume analysis with ATS scoring and skill gap identification</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button onClick={() => navigate('/jobs')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 btn-primary text-sm rounded-xl hover:scale-105">
              <span className="material-symbols-outlined text-lg">work</span>
              <span className="hidden sm:inline">View Matched Jobs</span>
              <span className="sm:hidden">Jobs</span>
            </button>
            <button onClick={() => navigate('/upload')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-sm font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-lg">add</span>
              <span className="hidden sm:inline">New Analysis</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Score cards row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Job Match Score', value: `${score}%`, icon: 'analytics', color: score >= 80 ? 'text-green-400' : score >= 60 ? 'text-blue-600 dark:text-[#A6ADFF]' : 'text-rose-400', bg: score >= 80 ? 'bg-green-400/10' : score >= 60 ? 'bg-blue-600/10 dark:bg-[#A6ADFF]/10' : 'bg-rose-400/10', glow: score >= 80 ? 'shadow-green-400/20' : score >= 60 ? 'shadow-blue-600/20 dark:shadow-[#A6ADFF]/20' : 'shadow-rose-400/20' },
            { label: 'Est. ATS Score', value: `${atsScore}`, icon: 'speed', color: atsScore >= 80 ? 'text-green-400' : 'text-yellow-400', bg: atsScore >= 80 ? 'bg-green-400/10' : 'bg-yellow-400/10', glow: atsScore >= 80 ? 'shadow-green-400/20' : 'shadow-yellow-400/20' },
            { label: 'Keywords Found', value: keywords.length, icon: 'tag', color: 'text-blue-400', bg: 'bg-blue-400/10', glow: 'shadow-blue-400/20' },
            { label: 'Skill Gaps', value: missing.length, icon: 'warning', color: 'text-orange-400', bg: 'bg-orange-400/10', glow: 'shadow-orange-400/20' },
          ].map(({ label, value, icon, color, bg, glow }) => (
            <div key={label} className="group relative bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-slate-600 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity ${glow} blur-xl`} />
              <div className="relative z-10">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined text-lg sm:text-xl ${color}`}>{icon}</span>
                </div>
                <p className={`text-2xl sm:text-3xl font-bold ${color} mb-1`}>{value}</p>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-slate-400 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-1.5 w-full sm:w-fit shadow-sm overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${
                tab === i 
                  ? 'btn-primary shadow-lg' 
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score ring */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-[#A6ADFF]/5 dark:to-transparent" />
              <div className="relative z-10 text-center w-full">
                <p className="text-base font-bold text-gray-900 dark:text-white mb-6">Overall Job Match Score</p>
                <ScoreRing score={score} size={160} />
                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mt-6 px-4">{result.summary || 'Your resume has been analyzed against industry standards and job requirements.'}</p>
              </div>
            </div>

            {/* Summary + keywords */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600/10 dark:bg-[#A6ADFF]/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 dark:text-[#A6ADFF] text-xl">speed</span>
                  </div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">ATS Compatibility Breakdown</p>
                </div>
                <div className="space-y-4">
                  {[
                  { label: 'Overall Est. ATS Score', val: atsScore },
                    { label: 'Keyword Density', val: Math.min(atsScore + 4, 100) },
                    { label: 'Format Score', val: Math.max(atsScore - 5, 0) },
                    { label: 'Readability', val: Math.min(atsScore + 8, 100) },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 dark:text-slate-300 font-medium">{label}</span>
                        <span className="text-gray-900 dark:text-white font-bold">{val}%</span>
                      </div>
                      <ProgressBar value={val} color={val >= 80 ? 'bg-green-400' : val >= 60 ? 'bg-blue-600 dark:bg-[#A6ADFF]' : 'bg-yellow-400'} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-400 text-xl">check_circle</span>
                  </div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">Detected Keywords</p>
                  <span className="ml-auto px-3 py-1 bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-bold rounded-lg">{keywords.length} found</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.length > 0 ? keywords.map(k => (
                    <span key={k} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl font-medium hover:bg-green-500/20 transition-colors">{k}</span>
                  )) : <p className="text-sm text-gray-500 dark:text-slate-500">No keywords detected in your resume</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: ATS Report */}
        {tab === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-green-400/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-400 text-xl">check_circle</span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">Detected Keywords</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">Found in your resume</p>
                  </div>
                  <span className="ml-auto px-3 py-1.5 bg-green-400/10 border border-green-400/20 text-green-400 text-sm font-bold rounded-lg">{keywords.length}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {keywords.length > 0 ? keywords.map(k => (
                    <span key={k} className="px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl font-medium flex items-center gap-2 hover:bg-green-500/20 transition-colors">
                      <span className="material-symbols-outlined text-base">check</span>{k}
                    </span>
                  )) : <p className="text-sm text-gray-600 dark:text-slate-500">No keywords detected</p>}
                </div>
              </div>

              <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-rose-400/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-rose-400 text-xl">cancel</span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">Missing Keywords</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">Add these to improve ATS score</p>
                  </div>
                  <span className="ml-auto px-3 py-1.5 bg-rose-400/10 border border-rose-400/20 text-rose-400 text-sm font-bold rounded-lg">{missing.length}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {missing.length > 0 ? missing.map(k => (
                    <span key={k} className="px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl font-medium flex items-center gap-2 hover:bg-rose-500/20 transition-colors">
                      <span className="material-symbols-outlined text-base">add</span>{k}
                    </span>
                  )) : <p className="text-sm text-green-400 flex items-center gap-2"><span className="material-symbols-outlined text-lg">check_circle</span>No missing keywords</p>}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#A6ADFF]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#A6ADFF] text-xl">analytics</span>
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white">Detailed ATS Score Breakdown</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { label: 'Est. ATS Score', val: atsScore, color: 'text-[#A6ADFF]', bg: 'bg-[#A6ADFF]/10', icon: 'speed' },
                  { label: 'Keywords', val: Math.min(atsScore + 4, 100), color: 'text-green-400', bg: 'bg-green-400/10', icon: 'tag' },
                  { label: 'Formatting', val: Math.max(atsScore - 5, 0), color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: 'format_align_left' },
                  { label: 'Readability', val: Math.min(atsScore + 8, 100), color: 'text-blue-400', bg: 'bg-blue-400/10', icon: 'visibility' },
                ].map(({ label, val, color, bg, icon }) => (
                  <div key={label} className={`${bg} rounded-xl p-5 text-center hover:scale-105 transition-transform`}>
                    <div className="flex justify-center mb-3">
                      <span className={`material-symbols-outlined ${color} text-2xl`}>{icon}</span>
                    </div>
                    <p className={`text-3xl font-bold ${color} mb-2`}>{val}</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Skill Gaps */}
        {tab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-rose-400/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-400 text-xl">warning</span>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">Critical Gaps</p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">Areas needing improvement</p>
                </div>
              </div>
              <div className="space-y-3">
                {suggestions.length > 0 ? suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl hover:bg-rose-500/10 transition-colors group">
                    <span className="material-symbols-outlined text-rose-400 text-lg flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">arrow_right</span>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{s}</p>
                  </div>
                )) : (
                  <div className="flex items-center gap-3 text-green-400 text-sm p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    <span>No critical gaps detected - great job!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-400/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-400 text-xl">lightbulb</span>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">Skills to Add</p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">Boost your resume strength</p>
                </div>
              </div>
              <div className="space-y-3">
                {missing.length > 0 ? missing.map((k, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl hover:bg-orange-500/10 transition-colors group">
                    <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">{k}</span>
                    <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-lg border border-orange-400/20 group-hover:bg-orange-400/20 transition-colors">Add to resume</span>
                  </div>
                )) : (
                  <div className="flex items-center gap-3 text-green-400 text-sm p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    <span>All key skills are present</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Interview Prep */}
        {tab === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#A6ADFF]/10 to-[#8892FF]/10 border border-[#A6ADFF]/20 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#A6ADFF]/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#A6ADFF] text-xl">auto_awesome</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{questions.length} AI-Predicted Questions</p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">Based on your resume and industry standards</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-[#A6ADFF]/10 border border-[#A6ADFF]/20 text-[#A6ADFF] text-xs font-bold rounded-xl">Click any question for STAR framework</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {questions.length > 0 ? questions.map((q, i) => (
                <div key={i} onClick={() => setActiveQ(q)}
                  className="group relative bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 hover:border-[#A6ADFF]/30 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#A6ADFF]/10">
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity shadow-[#A6ADFF]/20 blur-xl" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#A6ADFF]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#A6ADFF]/20 transition-colors">
                        <span className="text-sm font-bold text-[#A6ADFF]">Q{i + 1}</span>
                      </div>
                      <span className="material-symbols-outlined text-gray-400 dark:text-slate-500 group-hover:text-[#A6ADFF] text-xl transition-colors group-hover:rotate-12">auto_awesome</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white leading-relaxed mb-4 transition-colors">"{q}"</p>
                    <div className="flex items-center gap-2 text-[#A6ADFF] text-xs font-bold uppercase tracking-wider">
                      <span>Get AI Answer</span>
                      <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="md:col-span-2 flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gradient-to-br dark:from-[#1a2540] dark:to-[#0f1829] border border-gray-200 dark:border-slate-700/50 rounded-2xl">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700/30 rounded-2xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-slate-500">forum</span>
                  </div>
                  <p className="text-base font-bold text-gray-900 dark:text-white mb-2">No Interview Questions Generated</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Upload a more detailed resume to get personalized questions</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
