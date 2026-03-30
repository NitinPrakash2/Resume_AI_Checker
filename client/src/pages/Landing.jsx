import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import logoImg from '../../public/Fevicon.png'

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open')
      document.documentElement.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
      document.documentElement.classList.remove('menu-open')
    }
    return () => {
      document.body.classList.remove('menu-open')
      document.documentElement.classList.remove('menu-open')
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-white dark:bg-[#070d1a] text-gray-900 dark:text-white transition-colors duration-300" style={{ isolation: 'isolate' }}>

      {/* Mobile drawer backdrop */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          menuOpen ? 'bg-black/40 backdrop-blur-sm pointer-events-auto' : 'bg-transparent backdrop-blur-none pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile right-side drawer */}
      <div className={`fixed top-0 right-0 h-full w-72 z-50 md:hidden flex flex-col
        bg-white dark:bg-[#0b1120] border-l border-gray-200 dark:border-white/10 shadow-2xl
        transition-transform duration-300 ease-in-out
        ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="logo" className="w-8 h-8 rounded-xl object-contain" />
            <span className="text-base font-extrabold font-headline text-gray-900 dark:text-white">Resumate</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-[#A6ADFF] hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-4 py-4">
          <a href="#features" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all flex items-center gap-3">
            <span className="material-symbols-outlined text-base">auto_awesome</span>Features
          </a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all flex items-center gap-3">
            <span className="material-symbols-outlined text-base">route</span>How it Works
          </a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all flex items-center gap-3">
            <span className="material-symbols-outlined text-base">payments</span>Pricing
          </a>
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-gray-100 dark:bg-white/5" />

        {/* Auth buttons */}
        <div className="px-4 py-4 flex flex-col gap-2">
          <button
            onClick={() => { navigate('/login'); setMenuOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-[#dae2fd] hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-base text-gray-500 dark:text-[#8892a4]">login</span>
            Sign In
          </button>
          <button
            onClick={() => { navigate('/register'); setMenuOpen(false) }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 btn-primary text-sm rounded-xl"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            Create Account
          </button>
        </div>

        {/* Theme toggle at bottom */}
        <div className="mt-auto px-4 pb-6 pt-2 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-[#8892a4] hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-base">{dark ? 'light_mode' : 'dark_mode'}</span>
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b-2" style={{
        background: scrolled
          ? dark ? 'rgba(7,13,26,0.95)' : 'rgba(255,255,255,0.98)'
          : dark ? 'rgba(7,13,26,1)' : 'rgba(255,255,255,1)',
        backdropFilter: scrolled ? 'blur(4px)' : 'none',
        borderBottomColor: scrolled
          ? dark ? 'rgba(255,255,255,0.06)' : 'rgba(156,163,175,0.5)'
          : dark ? 'rgba(255,255,255,0.06)' : 'rgba(209,213,219,0.8)',
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="logo" className="w-9 h-9 rounded-xl object-contain" />
              <div>
                <span className="text-xl font-extrabold font-headline tracking-tight text-gray-900 dark:text-white">Resumate</span>
                <span className="ml-2 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">Pro</span>
              </div>
            </div>

            {/* Navigation Links — desktop */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Features</a>
              <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">How it Works</a>
              <a href="#pricing" className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Pricing</a>
            </div>

            {/* CTA Buttons + Theme Toggle */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#A6ADFF] hover:bg-gray-200 dark:hover:bg-white/[0.10] shadow-sm hover:shadow-md transition-all"
                title="Toggle theme"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {dark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="hidden md:block px-4 py-2 text-sm font-semibold text-gray-700 dark:text-[#dae2fd] hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="hidden md:flex px-5 py-2.5 btn-primary text-sm rounded-xl items-center gap-2"
              >
                Get Started
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#A6ADFF] hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-all"
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {menuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>

      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">

        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid pointer-events-none" />

        {/* Floating orbs */}
        <div className="orb absolute top-10 left-1/4 w-[480px] h-[480px] bg-primary/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="orb2 absolute top-48 right-1/4 w-[380px] h-[380px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="orb absolute bottom-0 left-1/2 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-6xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-primary tracking-wide">AI-Powered Resume Analysis</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold font-headline mb-6 animate-fade-up" style={{ animationDelay: '0.08s' }}>
            <span className="grad-text">Resumate AI</span>
            <span className="block text-gray-900 dark:text-white mt-2">Your AI Career Copilot</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-gray-500 dark:text-[#8892a4] max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.16s' }}>
            Get ATS score, job match insights, and interview prep instantly.
            Land your dream job with AI-powered resume optimization.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.24s' }}>
            <button
              onClick={() => navigate('/register')}
              className="glow-btn group px-8 py-4 btn-primary rounded-2xl flex items-center gap-2 text-base"
            >
              Get Started Free
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-200">arrow_forward</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20 rounded-2xl font-semibold text-base transition-all duration-200"
            >
              Sign In
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mt-20 animate-fade-up" style={{ animationDelay: '0.32s' }}>
            {[
              { value: '50K+', label: 'Resumes Analyzed' },
              { value: '95%',  label: 'Success Rate' },
              { value: '4.9★', label: 'User Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <p className="text-2xl sm:text-3xl font-extrabold font-headline text-primary mb-1 ticker group-hover:scale-110 transition-transform duration-200 inline-block">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-[#8892a4] font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-50" />
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16" ref={useReveal()}>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline mt-3 mb-4 text-gray-900 dark:text-white">
              Everything You Need to
              <br />
              <span className="grad-text">Land Your Dream Job</span>
            </h2>
            <p className="text-gray-500 dark:text-[#8892a4] max-w-2xl mx-auto">
              Powerful AI tools to optimize your resume, match with jobs, and ace interviews
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: 'speed', title: 'Est. ATS Score Analysis', description: 'Get instant estimated ATS compatibility score and optimization tips to pass automated filters.', color: 'from-green-500 to-emerald-400', glow: 'group-hover:shadow-green-500/20', delay: 0 },
              { icon: 'work',      title: 'Job Match %',        description: 'See exactly how well your resume matches any job description in seconds.',           color: 'from-primary to-blue-500',       glow: 'group-hover:shadow-primary/20',   delay: 80 },
              { icon: 'forum',     title: 'AI Interview Prep',  description: 'Practice with AI-generated questions tailored to your resume and target role.',     color: 'from-purple-500 to-pink-500',    glow: 'group-hover:shadow-purple-500/20',delay: 160 },
              { icon: 'edit_note', title: 'Resume Rewriter',    description: 'AI-powered resume enhancement that rewrites weak sections for maximum impact.',    color: 'from-orange-500 to-red-400',     glow: 'group-hover:shadow-orange-500/20',delay: 240 },
            ].map((f, i) => {
              const ref = useReveal()
              return (
                <div
                  key={i}
                  ref={ref}
                  className="reveal group land-card bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/[0.12] hover:shadow-xl dark:hover:shadow-2xl shadow-sm"
                  style={{ transitionDelay: `${f.delay}ms` }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl ${f.glow} transition-all duration-300`}>
                    <span className="material-symbols-outlined text-white text-[22px]">{f.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-[#dae2fd] mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-[#8892a4] leading-relaxed">{f.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Learn more
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform duration-200">arrow_forward</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
        {/* subtle bg */}
        <div className="absolute inset-0 bg-gray-50/80 dark:bg-[#070d1a]" />
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-40" />

        <div className="relative max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16" ref={useReveal()}>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline mt-3 text-gray-900 dark:text-white">
              Three Simple Steps to
              <span className="grad-text"> Success</span>
            </h2>
            <p className="text-gray-500 dark:text-[#8892a4] mt-4 max-w-xl mx-auto">
              Get from resume upload to job-ready in minutes
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* connector line — desktop only */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {[
              { icon: 'cloud_upload', title: 'Upload Resume',  description: 'Drop your PDF or DOCX and let our system parse it instantly.',                  color: 'from-blue-500 to-primary',       num: '01', delay: 0 },
              { icon: 'auto_awesome', title: 'AI Analysis',    description: 'Our AI scans for ATS compatibility, keywords, and job match in seconds.',      color: 'from-purple-500 to-pink-500',    num: '02', delay: 120 },
              { icon: 'insights',     title: 'Get Insights',   description: 'Receive a detailed score, improvement tips, and tailored job matches.',        color: 'from-green-500 to-emerald-400',  num: '03', delay: 240 },
            ].map((step, i) => {
              const ref = useReveal()
              return (
                <div
                  key={i}
                  ref={ref}
                  className="reveal group land-card relative flex flex-col items-center text-center bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-8 hover:border-gray-300 dark:hover:border-white/[0.14] hover:shadow-xl dark:hover:shadow-2xl shadow-sm"
                  style={{ transitionDelay: `${step.delay}ms` }}
                >
                  {/* step number */}
                  <span className="absolute top-4 right-5 text-[11px] font-black text-gray-200 dark:text-white/10 font-headline tracking-widest">{step.num}</span>

                  {/* icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                    <span className="material-symbols-outlined text-3xl text-white">{step.icon}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors duration-200">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-[#8892a4] leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-30" />
        <div className="orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" ref={useReveal()}>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Product Preview
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline mt-3 text-gray-900 dark:text-white">
              Powerful <span className="grad-text">Dashboard Analytics</span>
            </h2>
          </div>

          {/* Dashboard mock */}
          {(() => {
            const ref = useReveal()
            return (
              <div ref={ref} className="reveal">
                <div className="relative">
                  {/* glow behind card */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/10 to-blue-500/20 rounded-3xl blur-2xl" />
                  <div className="relative bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl dark:shadow-none overflow-hidden">

                    {/* top bar dots */}
                    <div className="flex items-center gap-1.5 mb-6">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="ml-3 text-xs text-gray-400 dark:text-white/20 font-mono">resumate.ai/dashboard</span>
                    </div>

                    {/* stat cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                      {[
                        { label: 'Est. ATS Score', value: '87%', lightColor: '#16a34a', darkColor: '#4ade80', icon: 'speed', bar: 87 },
                        { label: 'Job Match',  value: '92%', lightColor: '#2563eb', darkColor: '#c0c1ff',  icon: 'work',   bar: 92 },
                        { label: 'Keywords',   value: '24',  lightColor: '#7c3aed', darkColor: '#c084fc',  icon: 'label',  bar: 72 },
                      ].map((stat, i) => (
                        <div key={i} className="land-card group bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-white/15 hover:shadow-lg transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-gray-500 dark:text-[#8892a4]">{stat.label}</span>
                            <span className="material-symbols-outlined text-sm" style={{ color: dark ? stat.darkColor : stat.lightColor }}>{stat.icon}</span>
                          </div>
                          <p className="text-3xl font-extrabold font-headline mb-3" style={{ color: dark ? stat.darkColor : stat.lightColor }}>{stat.value}</p>
                          <div className="h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${stat.bar}%`, background: dark ? stat.darkColor : stat.lightColor }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* score breakdown */}
                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-4">Score Breakdown</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Keyword Match', value: 85 },
                          { label: 'Formatting',    value: 92 },
                          { label: 'Experience',    value: 88 },
                          { label: 'Skills',        value: 90 },
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-[#8892a4] mb-1.5">
                              <span>{item.label}</span>
                              <span className="font-bold text-gray-900 dark:text-[#dae2fd]">{item.value}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full fill-bar"
                                style={{ width: `${item.value}%`, animationDelay: `${i * 0.15}s` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* Job Match Preview */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50/80 dark:bg-[#070d1a]" />
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-40" />
        <div className="orb2 absolute -right-32 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" ref={useReveal()}>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Job Matching
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline mt-3 text-gray-900 dark:text-white">
              Find Your <span className="grad-text">Perfect Match</span>
            </h2>
            <p className="text-gray-500 dark:text-[#8892a4] mt-4 max-w-xl mx-auto">
              AI scans thousands of jobs and ranks them by how well they fit your resume
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: 'Senior React Developer', company: 'TechCorp Inc',  location: 'Remote',     salary: '₹18L – ₹25L', match: 85, missing: ['Kubernetes', 'AWS'],      delay: 0 },
              { title: 'Full Stack Engineer',    company: 'StartupXYZ',   location: 'Bangalore',  salary: '₹12L – ₹18L', match: 72, missing: ['Docker', 'GraphQL'],    delay: 120 },
            ].map((job, i) => {
              const ref = useReveal()
              return (
                <div
                  key={i}
                  ref={ref}
                  className="reveal land-card group bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/[0.14] hover:shadow-xl dark:hover:shadow-2xl shadow-sm"
                  style={{ transitionDelay: `${job.delay}ms` }}
                >
                  {/* title row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 dark:text-[#dae2fd] group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200 truncate">{job.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-[#8892a4] flex items-center gap-1 mt-1 font-medium">
                        <span className="material-symbols-outlined text-xs">business</span>{job.company}
                      </p>
                    </div>
                    {/* match badge */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <span className={`px-3 py-1 rounded-xl text-sm font-extrabold border ${
                        job.match >= 80
                          ? 'bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-400/20'
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}>{job.match}%</span>
                      <span className="text-[9px] text-gray-400 dark:text-[#3d4a5c] mt-0.5 font-medium">match</span>
                    </div>
                  </div>

                  {/* match bar */}
                  <div className="mb-4">
                    <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full fill-bar ${
                          job.match >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-primary to-primary-container'
                        }`}
                        style={{ width: `${job.match}%` }}
                      />
                    </div>
                  </div>

                  {/* meta */}
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-[#8892a4] mb-4">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span>{job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">payments</span>{job.salary}
                    </span>
                  </div>

                  {/* missing skills */}
                  <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#3d4a5c] mb-2">Skills to improve</p>
                    <div className="flex flex-wrap gap-2">
                      {job.missing.map((skill, j) => (
                        <span key={j} className="px-2.5 py-1 bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 text-red-500 dark:text-red-400 text-xs font-semibold rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="w-full py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 text-gray-700 dark:text-[#8892a4] text-xs font-bold rounded-xl group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary dark:group-hover:text-primary transition-all duration-200">
                    View Details
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Interview Preview */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-30" />
        <div className="orb absolute -left-32 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12" ref={useReveal()}>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Interview Prep
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline mt-3 text-gray-900 dark:text-white">
              AI-Generated <span className="grad-text">Interview Questions</span>
            </h2>
            <p className="text-gray-500 dark:text-[#8892a4] mt-4 max-w-xl mx-auto">
              Practice with questions tailored to your resume and target role
            </p>
          </div>

          {(() => {
            const ref = useReveal()
            return (
              <div ref={ref} className="reveal">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-primary/10 to-blue-500/10 rounded-3xl blur-2xl" />
                  <div className="relative bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl dark:shadow-none">
                    <div className="flex items-center gap-1.5 mb-6">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="ml-3 text-xs text-gray-400 dark:text-white/20 font-mono">resumate.ai/interviews</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { q: 'Tell me about your experience with React and modern JavaScript frameworks.', delay: 0 },
                        { q: 'How do you handle state management in large-scale applications?',            delay: 80 },
                        { q: 'Describe a challenging project you worked on and how you overcame obstacles.', delay: 160 },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="land-card group flex items-start gap-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-white/15 hover:shadow-lg transition-all"
                          style={{ transitionDelay: `${item.delay}ms` }}
                        >
                          <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-200">
                            <span className="text-[10px] font-extrabold text-primary">Q{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 dark:text-[#dae2fd] font-medium leading-relaxed mb-3">{item.q}</p>
                            <button className="flex items-center gap-1.5 text-xs font-bold text-primary opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                              <span className="material-symbols-outlined text-sm">auto_awesome</span>
                              Get AI Answer
                              <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform duration-200">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50/80 dark:bg-[#070d1a]" />
        <div className="orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="orb2 absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {(() => {
            const ref = useReveal()
            return (
              <div ref={ref} className="reveal">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/10 to-blue-500/20 rounded-3xl blur-2xl" />
                  <div className="relative bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/10 rounded-3xl p-10 sm:p-14 shadow-2xl dark:shadow-none">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary uppercase tracking-wider mb-6">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      Get Started Today
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold font-headline mb-4 text-gray-900 dark:text-white">
                      Start Improving Your
                      <br />
                      <span className="grad-text">Resume Today</span>
                    </h2>
                    <p className="text-lg text-gray-500 dark:text-[#8892a4] mb-8 max-w-xl mx-auto">
                      Join thousands of job seekers who have successfully landed their dream jobs with Resumate
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        onClick={() => navigate('/register')}
                        className="glow-btn group px-10 py-4 btn-primary rounded-2xl inline-flex items-center gap-2 text-base"
                      >
                        Try Now — It&apos;s Free
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-200">arrow_forward</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-[#3d4a5c] mt-5">No credit card required · Free forever</p>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-200 dark:border-white/5 pt-16 pb-10 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gray-50 dark:bg-[#070d1a]" />
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-30" />
        <div className="orb2 absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={logoImg} alt="logo" className="w-9 h-9 rounded-xl object-contain" />
                <span className="text-lg font-extrabold font-headline text-gray-900 dark:text-white">Resumate</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-[#8892a4] mb-5 leading-relaxed">
                AI-powered resume analysis to help you land your dream job faster.
              </p>
              <div className="flex items-center gap-2">
                {[
                  { icon: 'tag',  href: 'https://twitter.com',  label: 'Twitter',  hover: 'hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:border-sky-200 dark:hover:border-sky-500/20' },
                  { icon: 'work', href: 'https://linkedin.com', label: 'LinkedIn', hover: 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/20' },
                  { icon: 'code', href: 'https://github.com',   label: 'GitHub',   hover: 'hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                    className={`w-8 h-8 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-lg flex items-center justify-center text-gray-500 dark:text-[#8892a4] transition-all duration-200 ${s.hover}`}>
                    <span className="material-symbols-outlined text-sm">{s.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 dark:text-[#dae2fd] mb-4">Product</h3>
              <ul className="space-y-2.5">
                {[
                  { label: 'Features',     href: '#features' },
                  { label: 'Pricing',      href: '#pricing' },
                  { label: 'How it Works', href: '#how-it-works' },
                  { label: 'Dashboard',    onClick: () => navigate('/dashboard') },
                ].map((l, i) => (
                  <li key={i}>
                    {l.href
                      ? <a href={l.href} className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-primary dark:hover:text-primary transition-colors duration-150 flex items-center gap-1 group">
                          <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-200 rounded-full" />
                          {l.label}
                        </a>
                      : <button onClick={l.onClick} className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-primary dark:hover:text-primary transition-colors duration-150 flex items-center gap-1 group">
                          <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-200 rounded-full" />
                          {l.label}
                        </button>
                    }
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 dark:text-[#dae2fd] mb-4">Company</h3>
              <ul className="space-y-2.5">
                {[
                  { label: 'Get Started', onClick: () => navigate('/register') },
                  { label: 'Sign In',     onClick: () => navigate('/login') },
                  { label: 'Contact Us',  href: 'mailto:support@resumate.ai' },
                  { label: 'Support',     href: 'mailto:support@resumate.ai' },
                ].map((l, i) => (
                  <li key={i}>
                    {l.href
                      ? <a href={l.href} className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-primary dark:hover:text-primary transition-colors duration-150 flex items-center gap-1 group">
                          <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-200 rounded-full" />
                          {l.label}
                        </a>
                      : <button onClick={l.onClick} className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-primary dark:hover:text-primary transition-colors duration-150 flex items-center gap-1 group">
                          <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-200 rounded-full" />
                          {l.label}
                        </button>
                    }
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 dark:text-[#dae2fd] mb-4">Legal</h3>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((l, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-primary dark:hover:text-primary transition-colors duration-150 flex items-center gap-1 group">
                      <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-200 rounded-full" />
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent mb-8" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400 dark:text-[#3d4a5c]">
              © {new Date().getFullYear()} Resumate. All rights reserved.
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 dark:text-[#3d4a5c]">Built with</span>
              <span className="text-red-400 text-xs mx-0.5">♥</span>
              <span className="text-xs text-gray-400 dark:text-[#3d4a5c]">using AI</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-[#3d4a5c]">
              <a href="#" className="hover:text-primary transition-colors duration-150">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:text-primary transition-colors duration-150">Terms</a>
              <span>·</span>
              <a href="mailto:support@resumate.ai" className="hover:text-primary transition-colors duration-150">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
