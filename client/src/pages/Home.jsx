import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory } from '../services/resumeService'
import { FileText, BarChart3, Trophy, Gauge, Upload, Briefcase, MessageSquare, Plus, TrendingUp, History as HistoryIcon, ChevronRight, Zap, Rocket } from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-2xl ${className}`} />
}

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const num = parseFloat(value) || 0
    if (num === 0) { setDisplay(0); return }
    let start = 0
    const step = num / 30
    const timer = setInterval(() => {
      start += step
      if (start >= num) { setDisplay(num); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 20)
    return () => clearInterval(timer)
  }, [value])
  return <span className="count-up">{display}{suffix}</span>
}

function StatCard({ Icon, label, value, sub, colorClass, glowClass, iconBg, iconText, accentColor, loading }) {
  if (loading) return <Skeleton className="h-[120px]" />
  const numVal = parseFloat(value) || 0
  const suffix = String(value).includes('%') ? '%' : ''
  return (
    <div className={`card-hover ${glowClass} bg-white dark:bg-[#0d1526] border-2 border-gray-200 dark:border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden transition-colors duration-200 shadow-sm hover:shadow-md`}>
      {/* top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: accentColor, opacity: 0.8 }} />

      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconText}`} />
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full live-dot relative ${iconText}`} />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#3d4a5c]">Live</span>
        </div>
      </div>

      <div>
        <p className={`text-[28px] font-extrabold font-headline leading-none tracking-tight ${colorClass}`}>
          <AnimatedNumber value={numVal} suffix={suffix} />
        </p>
        <p className="text-xs font-bold text-gray-700 dark:text-[#6b7a94] mt-1.5">{label}</p>
      </div>

      {sub && (
        <p className="text-[11px] text-green-500 dark:text-green-400/80 flex items-center gap-1 font-medium">
          <TrendingUp className="w-3 h-3" />{sub}
        </p>
      )}
    </div>
  )
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.score), 1)
  return (
    <div className="flex items-end gap-2 h-20 px-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group cursor-default">
          <div
            className="w-full rounded-t-md bg-primary/20 group-hover:bg-primary/60 transition-colors duration-200 relative"
            style={{ height: `${(d.score / max) * 100}%`, minHeight: 6 }}
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#111c35] border border-white/10 rounded-lg px-2 py-0.5 text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {d.score}%
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ATSGauge({ score }) {
  // Full circle ring — score fills proportionally
  const size = 88
  const r = 36
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#c0c1ff' : '#ffb4ab'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* track */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a2540" strokeWidth="7" />
          {/* fill — starts from top (-90deg) */}
          <circle
            cx={size/2} cy={size/2} r={r}
            fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)' }}
          />
        </svg>
        {/* centered score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold font-headline leading-none" style={{ color }}>{score}</span>
          <span className="text-[9px] text-[#6b7a94] mt-0.5">/ 100</span>
        </div>
      </div>
      <p className="text-xs font-bold" style={{ color }}>{label}</p>
      <p className="text-[10px] text-[#6b7a94]">ATS Score</p>
    </div>
  )
}

function ScoreBadge({ score }) {
  const cls = score >= 80
    ? 'text-green-400 bg-green-400/10 border-green-400/20'
    : score >= 60
    ? 'text-primary bg-primary/10 border-primary/20'
    : 'text-error bg-error/10 border-error/20'
  return (
    <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold tabular-nums ${cls}`}>{score}%</span>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory().then(setHistory).catch(console.error).finally(() => setLoading(false))
  }, [])

  const avgScore  = history.length ? Math.round(history.reduce((s, r) => s + (r.score || 0), 0) / history.length) : 0
  const avgAts    = history.length ? Math.round(history.reduce((s, r) => s + (r.atsScore || 0), 0) / history.length) : 0
  const best      = history.length ? Math.max(...history.map(r => r.score || 0)) : 0
  const chartData = [...history].reverse().slice(-8).map(r => ({ score: r.score || 0 }))

  const stats = [
    { Icon: FileText,  label: 'Resumes Analyzed', value: history.length,  sub: history.length > 0 ? 'Total uploads' : null,      colorClass: 'text-blue-600 dark:text-[#c0c1ff]', iconBg: 'bg-blue-100 dark:bg-[#c0c1ff]/10', iconText: 'text-blue-600 dark:text-[#c0c1ff]', accentColor: '#2563eb', glowClass: 'stat-card-primary' },
    { Icon: BarChart3, label: 'Avg Match Score',  value: `${avgScore}%`,  sub: avgScore > 0 ? 'Across all resumes' : null,         colorClass: 'text-teal-600 dark:text-blue-400',  iconBg: 'bg-teal-100 dark:bg-blue-400/10',  iconText: 'text-teal-600 dark:text-blue-400',  accentColor: '#0d9488', glowClass: 'stat-card-blue' },
    { Icon: Trophy,    label: 'Best Score',       value: `${best}%`,      sub: best > 0 ? 'Personal best' : null,                  colorClass: 'text-amber-600 dark:text-yellow-400',iconBg: 'bg-amber-100 dark:bg-yellow-400/10',iconText: 'text-amber-600 dark:text-yellow-400',accentColor: '#d97706', glowClass: 'stat-card-yellow' },
    { Icon: Gauge,     label: 'Avg ATS Score',    value: avgAts || 0,     sub: avgAts > 0 ? 'ATS readability' : null,              colorClass: 'text-emerald-600 dark:text-green-400', iconBg: 'bg-emerald-100 dark:bg-green-400/10', iconText: 'text-emerald-600 dark:text-green-400', accentColor: '#059669', glowClass: 'stat-card-green' },
  ]

  const quickActions = [
    { Icon: Upload,        label: 'Upload Resume',  sub: 'Analyze a new resume',  to: '/upload',     iconBg: 'bg-blue-100 dark:bg-[#c0c1ff]/10', iconText: 'text-blue-600 dark:text-[#c0c1ff]' },
    { Icon: Briefcase,     label: 'Browse Jobs',    sub: 'Track applications',     to: '/jobs',       iconBg: 'bg-teal-100 dark:bg-blue-400/10',  iconText: 'text-teal-600 dark:text-blue-400' },
    { Icon: MessageSquare, label: 'Interview Prep', sub: 'Practice questions',     to: '/interviews', iconBg: 'bg-purple-100 dark:bg-teal-500/10',iconText: 'text-purple-600 dark:text-teal-500' },
    { Icon: BarChart3,     label: 'View Analysis',  sub: 'See latest results',     to: '/result',     iconBg: 'bg-emerald-100 dark:bg-green-400/10', iconText: 'text-emerald-600 dark:text-green-400' },
  ]

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="animate-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-[#dae2fd] font-headline tracking-tight">Welcome back 👋</h1>
          <p className="text-sm font-semibold text-gray-700 dark:text-[#6b7a94] mt-0.5">Here's your career intelligence overview</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-[#c0c1ff] dark:to-[#8083ff] text-white dark:text-[#0b1120] text-sm font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={s.label} className="animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <StatCard {...s} loading={loading} />
          </div>
        ))}
      </div>

      {/* Score Trend + ATS Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        <div className="lg:col-span-2 animate-fade-up-2 card-hover bg-white dark:bg-[#0d1526] border-2 border-gray-200 dark:border-white/[0.07] rounded-2xl p-5 transition-colors duration-200 shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd]">Score Trend</p>
              <p className="text-xs font-medium text-gray-600 dark:text-[#6b7a94] mt-0.5">Last {chartData.length} analyses</p>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-[#c0c1ff]/8 border border-blue-200 dark:border-[#c0c1ff]/15 rounded-lg text-[10px] font-semibold text-blue-600 dark:text-[#c0c1ff] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#c0c1ff] live-dot relative" />Live
            </span>
          </div>
          {loading ? <Skeleton className="h-20" /> : chartData.length > 0 ? (
            <>
              <BarChart data={chartData} />
              <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 dark:border-white/[0.05]">
                <span className="text-[10px] font-semibold text-gray-600 dark:text-[#6b7a94]">Older</span>
                <span className="text-[10px] font-semibold text-gray-600 dark:text-[#6b7a94]">Recent</span>
              </div>
            </>
          ) : (
            <div className="h-20 flex items-center justify-center">
              <p className="text-xs font-medium text-gray-600 dark:text-[#6b7a94]">No data yet — upload a resume to start tracking</p>
            </div>
          )}
        </div>

        <div className="animate-fade-up-3 card-hover bg-white dark:bg-[#0d1526] border-2 border-gray-200 dark:border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-200 shadow-sm hover:shadow-md">
          {/* card header */}
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-600 dark:text-green-400" />
            <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd]">ATS Score</p>
          </div>

          {loading ? <Skeleton className="h-28" /> : (
            <>
              {/* gauge + bars side by side */}
              <div className="flex items-center gap-4">
                <ATSGauge score={avgAts} />
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Keywords', val: Math.min(avgAts + 5, 100), bar: 'bg-blue-500 dark:bg-[#c0c1ff]' },
                    { label: 'Format',   val: Math.max(avgAts - 3, 0),   bar: 'bg-emerald-500 dark:bg-green-400' },
                    { label: 'Overall',  val: avgAts,                     bar: 'bg-teal-500 dark:bg-blue-400' },
                  ].map(({ label, val, bar }) => (
                    <div key={label}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="font-semibold text-gray-600 dark:text-[#6b7a94]">{label}</span>
                        <span className="text-gray-900 dark:text-[#dae2fd] font-bold">{val}%</span>
                      </div>
                      <div className="h-1 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full ${bar} rounded-full fill-bar`} style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Analyses + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Recent */}
        <div className="lg:col-span-2 animate-fade-up-3 card-hover bg-white dark:bg-[#0d1526] border-2 border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden transition-colors duration-200 shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-blue-600 dark:text-[#c0c1ff]" />
              <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd]">Recent Analyses</p>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-[#c0c1ff] hover:text-blue-700 dark:hover:text-white font-semibold transition-colors"
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 bg-blue-50 dark:bg-[#c0c1ff]/8 border border-blue-200 dark:border-[#c0c1ff]/12 rounded-2xl flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-blue-600 dark:text-[#c0c1ff]" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-1">No analyses yet</p>
              <p className="text-xs font-medium text-gray-700 dark:text-[#6b7a94] mb-4">Upload your first resume to get started</p>
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-blue-100 dark:bg-[#c0c1ff]/10 border border-blue-200 dark:border-[#c0c1ff]/20 text-blue-600 dark:text-[#c0c1ff] text-xs font-bold rounded-xl hover:bg-blue-200 dark:hover:bg-[#c0c1ff]/18 transition-colors"
            >
                Upload Resume
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-white/[0.05]">
              {history.slice(0, 5).map((r, i) => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/result/${r.id}`)}
                  className="row-hover flex items-center gap-4 px-5 py-3.5 cursor-pointer group"
                >
                  <div className="w-9 h-9 bg-blue-50 dark:bg-[#c0c1ff]/8 border border-blue-200 dark:border-[#c0c1ff]/12 rounded-xl flex items-center justify-center text-blue-600 dark:text-[#c0c1ff] flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-[#c0c1ff]/15 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] truncate">{r.fileName}</p>
                    <p className="text-[11px] font-medium text-gray-700 dark:text-[#6b7a94] mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <ScoreBadge score={r.score || 0} />
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-[#3d4a5c] group-hover:text-blue-600 dark:group-hover:text-[#c0c1ff] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-up-4 card-hover bg-white dark:bg-[#0d1526] border-2 border-gray-200 dark:border-white/[0.07] rounded-2xl p-5 transition-colors duration-200 shadow-sm hover:shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-600 dark:text-[#c0c1ff]" />
            <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd]">Quick Actions</p>
          </div>
          <div className="space-y-1">
            {quickActions.map(({ Icon, label, sub, to, iconBg, iconText }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="action-row w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-left group hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg} icon-wrap`}>
                  <Icon className={`w-4 h-4 ${iconText}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-[#dae2fd] group-hover:text-gray-700 dark:group-hover:text-white transition-colors">{label}</p>
                  <p className="text-[10px] font-medium text-gray-700 dark:text-[#6b7a94]">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-[#3d4a5c] group-hover:text-blue-600 dark:group-hover:text-[#c0c1ff] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner — only when no history */}
      {history.length === 0 && !loading && (
        <div className="animate-fade-up-4 relative overflow-hidden bg-white dark:bg-[#0d1526] border-2 border-blue-200 dark:border-[#c0c1ff]/15 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-200 shadow-sm hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 dark:from-[#c0c1ff]/5 via-transparent to-teal-50 dark:to-blue-500/5 pointer-events-none" />
          <div>
            <p className="text-base font-extrabold text-gray-900 dark:text-[#dae2fd] font-headline">Get your first AI analysis</p>
            <p className="text-sm font-medium text-gray-700 dark:text-[#6b7a94] mt-1">Upload your resume and get an instant ATS score, job match, and interview prep</p>
          </div>
            <button
              onClick={() => navigate('/upload')}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-[#c0c1ff] dark:to-[#8083ff] text-white dark:text-[#0b1120] text-sm font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-sm"
            >
            <Rocket className="w-4 h-4" />
            Start Free
          </button>
        </div>
      )}
    </div>
  )
}
