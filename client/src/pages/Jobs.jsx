import { useEffect, useState } from 'react'
import { getJobs, createJob, updateJob, deleteJob, searchJobs, getAISuggestedJobs, getLatestResumeId, getHistory } from '../services/resumeService'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUS = {
  saved:        { label: 'Saved',        color: 'text-[#8892a4]', bg: 'bg-[#8892a4]/10', border: 'border-[#8892a4]/20', dot: 'bg-[#8892a4]' },
  applied:      { label: 'Applied',      color: 'text-primary',   bg: 'bg-primary/10',    border: 'border-primary/20',   dot: 'bg-primary' },
  interviewing: { label: 'Interviewing', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', dot: 'bg-purple-400' },
  offer:        { label: 'Offer',        color: 'text-green-400', bg: 'bg-green-400/10',  border: 'border-green-400/20', dot: 'bg-green-400' },
  rejected:     { label: 'Rejected',     color: 'text-red-400',   bg: 'bg-red-400/10',    border: 'border-red-400/20',   dot: 'bg-red-400' },
}

const EMPTY = { title: '', company: '', url: '', location: '', salary: '', status: 'saved', notes: '' }

function Modal({ job, onClose, onSave }) {
  const [form, setForm] = useState(job || EMPTY)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.title || !form.company) { setErr('Title and company are required'); return }
    setSaving(true)
    try { await onSave(form); onClose() }
    catch (e) { setErr(e.response?.data?.error || 'Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-bold text-gray-900 dark:text-[#dae2fd]">{job ? 'Edit Job' : 'Add New Job'}</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-[#8892a4] transition-all">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
        {err && <p className="text-red-400 text-xs mb-4 p-3 bg-red-400/10 rounded-xl border border-red-400/20 font-medium">{err}</p>}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[['title','Job Title *','Senior Designer'],['company','Company *','Stripe']].map(([k,l,p]) => (
              <div key={k}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#3d4a5c] mb-1.5 block">{l}</label>
                <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={p}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-[#dae2fd] placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-primary/30 transition-all font-medium" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[['location','Location','Remote / NYC'],['salary','Salary','$120k-$150k']].map(([k,l,p]) => (
              <div key={k}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#3d4a5c] mb-1.5 block">{l}</label>
                <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={p}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-[#dae2fd] placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-primary/30 transition-all font-medium" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#3d4a5c] mb-1.5 block">Job URL</label>
            <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://..."
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-[#dae2fd] placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-primary/30 transition-all font-medium" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#3d4a5c] mb-1.5 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-[#dae2fd] outline-none focus:border-primary/30 transition-all font-medium">
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#3d4a5c] mb-1.5 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Recruiter name, next steps..."
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-[#dae2fd] placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none resize-none focus:border-primary/30 transition-all font-medium" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-[#dae2fd] rounded-2xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] font-bold rounded-2xl text-sm disabled:opacity-50 transition-all">
            {saving ? 'Saving...' : 'Save Job'}
          </button>
        </div>
      </div>
    </div>
  )
}

function JobCard({ job, onEdit, onDelete, onStatus }) {
  const s = STATUS[job.status]
  return (
    <div className="bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/6 rounded-2xl p-4 group hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] truncate">{job.title}</p>
          <p className="text-xs text-gray-600 dark:text-[#8892a4] flex items-center gap-1 mt-0.5 font-medium">
            <span className="material-symbols-outlined text-xs">business</span>{job.company}
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex-shrink-0 ${s.color} ${s.bg} ${s.border}`}>{s.label}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {job.location && <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#3d4a5c] font-medium"><span className="material-symbols-outlined text-xs">location_on</span>{job.location}</span>}
        {job.salary   && <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#3d4a5c] font-medium"><span className="material-symbols-outlined text-xs">payments</span>{job.salary}</span>}
      </div>

      {job.notes && <p className="text-[10px] text-gray-500 dark:text-[#3d4a5c] mb-3 truncate font-medium">{job.notes}</p>}

      <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-white/5">
        <select value={job.status} onChange={e => onStatus(job.id, e.target.value)}
          className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 text-[10px] text-gray-700 dark:text-[#8892a4] rounded-xl px-2 py-1.5 outline-none font-medium">
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="w-7 h-7 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-primary/15 text-gray-600 dark:text-[#8892a4] hover:text-primary transition-all">
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>}
        <button onClick={() => onEdit(job)} className="w-7 h-7 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-[#dae2fd] transition-all">
          <span className="material-symbols-outlined text-sm">edit</span>
        </button>
        <button onClick={() => onDelete(job.id)} className="w-7 h-7 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-400/15 text-gray-600 dark:text-[#8892a4] hover:text-red-400 transition-all">
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  )
}

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold animate-fade-up pointer-events-auto ${
          t.type === 'success'
            ? 'bg-white dark:bg-[#0f1829] border-green-400/30 text-gray-900 dark:text-[#dae2fd]'
            : t.type === 'error'
            ? 'bg-white dark:bg-[#0f1829] border-red-400/30 text-gray-900 dark:text-[#dae2fd]'
            : 'bg-white dark:bg-[#0f1829] border-yellow-400/30 text-gray-900 dark:text-[#dae2fd]'
        }`}>
          <span className={`material-symbols-outlined text-[18px] ${
            t.type === 'success' ? 'text-green-400' : t.type === 'error' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {t.type === 'success' ? 'bookmark_added' : t.type === 'error' ? 'error' : 'info'}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [matchedJobs, setMatchedJobs] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [viewMode, setViewMode] = useState('ai')
  const [manualSearch, setManualSearch] = useState('')
  const [manualLocation, setManualLocation] = useState('')
  const [manualJobs, setManualJobs] = useState([])
  const [loadingManual, setLoadingManual] = useState(false)
  const [savingJob, setSavingJob] = useState(null) // index being saved
  const [toasts, setToasts] = useState([])

  const showToast = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  const isAlreadySaved = (job) =>
    jobs.some(j =>
      j.title.toLowerCase() === job.title.toLowerCase() &&
      (j.company || '').toLowerCase() === (job.company || '').toLowerCase()
    )

  const load = () => getJobs().then(setJobs).catch(console.error).finally(() => setLoading(false))

  const loadMatchedJobs = async () => {
    setLoadingMatches(true)
    try {
      // 1. Try getting latest resume ID from DB
      let resumeId = await getLatestResumeId()

      // 2. Fallback: use most recent resume from history
      if (!resumeId) {
        const hist = await getHistory()
        if (hist && hist.length > 0) resumeId = hist[0].id
      }

      if (!resumeId) {
        setMatchedJobs([])
        return
      }

      const results = await getAISuggestedJobs(resumeId)
      setMatchedJobs(Array.isArray(results) && results.length > 0 ? results : [])
    } catch {
      setMatchedJobs([])
    } finally {
      setLoadingMatches(false)
    }
  }

  const handleManualSearch = async () => {
    if (!manualSearch.trim()) return
    setLoadingManual(true)
    try {
      const results = await searchJobs(manualSearch, manualLocation)
      setManualJobs(results)
    } catch (err) {
      console.error('Failed to search jobs:', err)
    } finally {
      setLoadingManual(false)
    }
  }

  const addJobToTracker = async (job, idx, source) => {
    if (isAlreadySaved(job)) {
      showToast(`"${job.title}" is already in your tracker`, 'warn')
      return
    }
    setSavingJob(`${source}-${idx}`)
    try {
      await createJob({
        title: job.title,
        company: job.company || 'Unknown',
        url: job.url || '',
        location: job.location || '',
        salary: job.salary || '',
        status: 'saved',
        notes: ''
      })
      await load()
      showToast(`"${job.title}" saved to your tracker!`, 'success')
    } catch {
      showToast('Failed to save job. Try again.', 'error')
    } finally {
      setSavingJob(null)
    }
  }
  
  useEffect(() => { 
    load()
    loadMatchedJobs()
  }, [])

  const handleSave = async (form) => {
    if (modal === 'add') await createJob(form)
    else await updateJob(modal.id, form)
    await load()
  }
  const handleDeleteClick = (id) => setConfirmDialog({ id })

  const handleDeleteConfirm = async () => {
    const { id } = confirmDialog
    setConfirmDialog(null)
    try {
      await deleteJob(id)
      setJobs(j => j.filter(x => x.id !== id))
    } catch {
      // silently fail
    }
  }
  const handleStatus = async (id, status) => {
    await updateJob(id, { status })
    setJobs(j => j.map(x => x.id === id ? { ...x, status } : x))
  }

  const counts = Object.keys(STATUS).reduce((a, k) => ({ ...a, [k]: jobs.filter(j => j.status === k).length }), {})
  const filtered = jobs
    .filter(j => filter === 'all' || j.status === filter)
    .filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-fade-up">
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-600 dark:text-[#8892a4] hover:text-primary transition-colors group">
        <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
        <span className="text-sm font-bold">Back</span>
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-[#dae2fd] font-headline tracking-tight">Job Tracker</h1>
          <p className="text-sm text-gray-700 dark:text-[#8892a4] mt-0.5 font-medium">Track your applications and manage your pipeline</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] text-sm font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto">
          <span className="material-symbols-outlined text-base">add</span>Add Job
        </button>
      </div>

      {/* Job Discovery Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-primary/5 dark:to-purple-500/5 border border-blue-200 dark:border-primary/20 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-primary">work</span>
            <h2 className="text-base font-bold text-gray-900 dark:text-[#dae2fd]">Discover Jobs</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {viewMode === 'ai' && (
              <button onClick={loadMatchedJobs} disabled={loadingMatches} className="px-3 py-1.5 text-xs font-bold rounded-xl transition-all bg-white/50 dark:bg-white/5 text-gray-700 dark:text-[#8892a4] hover:bg-white/80 dark:hover:bg-white/10 disabled:opacity-50">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">refresh</span>Refresh</span>
              </button>
            )}
            <button onClick={() => setViewMode('ai')} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'ai' ? 'bg-blue-600 dark:bg-primary text-white dark:text-[#0b1120] shadow-md' : 'bg-white/50 dark:bg-white/5 text-gray-700 dark:text-[#8892a4] hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm'
            }`}>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">auto_awesome</span>AI Suggested</span>
            </button>
            <button onClick={() => setViewMode('manual')} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'manual' ? 'bg-blue-600 dark:bg-primary text-white dark:text-[#0b1120] shadow-md' : 'bg-white/50 dark:bg-white/5 text-gray-700 dark:text-[#8892a4] hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm'
            }`}>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">search</span>Manual Search</span>
            </button>
          </div>
        </div>

        {viewMode === 'ai' ? (
          <>
            {loadingMatches ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <span className="material-symbols-outlined text-blue-600 dark:text-primary animate-spin">progress_activity</span>
                <p className="text-sm text-gray-700 dark:text-[#8892a4] font-medium">Finding jobs that match your resume...</p>
              </div>
            ) : matchedJobs.length > 0 ? (
              <>
                <p className="text-xs text-gray-700 dark:text-[#8892a4] mb-4 font-medium">Based on your latest resume, here are {matchedJobs.length} jobs that match your skills</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {matchedJobs.map((job, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/8 rounded-xl p-4 hover:border-blue-600/30 dark:hover:border-primary/30 transition-all group hover:shadow-lg">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] truncate group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">{job.title}</p>
                          <p className="text-xs text-gray-600 dark:text-[#8892a4] flex items-center gap-1 mt-0.5 font-medium">
                            <span className="material-symbols-outlined text-xs">business</span>{job.company || 'Unknown'}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg border text-xs font-bold flex-shrink-0 ${
                          job.matchScore >= 70 ? 'bg-green-400/10 border-green-400/20 text-green-400' :
                          job.matchScore >= 50 ? 'bg-blue-600/10 dark:bg-primary/10 border-blue-600/20 dark:border-primary/20 text-blue-600 dark:text-primary' :
                          'bg-yellow-400/10 border-yellow-400/20 text-yellow-400'
                        }`}>{job.matchScore}% Match</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.location && <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#3d4a5c] font-medium"><span className="material-symbols-outlined text-xs">location_on</span>{job.location}</span>}
                        {job.salary && <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#3d4a5c] font-medium"><span className="material-symbols-outlined text-xs">payments</span>{job.salary}</span>}
                      </div>
                      {job.missingSkills && job.missingSkills.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] text-gray-600 dark:text-[#8892a4] mb-1 font-medium">Skills to improve:</p>
                          <div className="flex flex-wrap gap-1">
                            {job.missingSkills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-red-400/10 border border-red-400/20 text-red-400 text-[9px] rounded">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-blue-600/10 dark:bg-primary/10 border border-blue-600/20 dark:border-primary/20 text-blue-600 dark:text-primary text-xs font-bold rounded-xl hover:bg-blue-600/20 dark:hover:bg-primary/20 transition-all text-center">
                          View Job
                        </a>}
                        <button
                          onClick={() => addJobToTracker(job, idx, 'ai')}
                          disabled={savingJob === `ai-${idx}` || isAlreadySaved(job)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-bold transition-all border ${
                            isAlreadySaved(job)
                              ? 'bg-green-400/10 border-green-400/20 text-green-400 cursor-default'
                              : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/8 text-gray-700 dark:text-[#8892a4] hover:bg-primary/10 hover:border-primary/20 hover:text-primary dark:hover:text-primary'
                          }`}
                        >
                          {savingJob === `ai-${idx}` ? (
                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isAlreadySaved(job) ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                          )}
                          {isAlreadySaved(job) ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-[#3d4a5c] mb-3">upload_file</span>
                <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-1">No resume uploaded yet</p>
                <p className="text-xs text-gray-600 dark:text-[#8892a4] mb-4 font-medium">Upload a resume to get AI-powered job suggestions matched to your skills</p>
                <button onClick={() => window.location.href = '/upload'} className="px-4 py-2 bg-blue-600/10 dark:bg-primary/10 border border-blue-600/20 dark:border-primary/20 text-blue-600 dark:text-primary text-xs font-bold rounded-xl hover:bg-blue-600/20 dark:hover:bg-primary/20 transition-all shadow-sm hover:shadow-md">
                  Upload Resume
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input value={manualSearch} onChange={e => setManualSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleManualSearch()}
                placeholder="Job title, keywords, or company..."
                className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-[#dae2fd] placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-primary/30 transition-all font-medium" />
              <input value={manualLocation} onChange={e => setManualLocation(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleManualSearch()}
                placeholder="Location"
                className="sm:w-40 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-[#dae2fd] placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-primary/30 transition-all font-medium" />
              <button onClick={handleManualSearch} disabled={loadingManual || !manualSearch.trim()}
                className="py-2.5 px-5 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] font-bold rounded-xl text-sm disabled:opacity-50 transition-all">
                {loadingManual ? 'Searching...' : 'Search'}
              </button>
            </div>
            {loadingManual ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <span className="material-symbols-outlined text-blue-600 dark:text-primary animate-spin">progress_activity</span>
                <p className="text-sm text-gray-700 dark:text-[#8892a4] font-medium">Searching jobs...</p>
              </div>
            ) : manualJobs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {manualJobs.map((job, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/8 rounded-xl p-4 hover:border-blue-600/30 dark:hover:border-primary/30 transition-all group hover:shadow-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] truncate group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">{job.title}</p>
                        <p className="text-xs text-gray-600 dark:text-[#8892a4] flex items-center gap-1 mt-0.5 font-medium">
                          <span className="material-symbols-outlined text-xs">business</span>{job.company || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.location && <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#3d4a5c] font-medium"><span className="material-symbols-outlined text-xs">location_on</span>{job.location}</span>}
                      {job.salary && <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#3d4a5c] font-medium"><span className="material-symbols-outlined text-xs">payments</span>{job.salary}</span>}
                    </div>
                    <div className="flex gap-2">
                      {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-blue-600/10 dark:bg-primary/10 border border-blue-600/20 dark:border-primary/20 text-blue-600 dark:text-primary text-xs font-bold rounded-xl hover:bg-blue-600/20 dark:hover:bg-primary/20 transition-all text-center">
                        View Job
                      </a>}
                      <button
                        onClick={() => addJobToTracker(job, idx, 'manual')}
                        disabled={savingJob === `manual-${idx}` || isAlreadySaved(job)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-bold transition-all border ${
                          isAlreadySaved(job)
                            ? 'bg-green-400/10 border-green-400/20 text-green-400 cursor-default'
                            : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/8 text-gray-700 dark:text-[#8892a4] hover:bg-primary/10 hover:border-primary/20 hover:text-primary dark:hover:text-primary'
                        }`}
                      >
                        {savingJob === `manual-${idx}` ? (
                          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isAlreadySaved(job) ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                        )}
                        {isAlreadySaved(job) ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-[#3d4a5c] mb-3">search</span>
                <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-1">Search for jobs</p>
                <p className="text-xs text-gray-600 dark:text-[#8892a4] font-medium">Enter keywords and location to find jobs</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {Object.entries(STATUS).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(filter === k ? 'all' : k)}
            className={`p-3 rounded-2xl border text-center transition-all hover:shadow-md ${filter === k ? `${v.bg} ${v.border} shadow-sm` : 'bg-white dark:bg-[#0f1829] border-gray-200 dark:border-white/6 hover:border-gray-300 dark:hover:border-white/10'}`}>
            <p className={`text-lg sm:text-xl font-extrabold font-headline ${filter === k ? v.color : 'text-gray-900 dark:text-[#dae2fd]'}`}>{counts[k] || 0}</p>
            <p className={`text-[9px] sm:text-[10px] font-bold mt-0.5 ${filter === k ? v.color : 'text-gray-500 dark:text-[#3d4a5c]'}`}>{v.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8892a4] text-[18px]">search</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..."
          className="w-full bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/6 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-[#dae2fd] placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-primary/30 transition-all font-medium" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton rounded-2xl h-44" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#0f1829] border border-dashed border-gray-300 dark:border-white/8 rounded-2xl">
          <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-[#3d4a5c] mb-3">work_off</span>
          <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-1">{search ? 'No jobs match your search' : 'No jobs tracked yet'}</p>
          <p className="text-xs text-gray-600 dark:text-[#8892a4] mb-4 font-medium">Click "Add Job" to start tracking your applications</p>
          <button onClick={() => setModal('add')} className="px-4 py-2 bg-blue-600/10 dark:bg-primary/10 border border-blue-600/20 dark:border-primary/20 text-blue-600 dark:text-primary text-xs font-bold rounded-xl hover:bg-blue-600/20 dark:hover:bg-primary/20 transition-all shadow-sm hover:shadow-md">
            Add First Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(job => (
            <JobCard key={job.id} job={job} onEdit={setModal} onDelete={handleDeleteClick} onStatus={handleStatus} />
          ))}
        </div>
      )}

      {modal && <Modal job={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}

      <ConfirmDialog
        open={!!confirmDialog}
        title="Delete Job"
        message="Are you sure you want to delete this job? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog(null)}
      />

      <Toast toasts={toasts} />
    </div>
  )
}
