import { useState, useEffect } from 'react'
import logoImg from '../../public/Fevicon.png'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { getMe, logout } from '../services/resumeService'
import { useTheme } from '../context/ThemeContext'
import { LayoutDashboard, Upload, BarChart3, Briefcase, MessageSquare, Award, History, Settings, Sparkles, Plus, User, ChevronDown, Menu, Search, Bell, Zap, CheckCircle, LogOut, Sun, Moon } from 'lucide-react'

const NAV = [
  { Icon: LayoutDashboard, label: 'Dashboard',  to: '/dashboard',  end: true },
  { Icon: Upload,          label: 'Upload',      to: '/upload' },
  { Icon: BarChart3,       label: 'Analysis',    to: '/result' },
  { Icon: Briefcase,       label: 'Job Matches', to: '/jobs' },
  { Icon: MessageSquare,   label: 'Interviews',  to: '/interviews' },
  { Icon: Award,           label: 'Benchmark',   to: '/benchmark' },
  { Icon: History,         label: 'History',     to: '/history' },
  { Icon: Settings,        label: 'Settings',    to: '/settings' },
]

function SidebarLink({ Icon, label, to, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `sidebar-link flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold group relative overflow-hidden ${
          isActive
            ? 'active-link text-blue-600 dark:text-primary bg-blue-50 dark:bg-transparent border border-blue-200 dark:border-transparent'
            : 'text-gray-600 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-[#dae2fd] hover:bg-blue-50/50 dark:hover:bg-white/5 border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 dark:bg-primary rounded-full" />
          )}
          <Icon className={`w-5 h-5 transition-all ${isActive ? 'text-blue-600 dark:text-primary' : 'text-gray-600 dark:text-[#8892a4] group-hover:text-blue-600 dark:group-hover:text-[#dae2fd]'}`} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    getMe().then(setUser).catch(() => {
      logout()
      navigate('/login')
    })
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const pageTitle = NAV.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || 'Dashboard'

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#070d1a] font-body transition-colors duration-200">

      {/* Mobile overlay with blur */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          sidebarOpen ? 'bg-black/50 backdrop-blur-sm pointer-events-auto' : 'bg-transparent backdrop-blur-none pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-60 flex flex-col z-50 border-r border-gray-200 dark:border-white/5
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white dark:bg-[#0b1120]`}
      >
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-3 border-b border-gray-200 dark:border-white/5">
          <img src={logoImg} alt="logo" className="w-8 h-8 rounded-xl object-contain flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-[#dae2fd] tracking-tight leading-none">Resumate</p>
            <p className="text-[10px] text-primary/70 uppercase tracking-widest mt-0.5">Pro</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#3d4a5c] px-4 mb-2">Main</p>
          {NAV.slice(0, 6).map(n => (
            <SidebarLink key={n.to} {...n} onClick={() => setSidebarOpen(false)} />
          ))}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#3d4a5c] px-4 mt-4 mb-2">Account</p>
          {NAV.slice(6).map(n => (
            <SidebarLink key={n.to} {...n} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* New Analysis CTA */}
        <div className="px-3 pb-4">
          <button
            onClick={() => { navigate('/upload'); setSidebarOpen(false) }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] text-sm font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </button>
        </div>

        {/* User */}
        <div className="px-3 pb-5 border-t border-gray-200 dark:border-white/5 pt-3">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-blue-50/50 dark:hover:bg-white/5 cursor-pointer transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container border border-primary/50 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-gray-900 dark:text-[#dae2fd] truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-gray-600 dark:text-[#8892a4] truncate">{user?.email || 'Loading...'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-[#8892a4]" />
            </button>
            
            {userMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <button
                  onClick={() => { navigate('/settings'); setUserMenuOpen(false); setSidebarOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-left"
                >
                  <Settings className="w-4 h-4 text-gray-600 dark:text-[#8892a4]" />
                  <span className="text-xs text-gray-900 dark:text-[#dae2fd]">Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-400/10 transition-all text-left border-t border-gray-200 dark:border-white/5"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-60 flex flex-col min-h-screen w-full">

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 lg:px-6 border-b-2 border-gray-300 dark:border-white/5 bg-white dark:bg-[rgba(23,31,51,0.7)] backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-3">
            {/* Hamburger — visible on mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#8892a4] hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <p className="text-base font-extrabold text-gray-900 dark:text-[#dae2fd]">{pageTitle}</p>
          </div>

          {/* Search — desktop only */}
          <div className="hidden md:flex flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8892a4]" />
              <input
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-900 dark:text-[#dae2fd] placeholder:text-gray-400 dark:placeholder:text-[#8892a4] outline-none focus:border-primary/30 focus:bg-gray-50 dark:focus:bg-white/8 transition-all"
                placeholder="Search analyses..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false) }}
                className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 text-gray-500 dark:text-[#8892a4] hover:text-gray-900 dark:hover:text-[#dae2fd] transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-tertiary rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-50">
                  <p className="text-xs font-bold text-gray-900 dark:text-[#dae2fd] mb-3">Notifications</p>
                  {[
                    { Icon: CheckCircle, text: 'Resume analysis complete', time: '2m ago', color: 'text-green-400' },
                    { Icon: Sparkles, text: 'New job matches found', time: '1h ago', color: 'text-primary' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0">
                      <n.Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${n.color}`} />
                      <div>
                        <p className="text-xs text-gray-900 dark:text-[#dae2fd]">{n.text}</p>
                        <p className="text-[10px] text-gray-500 dark:text-[#8892a4] mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#A6ADFF] hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-all"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Upgrade — hidden on mobile */}
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-all">
              <Zap className="w-4 h-4" />
              Upgrade
            </button>

            {/* Profile — hidden on mobile (accessible via sidebar) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false) }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-300 dark:hover:bg-white/8 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-900 dark:text-[#dae2fd] max-w-[80px] truncate">{user?.name || 'User'}</span>
                <ChevronDown className="w-3 h-3 text-gray-500 dark:text-[#8892a4]" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                    <p className="text-xs font-semibold text-gray-900 dark:text-[#dae2fd] truncate">{user?.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-[#8892a4] truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/settings'); setUserMenuOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-left"
                  >
                    <Settings className="w-4 h-4 text-gray-500 dark:text-[#8892a4]" />
                    <span className="text-xs text-gray-900 dark:text-[#dae2fd]">Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all text-left border-t border-gray-100 dark:border-white/5"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400">Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Logout — desktop only */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-semibold hover:bg-red-400/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
