import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadResume } from '../services/resumeService'

const STEPS = ['Upload', 'Add Context', 'Analyze']

export default function Upload() {
  const [file, setFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [loadingStep, setLoadingStep] = useState(0)
  const inputRef = useRef()
  const navigate = useNavigate()
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!loading) return
    const steps = [
      { label: 'Extracting text from resume...', delay: 0 },
      { label: 'Running ATS analysis...', delay: 3000 },
      { label: 'Matching against job description...', delay: 7000 },
      { label: 'Generating interview questions...', delay: 12000 },
    ]
    steps.forEach(({ delay }, i) => {
      setTimeout(() => { if (mountedRef.current) setLoadingStep(i) }, delay)
    })
  }, [loading])

  const handleFile = (f) => {
    if (!f) return
    const allowed = ['.pdf', '.doc', '.docx']
    const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase()
    if (!allowed.includes(ext)) { setError('Only PDF, DOC, DOCX files are supported.'); return }
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10MB.'); return }
    setError('')
    setFile(f)
    setStep(1)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setStep(2)
    setError('')
    try {
      const data = await uploadResume(file, jobDesc)
      // Show success and redirect to result with option to view jobs
      navigate(`/result/${data.id}`, { state: { showJobsPrompt: true } })
    } catch (err) {
      if (mountedRef.current) {
        setError(err.response?.data?.error || 'Analysis failed. Please try again.')
        setLoading(false)
        setStep(file ? 1 : 0)
      }
    }
  }

  const loadingMessages = [
    'Extracting text from resume...',
    'Running ATS analysis...',
    'Matching against job description...',
    'Generating interview questions...',
  ]

  return (
    <>
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-[#070d1a]/90 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/10 rounded-3xl p-10 flex flex-col items-center gap-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-[#dae2fd] font-headline mb-1">Analyzing Resume</p>
              <p className="text-sm text-gray-500 dark:text-[#8892a4]">{loadingMessages[loadingStep]}</p>
            </div>
            <div className="w-full space-y-3">
              {loadingMessages.map((msg, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm transition-all ${
                  i <= loadingStep ? 'text-gray-900 dark:text-[#dae2fd]' : 'text-gray-400 dark:text-[#3d4a5c]'
                }`}>
                  <span className={`material-symbols-outlined text-base flex-shrink-0 ${
                    i < loadingStep ? 'text-green-500 dark:text-green-400'
                    : i === loadingStep ? 'text-primary animate-spin'
                    : 'text-gray-300 dark:text-[#3d4a5c]'
                  }`}>
                    {i < loadingStep ? 'check_circle' : i === loadingStep ? 'progress_activity' : 'radio_button_unchecked'}
                  </span>
                  {msg}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-[#3d4a5c]">This may take 15–30 seconds</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <h2 className="text-4xl font-headline font-extrabold tracking-tight text-gray-900 dark:text-[#dae2fd] mb-2">Upload Your Resume</h2>
        <p className="text-gray-700 dark:text-[#8892a4] text-lg max-w-3xl leading-relaxed font-medium">
          Harness the power of AI to audit your career history. Get instant ATS scores, targeted job matches, and professional skill gap analysis in seconds.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="mb-12 flex items-center justify-between max-w-2xl">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-3 relative flex-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg z-10 transition-all ${
              i < step ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
              : i === step ? 'bg-primary text-[#0b1120] shadow-[0_0_20px_rgba(163,166,255,0.4)]'
              : 'bg-gray-100 dark:bg-[#0f1829] text-gray-500 dark:text-[#8892a4] border-2 border-gray-300 dark:border-[#3d4a5c]'
            }`}>
              {i < step ? <span className="material-symbols-outlined">check</span> : i + 1}
            </div>
            <span className={`text-sm font-semibold ${
              i <= step ? 'text-gray-900 dark:text-[#dae2fd]' : 'text-gray-500 dark:text-[#8892a4]'
            }`}>{s}</span>
            {i < STEPS.length - 1 && (
              <div className={`absolute top-6 left-[60%] w-full h-0.5 transition-all ${
                i < step ? 'bg-green-500' : 'bg-gray-300 dark:bg-[#3d4a5c]'
              }`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
          <span className="material-symbols-outlined flex-shrink-0">error</span>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-400/60 hover:text-red-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Content Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upload Zone */}
        <div className="lg:col-span-8 space-y-8">
          <div
            onClick={() => !loading && inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            className={`relative rounded-3xl border-2 border-dashed p-12 flex flex-col items-center justify-center text-center transition-all min-h-[400px] group ${
              loading ? 'cursor-not-allowed opacity-50'
              : drag ? 'border-primary bg-primary/10 scale-[1.01]'
              : file ? 'border-green-500/40 bg-green-500/5'
              : 'border-gray-300 dark:border-[#3d4a5c] bg-white dark:bg-[#0b1120] hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-[#0f1829] cursor-pointer'
            }`}
          >
            <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />

            {drag && (
              <div className="absolute inset-0 rounded-3xl bg-primary/10 flex items-center justify-center">
                <p className="text-primary font-bold text-2xl">Drop it here!</p>
              </div>
            )}

            {file ? (
              <>
                <div className="w-20 h-20 rounded-2xl bg-green-500/15 flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-5xl" style={{fontVariationSettings: "'FILL' 1"}}>task_alt</span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-gray-900 dark:text-[#dae2fd] mb-2">{file.name}</h3>
                <p className="text-gray-600 dark:text-[#8892a4] mb-2 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <span className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl font-bold mb-6">Ready to analyze</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setStep(0) }}
                  className="text-sm text-gray-600 dark:text-[#8892a4] hover:text-red-400 transition-colors flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined">delete</span> Remove file
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-5xl" style={{fontVariationSettings: "'FILL' 1"}}>cloud_upload</span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-gray-900 dark:text-[#dae2fd] mb-2">Drop your resume here</h3>
                <p className="text-gray-600 dark:text-[#8892a4] mb-8 font-medium">Support for PDF, DOCX, and DOC (Max 10MB)</p>
                <label className="px-8 py-4 btn-primary rounded-xl cursor-pointer">
                  Select File from Device
                </label>
                <div className="mt-10 flex items-center gap-8 text-gray-400 dark:text-[#8892a4]/60">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">description</span>
                    <span className="text-xs font-semibold">PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">article</span>
                    <span className="text-xs font-semibold">DOCX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">shield</span>
                    <span className="text-xs font-semibold">SECURE</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-white/60 dark:bg-[#0b1120]/60 backdrop-blur-xl border border-gray-200 dark:border-[#3d4a5c]/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <h4 className="text-lg font-headline font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-[#dae2fd]">
              <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
              What you'll receive
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="font-bold text-gray-900 dark:text-[#dae2fd]">Est. ATS Score</p>
                <p className="text-sm text-gray-700 dark:text-[#8892a4] leading-relaxed font-medium">Real-time compatibility check against modern applicant tracking systems.</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-900 dark:text-[#dae2fd]">Job Match %</p>
                <p className="text-sm text-gray-700 dark:text-[#8892a4] leading-relaxed font-medium">A detailed percentage match based on industry-specific semantic analysis.</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-900 dark:text-[#dae2fd]">Skill Gap Analysis</p>
                <p className="text-sm text-gray-700 dark:text-[#8892a4] leading-relaxed font-medium">Personalized roadmap highlighting missing technical and soft skills.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Job Description */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#0f1829] rounded-3xl p-6 border border-gray-200 dark:border-[#3d4a5c]/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-headline font-bold text-gray-900 dark:text-[#dae2fd]">Job Description</h4>
              <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded font-bold uppercase tracking-wider">Optional</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-[#8892a4] mb-4 font-medium">Paste the job description for a targeted match score and missing skills analysis...</p>
            <textarea
              className="w-full h-64 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-none rounded-2xl p-4 text-sm text-gray-900 dark:text-[#dae2fd] placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] focus:ring-2 focus:ring-primary/30 transition-all resize-none font-medium"
              placeholder="Enter job title, requirements, and responsibilities here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              disabled={loading}
            />
            <div className="mt-6 p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-tertiary">tips_and_updates</span>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-tertiary">Pro Tip</p>
                  <p className="text-xs text-gray-600 dark:text-[#8892a4] leading-relaxed font-medium">Including a job description increases AI accuracy by up to 45% for tailored recommendations.</p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-4 btn-primary rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
          >
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </div>
      </form>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-tertiary/5 rounded-full blur-[120px]" />
      </div>
    </>
  )
}
