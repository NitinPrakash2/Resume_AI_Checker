import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory, deleteResume, getLatestResumeId, setLatestResumeId } from '../services/resumeService'
import ConfirmDialog from '../components/ConfirmDialog'

function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-2xl ${className}`} />
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? 'text-green-400 bg-green-400/10 border-green-400/20'
    : score >= 60 ? 'text-primary bg-primary/10 border-primary/20'
    : 'text-error bg-error/10 border-error/20'
  return <span className={`px-2 py-0.5 rounded-lg border text-xs font-bold ${color}`}>{score}%</span>
}

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [activeResumeId, setActiveResumeId] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null) // { id, fileName }

  const loadHistory = () => {
    getHistory().then(setHistory).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadHistory()
    getLatestResumeId().then(setActiveResumeId).catch(console.error)
  }, [])

  const handleDeleteClick = (e, id, fileName) => {
    e.stopPropagation()
    setConfirmDialog({ id, fileName })
  }

  const handleDeleteConfirm = async () => {
    const { id } = confirmDialog
    setConfirmDialog(null)
    setDeleting(id)
    try {
      await deleteResume(id)
      setHistory(h => h.filter(r => r.id !== id))
      if (activeResumeId === id) setActiveResumeId(null)
    } catch {
      // silently fail — no alert popup
    } finally {
      setDeleting(null)
    }
  }

  const handleSetActive = async (e, id) => {
    e.stopPropagation()
    try {
      await setLatestResumeId(id)
      setActiveResumeId(id)
    } catch {
      // silently fail
    }
  }

  const filtered = history.filter(r => r.fileName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-fade-up">
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-600 dark:text-[#8892a4] hover:text-primary transition-colors group">
        <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
        <span className="text-sm font-bold">Back</span>
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-[#dae2fd] font-headline tracking-tight">History</h1>
          <p className="text-sm text-gray-700 dark:text-[#8892a4] mt-0.5 font-medium">All your past resume analyses</p>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8892a4] text-[18px]">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/8 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-[#dae2fd] placeholder:text-gray-400 dark:placeholder:text-[#8892a4] outline-none focus:border-primary/30 transition-all w-56 font-medium"
            placeholder="Search by filename..."
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0d1526] border-2 border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
        <div className="grid grid-cols-5 px-5 py-3 border-b border-gray-200 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#3d4a5c]">
          <span className="col-span-2">File</span>
          <span className="text-center">Match</span>
          <span className="text-center">ATS</span>
          <span className="text-center">Actions</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-[#3d4a5c] mb-3">history</span>
            <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-1">{search ? 'No results found' : 'No history yet'}</p>
            <p className="text-xs text-gray-600 dark:text-[#8892a4] font-medium">{search ? 'Try a different search' : 'Upload a resume to get started'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-white/5">
            {filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/result/${r.id}`)}
                className="grid grid-cols-5 items-center px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-all group hover:shadow-md"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-sm">description</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] truncate">{r.fileName}</p>
                      {activeResumeId === r.id && (
                        <span className="px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-bold rounded">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-[#8892a4] font-medium">{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex justify-center"><ScoreBadge score={r.score || 0} /></div>
                <div className="flex justify-center"><ScoreBadge score={r.atsScore || 0} /></div>
                <div className="flex justify-center gap-2">
                  {activeResumeId !== r.id && (
                    <button
                      onClick={(e) => handleSetActive(e, r.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-green-500/15 text-gray-600 dark:text-[#8892a4] hover:text-green-400 transition-all"
                      title="Set as active resume"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteClick(e, r.id, r.fileName)}
                    disabled={deleting === r.id}
                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-400/15 text-gray-600 dark:text-[#8892a4] hover:text-red-400 transition-all disabled:opacity-50"
                    title="Delete resume"
                  >
                    {deleting === r.id ? (
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">delete</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDialog}
        title="Delete Resume"
        message={`Are you sure you want to delete "${confirmDialog?.fileName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  )
}
