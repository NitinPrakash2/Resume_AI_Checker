import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getInterviews, getAIAnswer } from '../services/resumeService'
import { Sparkles, X, MessageSquare, Quote, Lightbulb, ArrowRight, Brain, MapPin, ClipboardList, Zap, TrendingUp, CheckCircle2, Circle, FileText, ArrowLeft, Search } from 'lucide-react'

function AnswerModal({ item, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAIAnswer(item.question, item.resumeId)
      .then(setData).catch(() => setError('Failed to generate answer.')).finally(() => setLoading(false))
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [item])

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" onClick={onClose}>
      {/* Blurred backdrop */}
      <div className="fixed inset-0" style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)', 
        WebkitBackdropFilter: 'blur(10px)'
      }}></div>
      
      {/* Centering wrapper */}
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="relative bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-[#A6ADFF]/30 rounded-3xl p-8 w-full max-w-3xl shadow-2xl my-8 z-10" onClick={e => e.stopPropagation()}>
          {/* Close button */}
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all group">
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#A6ADFF] to-[#8892FF] rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white mb-0.5">AI Coached Answer</p>
              <p className="text-xs font-medium text-gray-700 dark:text-slate-400">Personalized response based on your resume</p>
            </div>
          </div>

          {/* Question card */}
          <div className="p-5 bg-gray-50 dark:bg-[#1a2540] border border-gray-200 dark:border-[#A6ADFF]/20 rounded-2xl mb-6">
            <div className="flex items-start gap-3">
              <Quote className="w-5 h-5 text-[#A6ADFF] flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-gray-900 dark:text-slate-200 leading-relaxed">{item.question}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <div className="w-14 h-14 border-3 border-[#A6ADFF]/20 border-t-[#A6ADFF] rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Generating Your Answer</p>
                <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">Analyzing your resume and crafting a personalized response...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center">
              <span className="material-symbols-outlined text-rose-400 text-3xl mb-2 block">error</span>
              <p className="text-rose-400 text-xs">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Suggested Answer */}
              <div className="p-5 bg-gray-50 dark:bg-[#1a2540] border border-gray-200 dark:border-[#A6ADFF]/30 rounded-2xl">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 bg-[#A6ADFF]/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-[#A6ADFF]" />
                  </div>
                  <p className="text-sm font-bold text-[#A6ADFF]">Suggested Answer</p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-200 leading-relaxed">{data?.answer}</p>
              </div>

              {/* Pro Tips */}
              {data?.tips?.length > 0 && (
                <div className="p-5 bg-gray-50 dark:bg-[#1a2540] border border-yellow-400/30 rounded-2xl">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-sm font-bold text-yellow-400">Pro Tips</p>
                  </div>
                  <div className="space-y-2.5">
                    {data.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3.5 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                        <ArrowRight className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-gray-900 dark:text-slate-200 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STAR Framework */}
              <div className="p-5 bg-gray-50 dark:bg-[#1a2540] border border-gray-200 dark:border-slate-600/40 rounded-2xl">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 bg-teal-500/20 rounded-xl flex items-center justify-center">
                    <Brain className="w-4 h-4 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">STAR Framework</p>
                    <p className="text-[10px] text-gray-600 dark:text-slate-400 font-medium">Structure your answer using this method</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { l: 'S — Situation', c: 'text-blue-400 bg-blue-400/10 border-blue-400/30', Icon: MapPin },
                    { l: 'T — Task', c: 'text-teal-500 bg-teal-500/10 border-teal-500/30', Icon: ClipboardList },
                    { l: 'A — Action', c: 'text-[#A6ADFF] bg-[#A6ADFF]/10 border-[#A6ADFF]/30', Icon: Zap },
                    { l: 'R — Result', c: 'text-green-400 bg-green-400/10 border-green-400/30', Icon: TrendingUp },
                  ].map(({ l, c, Icon }) => (
                    <div key={l} className={`px-3 py-2.5 rounded-xl border ${c} flex items-center gap-2 hover:scale-[1.02] transition-transform`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-bold">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

function QuestionCard({ item, index, onAnswer, practiced, onPractice }) {
  return (
    <div className={`bg-white dark:bg-[#0f1829] border rounded-2xl p-5 transition-all hover:shadow-lg ${practiced ? 'border-green-500/20' : 'border-gray-200 dark:border-white/6 hover:border-primary/20'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600/10 dark:bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-blue-600 dark:text-primary">Q{index + 1}</span>
          </div>
          {practiced && (
            <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold rounded-lg">Practiced</span>
          )}
        </div>
        <button onClick={() => onPractice(item.id)}
          className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all ${practiced ? 'bg-green-500/15 text-green-400' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-[#3d4a5c] hover:bg-green-500/10 hover:text-green-400'}`}>
          {practiced ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-sm text-gray-700 dark:text-[#8892a4] leading-relaxed mb-4 font-medium">"{item.question}"</p>

      <div className="flex items-center gap-2">
        <button onClick={() => onAnswer(item)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600/10 dark:bg-primary/10 border border-blue-600/20 dark:border-primary/20 text-blue-600 dark:text-primary text-xs font-bold rounded-xl hover:bg-blue-600/20 dark:hover:bg-primary/20 transition-all">
          <Sparkles className="w-4 h-4" />
          Get AI Answer
        </button>
        <div className="text-[10px] text-gray-500 dark:text-[#3d4a5c] flex items-center gap-1 font-medium">
          <FileText className="w-3 h-3" />
          <span className="truncate max-w-20">{item.fileName}</span>
        </div>
      </div>
    </div>
  )
}

export default function Interviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)
  const [search, setSearch] = useState('')
  const [practiced, setPracticed] = useState(new Set())
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getInterviews().then(setInterviews).catch(console.error).finally(() => setLoading(false))
  }, [])

  const togglePracticed = (id) => setPracticed(p => {
    const n = new Set(p)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const filtered = interviews.filter(i => {
    const matchSearch = !search || i.question.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'practiced' && practiced.has(i.id)) || (filter === 'pending' && !practiced.has(i.id))
    return matchSearch && matchFilter
  })

  const progress = interviews.length > 0 ? Math.round((practiced.size / interviews.length) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-up">
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-600 dark:text-[#8892a4] hover:text-primary transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-sm font-bold">Back</span>
      </button>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-[#dae2fd] font-headline tracking-tight">Interview Prep</h1>
          <p className="text-sm font-medium text-gray-700 dark:text-[#8892a4] mt-0.5">AI-predicted questions from your analyzed resumes</p>
        </div>
        {interviews.length > 0 && (
          <div className="flex items-center gap-3 bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/6 rounded-2xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-900 dark:text-[#dae2fd]">{practiced.size}/{interviews.length} practiced</p>
              <p className="text-[10px] text-gray-600 dark:text-[#3d4a5c] font-medium">Practice progress</p>
            </div>
            <div className="w-10 h-10 relative flex-shrink-0">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" className="stroke-gray-200 dark:stroke-[#1a2540]" strokeWidth="4" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="#3b82f6" className="dark:stroke-[#c0c1ff]" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-bold text-blue-600 dark:text-primary">{progress}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8892a4]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..."
            className="w-full bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/6 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-[#dae2fd] placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-primary/30 transition-all font-medium" />
        </div>
        <div className="flex gap-2">
          {[['all','All'],['pending','Pending'],['practiced','Practiced']].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filter === k ? 'bg-blue-600/15 dark:bg-primary/15 text-blue-600 dark:text-primary border border-blue-600/20 dark:border-primary/20 shadow-sm' : 'bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/6 text-gray-700 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-[#dae2fd] hover:shadow-md'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton rounded-2xl h-36" />)}
        </div>
      ) : interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#0f1829] border border-dashed border-gray-300 dark:border-white/8 rounded-2xl">
          <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-gray-400 dark:text-[#3d4a5c]">forum</span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-1">No interview questions yet</p>
          <p className="text-xs text-gray-600 dark:text-[#8892a4] font-medium">Analyze a resume to generate AI-predicted interview questions</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-gray-600 dark:text-[#8892a4] font-medium">No questions match your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, i) => (
            <QuestionCard key={item.id} item={item} index={i} onAnswer={setActive}
              practiced={practiced.has(item.id)} onPractice={togglePracticed} />
          ))}
        </div>
      )}

      {active && <AnswerModal item={active} onClose={() => setActive(null)} />}
    </div>
  )
}
