import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiHome, HiUserGroup, HiAcademicCap, HiBriefcase, HiNewspaper,
  HiMail, HiCash, HiUserAdd, HiGlobe, HiLogout, HiMenu, HiX,
  HiTranslate, HiCurrencyDollar, HiSwitchHorizontal, HiCog,
  HiSearch, HiBell, HiDocumentText, HiClipboardList,
  HiShieldCheck, HiShoppingCart, HiOfficeBuilding,
  HiMoon, HiSun
} from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logoutUser } from '../../core/services/authService';
import { userService, courseService, jobService, blogService, applicationService, notificationService } from '../../core/services/firestoreService';
import { ROLES } from '../../core/utils/constants';
import { toast } from 'react-toastify';
import { getInitials } from '../../core/utils/formatters';

// Panels
import AdminOverview from './panels/AdminOverview';
import UserPanel from './panels/UserPanel';
import CoursePanel from './panels/CoursePanel';
import EmployersPanel from './panels/EmployersPanel';
import JobPanel from './panels/JobPanel';
import BlogPanel from './panels/BlogPanel';
import MessagePanel from './panels/MessagePanel';
import TransactionPanel from './panels/TransactionPanel';
import ReferralPanel from './panels/ReferralPanel';
import WebAppPanel from './panels/WebAppPanel';
import CertificatePanel from './panels/CertificatePanel';
import SettingsPanel from './panels/SettingsPanel';
import ApplicationsPanel from './panels/ApplicationsPanel';

const AdminDashboard = () => {
  const [activePanel, setActivePanel] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { userData, user } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const { currency, toggleCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Data
  const [allUsers, setAllUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubs = [];
    unsubs.push(userService.getAll(setAllUsers));
    unsubs.push(courseService.subscribe(setCourses));
    unsubs.push(jobService.subscribe(setJobs));
    unsubs.push(blogService.subscribe(setPosts));
    unsubs.push(applicationService.subscribe(setApplications));
    if (user?.uid) unsubs.push(notificationService.getUnread(user.uid, setNotifications));
    return () => unsubs.forEach(u => u && u());
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Signed out');
    navigate('/');
  };

  // Sidebar navigation matching your exact structure
  const navSections = [
    {
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: HiHome },
        { key: 'certificates', label: 'Certificates', icon: HiShieldCheck },
      ]
    },
    {
      title: 'USER MANAGEMENT',
      icon: HiUserGroup,
      items: [
        { key: 'all-users', label: 'All Users', icon: HiUserGroup },
        { key: 'students', label: 'Students', icon: HiAcademicCap },
        { key: 'teachers', label: 'Teachers', icon: HiUserGroup },
        { key: 'buyers', label: 'Buyers Only', icon: HiShoppingCart },
        { key: 'sellers', label: 'Sellers Only', icon: HiSwitchHorizontal },
        { key: 'job-owners', label: 'Job-Owners', icon: HiOfficeBuilding },
      ]
    },
    {
      title: 'CONTENT & CURRICULUM',
      icon: HiNewspaper,
      items: [
        { key: 'posts', label: 'Posts', icon: HiNewspaper },
        { key: 'websites', label: 'Websites', icon: HiGlobe },
        { key: 'courses', label: 'Courses', icon: HiAcademicCap },
      ]
    },
    {
      title: 'LABOR MARKET',
      icon: HiBriefcase,
      items: [
        { key: 'job-listings', label: 'Job Listings', icon: HiBriefcase },
        { key: 'applications', label: 'Applications', icon: HiClipboardList },
      ]
    },
    {
      title: 'FINANCE & GROWTH',
      icon: HiCash,
      items: [
        { key: 'transactions', label: 'Transactions', icon: HiCash },
        { key: 'referrals', label: 'Referrals', icon: HiUserAdd },
      ]
    },
    {
      title: 'PUBLIC PORTALS',
      icon: HiGlobe,
      items: [
        { key: 'go-home', label: 'View Homepage', icon: HiHome, external: true, path: '/' },
        { key: 'go-services', label: 'View Services', icon: HiShoppingCart, external: true, path: '/services' },
        { key: 'go-courses', label: 'View Catalog', icon: HiAcademicCap, external: true, path: '/courses' },
      ]
    },
    {
      items: [
        { key: 'messages', label: 'Messages', icon: HiMail, badge: notifications.length || null },
        { key: 'settings', label: 'Settings', icon: HiCog },
      ]
    },
  ];

  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard': return <AdminOverview users={allUsers} courses={courses} jobs={jobs} posts={posts} applications={applications} onSwitchPanel={setActivePanel} />;
      case 'certificates': return <CertificatePanel users={allUsers} courses={courses} />;
      case 'all-users': return <UserPanel users={allUsers} filterRole={null} />;
      case 'students': return <UserPanel users={allUsers} filterRole={ROLES.STUDENT} title={t('students')} />;
      case 'teachers': return <UserPanel users={allUsers} filterRole={ROLES.TRAINER} title={t('teachers')} />;
      case 'buyers': return <UserPanel users={allUsers} filterRole={ROLES.CUSTOMER} title={t('buyers')} />;
      case 'sellers': return <UserPanel users={allUsers} filterRole={ROLES.SELLER} title={t('sellers')} />;
      case 'job-owners': return <EmployersPanel users={allUsers} />;
      case 'posts': return <BlogPanel posts={posts} />;
      case 'websites': return <WebAppPanel />;
      case 'courses': return <CoursePanel courses={courses} />;
      case 'job-listings': return <JobPanel jobs={jobs} applications={applications} />;
      case 'applications': return <ApplicationsPanel applications={applications} />;
      case 'transactions': return <TransactionPanel />;
      case 'referrals': return <ReferralPanel users={allUsers} />;
      case 'messages': return <MessagePanel notifications={notifications} />;
      case 'settings': return <SettingsPanel />;
      default: return <AdminOverview users={allUsers} courses={courses} jobs={jobs} posts={posts} applications={applications} onSwitchPanel={setActivePanel} />;
    }
  };

  // Panel label for the header
  const getPanelLabel = () => {
    for (const section of navSections) {
      const found = section.items.find(i => i.key === activePanel);
      if (found) return found.label;
    }
    return 'Dashboard';
  };

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full">
      {/* Logo header */}
      <div className="p-6 pb-6 flex items-center gap-4 border-b border-white/10 dark:border-white/5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 group">
          <span className="text-white font-black text-lg tracking-tighter group-hover:scale-110 transition-transform">SV</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-white leading-none tracking-tight">SV TECHER</h1>
          <p className="text-[10px] font-black text-blue-200/60 uppercase tracking-[0.3em] mt-1">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 overflow-y-auto dark-scroll">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-12' : ''}>
            {section.title && (
              <div className="px-2 mb-6 group/title">
                <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border-l-[6px] border-blue-500 shadow-[0_10px_20px_rgba(0,0,0,0.2)] relative overflow-hidden transition-all duration-500 hover:scale-105">
                   <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none" />
                   {section.icon && (
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover/title:bg-blue-600 group-hover/title:text-white transition-all">
                         <section.icon className="w-4 h-4" />
                      </div>
                   )}
                   <p className="text-[11px] font-black text-blue-900 uppercase tracking-[0.25em]">
                     {t(section.title.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')) || section.title}
                   </p>
                   <div className="ml-auto">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                   </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {section.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => { 
                    if (item.external) {
                      navigate(item.path);
                    } else {
                      setActivePanel(item.key); 
                    }
                    onNavClick?.(); 
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden ${
                    !item.external && activePanel === item.key
                      ? 'bg-white/10 border border-white/20 text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] scale-[1.02]'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Subtle Glow behind active item */}
                  {!item.external && activePanel === item.key && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent blur-xl pointer-events-none" />
                  )}
                  
                  {/* Left Indicator */}
                  {!item.external && activePanel === item.key && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
                  )}

                  <div className={`p-3 rounded-2xl transition-all duration-500 z-10 ${
                    !item.external && activePanel === item.key 
                      ? 'bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.4)] -rotate-6 scale-110' 
                      : 'bg-white/5 text-white/40 group-hover:text-blue-200 group-hover:bg-white/10 group-hover:rotate-6'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>

                  <span className={`flex-1 text-left tracking-[0.1em] uppercase text-[11px] font-black z-10 ${
                    !item.external && activePanel === item.key ? 'text-white drop-shadow-md' : 'text-white/80'
                  }`}>
                    {t(item.key.replace(/-/g, '_')) || item.label}
                  </span>

                  {item.badge && (
                    <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-rose-600/40 animate-bounce z-10">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Action Area: Logout (Upgraded) */}
      <div className="px-5 py-6 mt-auto border-t border-white/5 bg-black/20">
        <button 
          onClick={handleLogout} 
          className="w-full group flex items-center justify-center gap-4 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all"
        >
          <div className="p-2 rounded-xl bg-white/20 group-hover:bg-white group-hover:text-rose-600 transition-all">
            <HiLogout className="w-5 h-5" />
          </div>
          <span className="drop-shadow-md">Terminate Session</span>
        </button>
        
        <div className="flex items-center gap-3 mt-6 px-1">
           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-black shadow-lg">
             {getInitials(userData?.name)}
           </div>
           <div className="overflow-hidden">
             <p className="text-[12px] font-black text-white truncate uppercase tracking-tighter">{userData?.name}</p>
             <p className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest leading-none mt-1">{userData?.role || 'Administrator'}</p>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#080b18] overflow-x-hidden font-sans">
      {/* Sidebar - Desktop Navigation Hub */}
      <aside className="hidden lg:flex flex-col w-[300px] bg-gradient-to-br from-[#121831] via-[#0e1225] to-[#0a0d1d] border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.3)] sticky top-0 h-screen overflow-y-auto dark-scroll z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-[85%] max-w-[320px] flex flex-col shadow-[20px_0_60px_rgba(0,0,0,0.5)] transition-all duration-500 border-r border-white/10 animate-in slide-in-from-left" 
               style={{ 
                 background: theme === 'dark' 
                   ? 'linear-gradient(180deg, #0e1225 0%, #070918 100%)' 
                   : 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)' 
               }}>
            <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-6 -right-14 w-12 h-12 flex items-center justify-center rounded-2xl text-white bg-blue-600 shadow-2xl z-50 hover:rotate-90 transition-all">
              <HiX className="w-8 h-8" />
            </button>
            <div className="flex-1 overflow-hidden">
               <SidebarContent onNavClick={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Floating Action Button (FAB) for clean app experience */}
      <button 
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-8 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(37,99,235,0.4)] active:scale-90 transition-all border-4 border-white/10 backdrop-blur-md"
      >
        <HiMenu className="w-7 h-7" />
      </button>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-slate-50 dark:bg-[#080b18]">
        {/* Top bar - Now sticky at top since global Navbar is hidden */}
        <header className="sticky top-0 h-20 bg-white/80 dark:bg-[#0e1225]/80 backdrop-blur-xl border-b border-blue-100 dark:border-white/5 px-6 lg:px-8 flex items-center justify-between flex-shrink-0 transition-all z-20">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-6">
              <div>
                <h2 className="text-xl font-black text-blue-900 dark:text-white tracking-tight">{getPanelLabel()}</h2>
                <p className="text-[10px] font-black text-blue-600/50 dark:text-indigo-400/50 uppercase tracking-[0.2em] mt-0.5">Control Center</p>
              </div>
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">Firebase Sync: Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 mr-2">
              <button onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/5">
                <HiTranslate className="w-4 h-4" /> 
                {lang === 'en' ? 'አማርኛ' : 'English'}
              </button>
              <button onClick={toggleCurrency} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:from-emerald-600 hover:to-teal-600 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/5">
                <HiCurrencyDollar className="w-4 h-4" /> 
                {currency} MARKET
              </button>
              <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:from-indigo-600 hover:to-blue-600 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/5 italic">
                <HiHome className="w-4 h-4" /> LIVE SITE
              </button>
            </div>

            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
              <HiSearch className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-slate-700 w-32 placeholder:text-slate-400"
              />
            </div>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-500/20">
              {theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5 transition-transform" />}
            </button>

            {/* Notifications */}
            <button onClick={() => setActivePanel('messages')} className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all border border-blue-500/20">
              <HiBell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-4 border-white dark:border-[#0e1225] shadow-lg shadow-rose-500/20">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* User */}
            <div className="flex items-center gap-3 pl-5 border-l border-blue-100 dark:border-white/10">
              <div className="flex flex-col items-end text-right hidden sm:flex">
                <span className="text-[13px] font-black text-blue-900 dark:text-white leading-tight uppercase tracking-wide">{userData?.name?.split(' ')[0] || 'Admin'}</span>
                <span className="text-[9px] font-black text-blue-600/60 dark:text-indigo-400/60 uppercase tracking-widest mt-0.5">Super Admin</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-indigo-600/20">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#0e1225] flex items-center justify-center text-blue-600 dark:text-white text-sm font-black overflow-hidden relative">
                   {getInitials(userData?.name)}
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Panel */}
        <main className="flex-1 p-4 lg:p-6 transition-colors">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
