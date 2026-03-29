import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import logoImg from '../../public/Fevicon.png'

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
          <a href="#features" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">How it Works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Pricing</a>
        </nav>

        {/* CTA buttons */}
        <div className="mt-auto px-4 pb-8 flex flex-col gap-3 border-t border-gray-200 dark:border-white/10 pt-4">
          <button
            onClick={() => { navigate('/login'); setMenuOpen(false) }}
            className="w-full px-4 py-3 text-sm font-semibold text-gray-700 dark:text-[#dae2fd] border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => { navigate('/register'); setMenuOpen(false) }}
            className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] text-sm font-bold rounded-xl flex items-center justify-center gap-2"
          >
            Get Started
            <span className="material-symbols-outlined text-base">arrow_forward</span>
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
                className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all items-center gap-2"
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
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-primary">AI-Powered Resume Analysis</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold font-headline mb-6 text-gray-900 dark:text-white animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="bg-gradient-to-r from-primary via-primary-container to-blue-400 bg-clip-text text-transparent">
              Resumate AI
            </span>
            <span className="block text-gray-900 dark:text-white">– Your AI Career Copilot</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-[#8892a4] max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Get ATS score, job match insights, and interview prep instantly. Land your dream job with AI-powered resume optimization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <button onClick={() => navigate('/register')} className="group px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] font-bold rounded-2xl hover:scale-105 transition-all flex items-center gap-2">
              Get Started Free
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mt-20 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '50K+', label: 'Resumes Analyzed' },
              { value: '95%', label: 'Success Rate' },
              { value: '4.9/5', label: 'User Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold font-headline text-primary mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-[#8892a4]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Features</span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline mt-3 mb-4 text-gray-900 dark:text-white">
              Everything You Need to
              <br />
              <span className="text-primary">Land Your Dream Job</span>
            </h2>
            <p className="text-gray-500 dark:text-[#8892a4] max-w-2xl mx-auto">
              Powerful AI tools to optimize your resume, match with jobs, and ace interviews
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'speed', title: 'ATS Score Analysis', description: 'Get instant ATS compatibility score and optimization tips', color: 'from-green-500 to-emerald-500', delay: '0s' },
              { icon: 'work', title: 'Job Match %', description: 'See how well your resume matches job descriptions', color: 'from-primary to-blue-500', delay: '0.1s' },
              { icon: 'forum', title: 'AI Interview Prep', description: 'Practice with AI-generated interview questions', color: 'from-purple-500 to-pink-500', delay: '0.2s' },
              { icon: 'edit_note', title: 'Resume Rewriter', description: 'AI-powered resume enhancement and rewriting', color: 'from-orange-500 to-red-500', delay: '0.3s' },
            ].map((feature, i) => (
              <div key={i} className="group card-hover bg-white dark:bg-[#0f1829] border-2 border-gray-300 dark:border-white/[0.06] rounded-2xl p-6 hover:border-blue-400 dark:hover:border-primary/30 shadow-md hover:shadow-xl dark:shadow-none dark:hover:shadow-lg transition-all animate-fade-up" style={{ animationDelay: feature.delay }}>
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="material-symbols-outlined text-white">{feature.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#dae2fd] mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-[#8892a4]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white dark:bg-[#070d1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline mt-3 text-gray-900 dark:text-white">
              Three Simple Steps to
              <span className="text-primary"> Success</span>
            </h2>
            <p className="text-gray-500 dark:text-[#8892a4] mt-4 max-w-xl mx-auto">
              Get from resume upload to job-ready in minutes with our AI-powered workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'cloud_upload', title: 'Upload Resume', description: 'Drop your PDF or DOCX resume and let our system parse it instantly.', color: 'from-blue-500 to-primary', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-300 dark:border-blue-500/20', hover: 'hover:border-blue-500 dark:hover:border-blue-400/40 hover:shadow-2xl hover:shadow-blue-200/50 dark:hover:shadow-blue-500/10' },
              { icon: 'auto_awesome', title: 'AI Analysis', description: 'Our AI scans for ATS compatibility, keywords, and job match in seconds.', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-300 dark:border-purple-500/20', hover: 'hover:border-purple-500 dark:hover:border-purple-400/40 hover:shadow-2xl hover:shadow-purple-200/50 dark:hover:shadow-purple-500/10' },
              { icon: 'insights', title: 'Get Insights', description: 'Receive a detailed score, improvement tips, and tailored job matches.', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-300 dark:border-green-500/20', hover: 'hover:border-green-500 dark:hover:border-green-400/40 hover:shadow-2xl hover:shadow-green-200/50 dark:hover:shadow-green-500/10' },
            ].map((step, i) => (
              <div key={i} className={`flex flex-col items-center text-center p-8 rounded-3xl border-2 ${step.border} ${step.bg} ${step.hover} shadow-md hover:shadow-2xl dark:hover:shadow-lg transition-all duration-300 group`}>
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <span className="material-symbols-outlined text-3xl text-white">{step.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-sm text-gray-700 dark:text-[#8892a4] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Product Preview</span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline mt-3 text-gray-900 dark:text-white">
              Powerful Dashboard Analytics
            </h2>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 dark:from-primary/20 to-purple-500/10 dark:to-purple-500/20 blur-3xl" />
            <div className="relative bg-white dark:bg-[#0f1829] border-2 border-gray-300 dark:border-white/10 rounded-3xl p-8 overflow-hidden shadow-xl dark:shadow-none">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {[
                  { label: 'ATS Score', value: '87%', lightColor: '#16a34a', darkColor: '#4ade80', icon: 'speed' },
                  { label: 'Job Match', value: '92%', lightColor: '#2563eb', darkColor: '#c0c1ff', icon: 'work' },
                  { label: 'Keywords', value: '24', lightColor: '#000000', darkColor: '#c084fc', icon: 'label' },
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-white/5 border-2 border-gray-300 dark:border-white/10 rounded-2xl p-6 hover:border-gray-400 dark:hover:border-white/20 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-[#8892a4]">{stat.label}</span>
                      <span className="material-symbols-outlined text-sm" style={{ color: dark ? stat.darkColor : stat.lightColor }}>{stat.icon}</span>
                    </div>
                    <p className="text-3xl font-extrabold font-headline" style={{ color: dark ? stat.darkColor : stat.lightColor }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-white/5 border-2 border-gray-300 dark:border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-4">Score Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Keyword Match', value: 85 },
                    { label: 'Formatting', value: 92 },
                    { label: 'Experience', value: 88 },
                    { label: 'Skills', value: 90 },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-[#8892a4] mb-1">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Match Preview */}
      <section className="py-20 px-6 bg-gray-50/80 dark:bg-[#070d1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Job Matching</span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline mt-3 text-gray-900 dark:text-white">
              Find Your Perfect Match
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Senior React Developer', company: 'TechCorp Inc', location: 'Remote', salary: '₹18L - ₹25L', match: 85, missing: ['Kubernetes', 'AWS'] },
              { title: 'Full Stack Engineer', company: 'StartupXYZ', location: 'Bangalore', salary: '₹12L - ₹18L', match: 72, missing: ['Docker', 'GraphQL'] },
            ].map((job, i) => (
              <div key={i} className="bg-white dark:bg-[#0f1829] border-2 border-gray-300 dark:border-white/10 rounded-2xl p-6 hover:border-blue-400 dark:hover:border-primary/30 shadow-md hover:shadow-xl dark:shadow-none dark:hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-[#dae2fd] mb-1 group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">{job.title}</h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-[#8892a4] flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">business</span>
                      {job.company}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    job.match >= 80
                      ? 'bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-400 border-2 border-green-300 dark:border-green-400/20'
                      : 'bg-blue-50 dark:bg-primary/10 text-blue-600 dark:text-primary border-2 border-blue-300 dark:border-primary/20'
                  }`}>
                    {job.match}% Match
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-[#8892a4] mb-4">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">payments</span>
                    {job.salary}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 dark:text-[#8892a4] mb-2">Skills to improve:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.missing.map((skill, j) => (
                      <span key={j} className="px-2 py-1 bg-red-50 dark:bg-red-400/10 border-2 border-red-300 dark:border-red-400/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full py-2 bg-blue-50 dark:bg-primary/10 border-2 border-blue-300 dark:border-primary/20 text-blue-600 dark:text-primary text-sm font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-primary/20 hover:shadow-lg transition-all">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview Preview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Interview Prep</span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline mt-3 text-gray-900 dark:text-white">
              AI-Generated Interview Questions
            </h2>
          </div>

          <div className="bg-white dark:bg-[#0f1829] border-2 border-gray-300 dark:border-white/10 rounded-3xl p-8 shadow-xl dark:shadow-none">
            <div className="space-y-4">
              {[
                'Tell me about your experience with React and modern JavaScript frameworks.',
                'How do you handle state management in large-scale applications?',
                'Describe a challenging project you worked on and how you overcame obstacles.',
              ].map((question, i) => (
                <div key={i} className="bg-gray-50 dark:bg-white/5 border-2 border-gray-300 dark:border-white/10 rounded-2xl p-6 hover:border-blue-400 dark:hover:border-primary/30 hover:shadow-lg dark:hover:shadow-md transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-primary/20 border-2 border-blue-300 dark:border-primary/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-primary/30 transition-colors shadow-sm">
                      <span className="text-xs font-bold text-blue-600 dark:text-primary">Q{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-[#dae2fd] mb-3 font-medium">{question}</p>
                      <button className="text-xs font-semibold text-blue-600 dark:text-primary hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        Get AI Answer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 dark:from-primary/20 to-purple-500/10 dark:to-purple-500/20 blur-3xl" />
            <div className="relative bg-gradient-to-br from-blue-50 dark:from-[#0f1829] to-indigo-50 dark:to-[#1a2540] border border-blue-100 dark:border-white/10 rounded-3xl p-12 shadow-xl dark:shadow-none">
              <h2 className="text-4xl md:text-5xl font-extrabold font-headline mb-4 text-gray-900 dark:text-white">
                Start Improving Your
                <br />
                <span className="text-primary">Resume Today</span>
              </h2>
              <p className="text-lg text-gray-500 dark:text-[#8892a4] mb-8 max-w-2xl mx-auto">
                Join thousands of job seekers who have successfully landed their dream jobs with Resumate
              </p>
              <button onClick={() => navigate('/register')} className="group px-10 py-4 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] font-bold rounded-2xl hover:scale-105 transition-all inline-flex items-center gap-2">
                Try Now - It&apos;s Free
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <p className="text-xs text-gray-400 dark:text-[#8892a4] mt-4">No credit card required • Free forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-white/5 py-12 px-6 bg-gray-50 dark:bg-[#070d1a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={logoImg} alt="logo" className="w-8 h-8 rounded-lg object-contain" />
                <span className="text-xl font-bold font-headline text-gray-900 dark:text-white">Resumate</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-[#8892a4] mb-5 leading-relaxed">
                AI-powered resume analysis to help you land your dream job faster.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" title="Twitter" className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-gray-500 dark:text-[#8892a4] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-white/10 transition-all">
                  <span className="material-symbols-outlined text-sm">tag</span>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" title="LinkedIn" className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-gray-500 dark:text-[#8892a4] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-white/10 transition-all">
                  <span className="material-symbols-outlined text-sm">work</span>
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" title="GitHub" className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-gray-500 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                  <span className="material-symbols-outlined text-sm">code</span>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-4">Product</h3>
              <ul className="space-y-2.5">
                <li><a href="#features" className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">How it Works</a></li>
                <li><button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">Dashboard</button></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-4">Company</h3>
              <ul className="space-y-2.5">
                <li><button onClick={() => navigate('/register')} className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">Get Started</button></li>
                <li><button onClick={() => navigate('/login')} className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">Sign In</button></li>
                <li><a href="mailto:support@resumate.ai" className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="mailto:support@resumate.ai" className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] mb-4">Legal</h3>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-sm text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-[#8892a4] text-center sm:text-left">© {new Date().getFullYear()} Resumate. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-[#8892a4]">
              <a href="#" className="hover:text-blue-600 dark:hover:text-primary transition-colors">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:text-blue-600 dark:hover:text-primary transition-colors">Terms</a>
              <span>·</span>
              <a href="mailto:support@resumate.ai" className="hover:text-blue-600 dark:hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
