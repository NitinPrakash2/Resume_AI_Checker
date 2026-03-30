import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBenchmarkResumes, getLatestResumeId } from '../services/resumeService'
import { useBenchmark } from '../context/BenchmarkContext'
import {
  TrendingUp, Award, AlertCircle, Lightbulb, Users, Briefcase,
  Loader2, RefreshCw, ExternalLink, Zap, MapPin, DollarSign,
  ShieldAlert, Target, MessageSquareQuote, CheckCircle2, XCircle
} from 'lucide-react'

function HiringMeter({ value }) {
  const color = value >= 70 ? '#22c55e' : value >= 45 ? '#f59e0b' : '#ef4444'
  const darkColor = value >= 70 ? '#4ade80' : value >= 45 ? '#fbbf24' : '#f87171'
  const label = value >= 70 ? 'Strong Chance' : value >= 45 ? 'Moderate Chance' : 'Low Chance'
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28 sm:w-36 sm:h-36">
        <svg width="100%" height="100%" viewBox="0 0 144 144" className="-rotate-90">
          <circle cx="72" cy="72" r={r} fill="none" className="stroke-gray-200 dark:stroke-white/10" strokeWidth="10" />
          <circle cx="72" cy="72" r={r} fill="none" className="transition-all duration-1000"
            stroke={color} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-[#dae2fd]">{value}%</span>
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 dark:text-[#6b7a94] uppercase tracking-wide">chance</span>
        </div>
      </div>
      <span className="text-xs font-bold px-3 py-1 rounded-full border"
        style={{ color, borderColor: `${color}40`, background: `${color}15` }}>
        {label}
      </span>
    </div>
  )
}

const TIER_STYLES = {
  'Top 10%':      { bar: 'bg-green-500',  text: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-400/10',  border: 'border-green-300 dark:border-green-400/30' },
  'Top 25%':      { bar: 'bg-blue-500',   text: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-400/10',    border: 'border-blue-300 dark:border-blue-400/30' },
  'Average':      { bar: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400',bg: 'bg-yellow-50 dark:bg-yellow-400/10',border: 'border-yellow-300 dark:border-yellow-400/30' },
  'Below Average':{ bar: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400',bg: 'bg-orange-50 dark:bg-orange-400/10',border: 'border-orange-300 dark:border-orange-400/30' },
  'Needs Work':   { bar: 'bg-red-500',    text: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-400/10',      border: 'border-red-300 dark:border-red-400/30' },
}

const LOADING_STEPS = [
  { icon: '🌐', text: 'Fetching live job listings from Adzuna...' },
  { icon: '🔍', text: 'Scanning resume against top candidates...' },
  { icon: '🤖', text: 'AI recruiter is reviewing your profile...' },
  { icon: '📊', text: 'Generating benchmark report...' },
]

export default function Benchmark() {
  const navigate = useNavigate()
  const { loading, loadingStep, result, error, run } = useBenchmark()
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => { loadResumes() }, [])

  const loadResumes = async () => {
    try {
      setLoadingResumes(true)
      const [data, latestId] = await Promise.all([getBenchmarkResumes(), getLatestResumeId()])
      setResumes(data)
      if (data.length > 0) {
        const active = latestId ? data.find(r => r.id === latestId) : null
        setSelectedResume(active || data[0])
      }
    } catch { /* ignore */ }
    finally { setLoadingResumes(false) }
  }

  const tier = result ? (TIER_STYLES[result.ranking?.tier] || TIER_STYLES['Average']) : null

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto px-4 sm:px-6">

      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-[#dae2fd] font-headline tracking-tight flex items-center gap-2 sm:gap-3">
          <Award className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
          Recruiter Benchmark
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-[#6b7a94] mt-1">
          AI acts as a senior recruiter — compares you against top 10% candidates in real job market
        </p>
      </div>

      {/* Resume picker card */}
      <div className="animate-fade-up-2 bg-white dark:bg-[#0d1526] border-2 border-gray-300 dark:border-white/[0.07] rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-gray-900 dark:text-[#dae2fd]">Select Resume</span>

          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-400/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Market Data
          </span>
        </div>

        {loadingResumes ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-400/10 border-2 border-yellow-300 dark:border-yellow-400/20 rounded-xl text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            No resumes found.{' '}
            <button onClick={() => navigate('/upload')} className="underline font-bold">Upload one first</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-white/5 border-2 border-gray-300 dark:border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#dae2fd] focus:outline-none focus:border-primary transition-all text-left flex items-center justify-between"
              >
                <span className="truncate">
                  {selectedResume ? (
                    <>{selectedResume.fileName}{selectedResume.score ? ` (${selectedResume.score})` : ''}</>
                  ) : 'Select a resume'}
                </span>
                <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0d1526] border-2 border-gray-300 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {resumes.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedResume(r)
                        setDropdownOpen(false)
                      }}
                      className={`w-full px-3 sm:px-4 py-2.5 text-left text-xs sm:text-sm font-medium transition-colors ${
                        selectedResume?.id === r.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-800 dark:text-[#dae2fd] hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="truncate">
                        {r.fileName}{r.score ? ` (${r.score})` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedResume && (
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-xl text-xs text-gray-500 dark:text-[#6b7a94]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                <span className="font-bold text-gray-900 dark:text-[#dae2fd] break-words min-w-0 flex-1">{selectedResume.fileName}</span>
                {selectedResume.score && <span className="flex-shrink-0 whitespace-nowrap font-semibold text-gray-600 dark:text-[#6b7a94]">· Score {selectedResume.score}/100</span>}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => run(selectedResume)}
          disabled={loading || !selectedResume || resumes.length === 0}
          className="mt-4 w-full py-3 sm:py-4 btn-primary text-xs sm:text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> Analyzing with AI...</>
            : <><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> Run Recruiter Benchmark</>}
        </button>

        {/* Loading steps */}
        {loading && (
          <div className="mt-4 space-y-2">
            {LOADING_STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 text-xs transition-all duration-500 ${i <= loadingStep ? 'opacity-100' : 'opacity-30'}`}>
                <span className="text-base">{s.icon}</span>
                <span className={`font-semibold ${i === loadingStep ? 'text-primary' : i < loadingStep ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-[#6b7a94]'}`}>
                  {s.text}
                </span>
                {i < loadingStep && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto flex-shrink-0" />}
                {i === loadingStep && <Loader2 className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0 animate-spin" />}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 sm:p-4 bg-red-50 dark:bg-red-400/10 border-2 border-red-300 dark:border-red-400/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* ── RESULTS ── */}
      {result && (
        <div className="space-y-4 animate-fade-up-3">

          {/* Recruiter Verdict banner */}
          {result.recruiterVerdict && (
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-100 to-gray-50 dark:from-[#0d1526] dark:to-[#111d35] border-2 border-gray-300 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              <div className="flex items-start gap-2 sm:gap-3 relative z-10">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquareQuote className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest mb-1">Recruiter's First Impression</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white leading-relaxed">"{result.recruiterVerdict}"</p>
                </div>
              </div>
            </div>
          )}

          {/* Ranking + Hiring Chance */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Ranking card */}
            <div className={`bg-white dark:bg-[#0d1526] border-2 ${tier.border} rounded-2xl p-4 sm:p-6 shadow-md`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-600 dark:text-[#6b7a94] uppercase tracking-wider">Market Ranking</p>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-baseline gap-2 sm:gap-3 mb-3">
                <span className={`text-3xl sm:text-4xl md:text-5xl font-extrabold font-headline ${tier.text}`}>
                  Top {result.ranking.percentile}%
                </span>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${tier.bg} ${tier.text} ${tier.border}`}>
                {result.ranking.tier}
              </span>
              {result.ranking.vsTopCandidates && (
                <p className="text-xs font-medium text-gray-600 dark:text-[#6b7a94] mt-3 leading-relaxed">
                  {result.ranking.vsTopCandidates}
                </p>
              )}
            </div>

            {/* Hiring chance */}
            <div className="bg-white dark:bg-[#0d1526] border-2 border-gray-300 dark:border-white/[0.07] rounded-2xl p-4 sm:p-6 shadow-md flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-gray-600 dark:text-[#6b7a94] uppercase tracking-wider mb-4">Interview Probability</p>
              <HiringMeter value={result.hiringChance} />
            </div>
          </div>

          {/* Live Jobs */}
          {result.matchedJobs?.length > 0 && (
            <div className="bg-white dark:bg-[#0d1526] border-2 border-gray-300 dark:border-white/[0.07] rounded-2xl p-4 sm:p-5 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-[#dae2fd]">Live Jobs Benchmarked Against</h3>
                </div>
                <span className="ml-0 sm:ml-auto text-xs font-semibold px-2 py-0.5 bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-400/20 rounded-full w-fit">
                  Adzuna Live
                </span>
              </div>
              <div className="space-y-2">
                {result.matchedJobs.map(job => (
                  <div key={job.id} className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 hover:border-primary/40 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-[#dae2fd] leading-tight flex-1">{job.title}</p>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer"
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-primary transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 dark:text-[#8892a4] mb-2 font-semibold">{job.company}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-gray-600 dark:text-[#6b7a94]">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>{job.location}</span>
                        </span>
                      )}
                      {job.salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 flex-shrink-0" />
                          <span>{job.salary}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {result.weaknesses?.length > 0 && (
            <div className="bg-white dark:bg-[#0d1526] border-2 border-red-300 dark:border-red-400/20 rounded-2xl p-4 sm:p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-base font-bold text-red-700 dark:text-red-400">What's Holding You Back</h3>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-red-100 dark:bg-red-400/10 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-400/20 rounded-full">
                  Recruiter View
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {result.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 rounded-xl">
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide mb-1">{w.area}</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-[#dae2fd] leading-relaxed">{w.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {result.missingSkills?.length > 0 && (
            <div className="bg-white dark:bg-[#0d1526] border-2 border-orange-300 dark:border-orange-400/20 rounded-2xl p-4 sm:p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-base font-bold text-orange-700 dark:text-orange-400">Skills Top 10% Candidates Have</h3>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {result.missingSkills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-orange-50 dark:bg-orange-400/10 border-2 border-orange-300 dark:border-orange-400/20 text-orange-800 dark:text-orange-400 text-xs sm:text-sm font-bold rounded-lg">
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="bg-white dark:bg-[#0d1526] border-2 border-blue-300 dark:border-primary/20 rounded-2xl p-4 sm:p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-blue-700 dark:text-primary" />
                <h3 className="text-base font-bold text-blue-700 dark:text-primary">How to Reach Top 10%</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/20 rounded-xl">
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                      <span className="w-6 h-6 bg-blue-600 dark:bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        s.priority === 'High'
                          ? 'bg-red-100 dark:bg-red-400/20 text-red-700 dark:text-red-400'
                          : 'bg-yellow-100 dark:bg-yellow-400/20 text-yellow-700 dark:text-yellow-400'
                      }`}>{s.priority}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-1">{s.action}</p>
                      <p className="text-xs font-medium text-gray-600 dark:text-[#6b7a94] leading-relaxed">{s.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Insights */}
          {result.marketInsights && (
            <div className="bg-white dark:bg-[#0d1526] border-2 border-gray-300 dark:border-white/[0.07] rounded-2xl p-4 sm:p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-gray-900 dark:text-[#dae2fd]">Market Intelligence</h3>

              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {result.marketInsights.demandLevel && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-[#6b7a94] mb-1 uppercase tracking-wide">Demand</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                        result.marketInsights.demandLevel === 'High' ? 'bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-400/20' :
                        result.marketInsights.demandLevel === 'Low'  ? 'bg-red-100 dark:bg-red-400/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-400/20' :
                        'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/20'
                      }`}>{result.marketInsights.demandLevel} Demand</span>
                    </div>
                  )}
                  {result.marketInsights.salaryRange && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-[#6b7a94] mb-1 uppercase tracking-wide">Salary Range</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd]">{result.marketInsights.salaryRange}</p>
                    </div>
                  )}
                  {result.marketInsights.topRoles?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-[#6b7a94] mb-1 uppercase tracking-wide">Best Fit Roles</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.marketInsights.topRoles.map((r, i) => (
                          <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {result.marketInsights.standoutTip && (
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
                    <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                      <Zap className="w-3 h-3" /> #1 Thing to Stand Out
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-[#dae2fd] leading-relaxed">{result.marketInsights.standoutTip}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Re-run */}
          <button
            onClick={() => run(selectedResume)}
            disabled={loading}
            className="w-full py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl text-sm font-bold text-gray-700 dark:text-[#6b7a94] hover:border-primary hover:text-primary dark:hover:text-primary transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Re-run Analysis
          </button>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && resumes.length > 0 && (
        <div className="bg-white dark:bg-[#0d1526] border-2 border-dashed border-gray-300 dark:border-white/[0.07] rounded-2xl p-8 sm:p-10 md:p-14 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-[#dae2fd] mb-2">Ready for Your Benchmark?</h3>
          <p className="text-sm font-medium text-gray-600 dark:text-[#6b7a94] max-w-xs mx-auto leading-relaxed">
            Our AI acts as a senior recruiter and compares you against top 10% candidates using live job market data.
          </p>
        </div>
      )}
    </div>
  )
}
