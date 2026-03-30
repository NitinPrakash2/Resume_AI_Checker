import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }) {
  const location = useLocation()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [phase, setPhase] = useState('enter') // 'enter' | 'exit'
  const prevKey = useRef(location.key)

  useEffect(() => {
    if (location.key === prevKey.current) return

    // Start exit on old content
    setPhase('exit')

    const t = setTimeout(() => {
      // Swap content and enter
      setDisplayChildren(children)
      setPhase('enter')
      prevKey.current = location.key
    }, 220) // matches pageOut duration

    return () => clearTimeout(t)
  }, [location.key, children])

  return (
    <div
      key={phase === 'exit' ? 'exit' : location.key}
      className={phase === 'enter' ? 'page-enter' : 'page-exit'}
      style={{ position: 'relative', width: '100%', minHeight: '100vh' }}
    >
      {displayChildren}
    </div>
  )
}
