import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiTranslate, HiSearch, HiArrowRight, HiMoon, HiSun, HiUserGroup } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ROLE_DASHBOARD_PATHS } from '../../core/utils/constants';
import GlobalSearch from '../ui/GlobalSearch';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, userData, logout } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Ctrl+K keyboard shortcut for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Unified app shell - Navbar renders everywhere

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/services', label: t('services') },
    { to: '/courses', label: t('courses') },
    { to: '/blog', label: t('blog') },
    { to: '/about', label: t('about') },
    { to: '/contact', label: t('contact') },
  ];

  const dashboardPath = userData?.role ? (ROLE_DASHBOARD_PATHS[userData.role] || '/dashboard/student') : null;

  return (
    <>
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled
        ? 'py-3 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 shadow-2xl shadow-blue-900/40'
        : 'py-5 bg-gradient-to-b from-blue-950/80 to-transparent backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 sm:gap-3 group" onClick={() => window.scrollTo(0,0)}>
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-700 via-blue-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 transform group-hover:rotate-12 transition-all duration-500 overflow-hidden">
                <span className="text-white font-black text-xs sm:text-sm relative z-10">SV</span>
                <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-2xl blur opacity-10 group-hover:opacity-30 transition-opacity"></div>
            </div>
            <div className="flex flex-col ml-0 sm:ml-1 text-white">
              <span className="text-[14px] sm:text-[20px] font-black tracking-tighter leading-none drop-shadow-2xl">
                SVTECH <span className="text-cyan-300 font-black">DIGITAL</span>
              </span>
              <span className="text-[8px] sm:text-[11px] font-black tracking-[0.4em] text-white/95 leading-none mt-1 uppercase">
                Technology & Training
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/10 dark:bg-white/5 p-1 rounded-2xl backdrop-blur-md">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-5 py-2.5 rounded-xl text-sm font-black tracking-widest transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-xl shadow-white/20 scale-105'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isScrolled ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <HiSearch className="w-4 h-4" />
              <span className="hidden md:block">Search</span>
              <kbd className={`hidden md:block px-1.5 py-0.5 rounded text-[9px] font-black leading-none ${
                isScrolled ? 'bg-white text-slate-400 border border-slate-200' : 'bg-white/10 text-white/50'
              }`}>⌘K</kbd>
            </button>

            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                isScrolled 
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isDark ? <HiMoon className="w-4 h-4" /> : <HiSun className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleLanguage}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black tracking-widest transition-all ${
                isScrolled ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <HiTranslate className="w-4 h-4" />
              {lang === 'en' ? 'Am' : 'En'}
            </button>

            <div className="h-6 w-px bg-slate-200/20 hidden sm:block mx-1" />

            {/* Removed Dashboard Button as requested by user - only showing Sign up/Login or Avatar/Controls */}
            {user ? (
               <div className="group relative">
                 <div className="flex items-center gap-3 cursor-pointer p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10">
                   <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
                     {userData?.name?.charAt(0).toUpperCase() || 'U'}
                   </div>
                 </div>

                 {/* Profile Mini-Dashboard Dropdown */}
                 <div className="absolute right-0 top-full pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[100]">
                    <div className="w-72 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden">
                      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-6 text-white text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
                        <div className="relative z-10">
                          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black mx-auto mb-3 border border-white/20">
                            {userData?.name?.charAt(0).toUpperCase() || <HiUserGroup />}
                          </div>
                          <h3 className="font-black text-lg truncate">{userData?.name || 'Explorer'}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300 opacity-80">{userData?.role || 'Guest'}</p>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Bio */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Core Bio</span>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {userData?.bio || "Building the digital future with SVTECH Excellence."}
                          </p>
                        </div>

                        {/* Social Stats */}
                        <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-50">
                          <div className="text-center">
                            <span className="block text-sm font-black text-blue-700">{userData?.followersCount || 0}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Followers</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-sm font-black text-blue-700">{userData?.followingCount || 0}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Following</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-sm font-black text-blue-700">{userData?.referralsCount || 0}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Referrals</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <button onClick={() => navigate(dashboardPath || '/profile')} className="w-full py-3 rounded-xl bg-blue-700 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/20">
                             {t('goToDashboard')}
                           </button>
                           <button onClick={logout} className="w-full py-3 rounded-xl border border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all">
                             {t('logout')}
                           </button>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
            ) : (
              <div className="flex items-center gap-2">
                {!location.pathname.startsWith('/login') && (
                  <button
                    onClick={() => navigate('/login')}
                    className={`hidden md:block px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                      isScrolled || location.pathname.startsWith('/register') || location.pathname.startsWith('/signup') ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {t('signIn')}
                  </button>
                )}
                {!(location.pathname.startsWith('/register') || location.pathname.startsWith('/signup')) && (
                  <button
                    onClick={() => navigate('/register')}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    {t('signUpNow')}
                  </button>
                )}
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2.5 rounded-xl transition-all ${
                isScrolled ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'
              }`}
            >
              {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[60] p-6 shadow-2xl lg:hidden flex flex-col border-r border-slate-100"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black">SV</div>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                <HiX className="w-7 h-7" />
              </button>
            </div>
            
            <nav className="space-y-2 flex-1 overflow-y-auto py-4">
              {navLinks.map((link, i) => (
                <motion.div key={link.to} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between p-5 rounded-2xl text-xl font-black transition-all ${
                        isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-2' : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    {link.label}
                    <HiArrowRight className={`w-6 h-6 transition-transform ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} />
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            <div className="pt-6 border-t border-slate-100 mt-auto space-y-3">
              <button onClick={toggleLanguage} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-slate-50 text-slate-800 font-bold text-sm">
                <HiTranslate className="w-5 h-5 text-blue-500" />
                {lang === 'en' ? 'Switch to አማርኛ' : 'ወደ English ቀይር'}
              </button>
              {user ? (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {userData?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 truncate">{userData?.name || 'User'}</p>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{userData?.role || 'Member'}</p>
                    </div>
                  </div>
                  {/* Profile Actions */}
                   <button onClick={() => navigate('/profile')} className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                     <HiUserGroup className="w-4 h-4" /> {t('editProfile')}
                   </button>
                   <button onClick={() => navigate(dashboardPath || '/profile')} className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                     <HiArrowRight className="w-4 h-4" /> {userData?.role === 'admin' ? t('adminConsole') : t('dashboard')}
                   </button>
                   <button onClick={() => { logout(); navigate('/'); }} className="w-full py-3.5 rounded-2xl border-2 border-rose-100 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
                     <HiX className="w-4 h-4" /> {t('logout')}
                   </button>
                </div>
              ) : (
                <div className={`grid gap-3 ${
                  location.pathname.startsWith('/login') || location.pathname.startsWith('/register') || location.pathname.startsWith('/signup') 
                    ? 'grid-cols-1' 
                    : 'grid-cols-2'
                }`}>
                  {!location.pathname.startsWith('/login') && (
                     <button onClick={() => { navigate('/login'); setMobileOpen(false); }} className="py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-600 transition-all active:scale-95">
                       {t('signIn')}
                     </button>
                   )}
                   {!(location.pathname.startsWith('/register') || location.pathname.startsWith('/signup')) && (
                     <button onClick={() => { navigate('/register'); setMobileOpen(false); }} className="py-4 bg-blue-600 rounded-2xl font-black text-white shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                       {t('signUpNow')}
                     </button>
                   )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
