import { createContext, useContext, useRef, useState, useCallback } from 'react'
import { analyzeBenchmark } from '../services/resumeService'

const BenchmarkContext = createContext()

export function BenchmarkProvider({ children }) {
  const [loading, setLoading]       = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState('')
  const [resumeId, setResumeId]     = useState(null)

  // Keep interval ref so we can clear it even if component unmounts
  const ivRef = useRef(null)

  const run = useCallback(async (resume) => {
    if (loading) return
    setLoading(true)
    setError('')
    setResult(null)
    setLoadingStep(0)
    setResumeId(resume.id)

    ivRef.current = setInterval(
      () => setLoadingStep(s => Math.min(s + 1, 3)),
      4000
    )

    try {
      const data = await analyzeBenchmark(resume.id)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed')
    } finally {
      clearInterval(ivRef.current)
      setLoading(false)
    }
  }, [loading])

  const reset = useCallback(() => {
    clearInterval(ivRef.current)
    setLoading(false)
    setLoadingStep(0)
    setResult(null)
    setError('')
    setResumeId(null)
  }, [])

  return (
    <BenchmarkContext.Provider value={{ loading, loadingStep, result, error, resumeId, run, reset }}>
      {children}
    </BenchmarkContext.Provider>
  )
}

export function useBenchmark() {
  const ctx = useContext(BenchmarkContext)
  if (!ctx) throw new Error('useBenchmark must be used within BenchmarkProvider')
  return ctx
}
