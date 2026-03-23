import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  HiHome, HiUserGroup, HiAcademicCap, HiBriefcase, HiNewspaper,
  HiMail, HiCash, HiUserAdd, HiGlobe, HiLogout, HiMenu, HiX,
  HiTranslate, HiCurrencyDollar, HiSwitchHorizontal, HiCog,
  HiSearch, HiBell, HiDocumentText, HiClipboardList,
  HiShieldCheck, HiShoppingCart, HiOfficeBuilding,
  HiMoon, HiSun, HiSupport, HiCreditCard, HiCollection,
  HiChartBar, HiPhotograph, HiLink, HiChevronDown, HiChevronRight, HiChatAlt2,
  HiLightningBolt, HiDeviceMobile, HiUser
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
import ServiceOrdersPanel from './panels/ServiceOrdersPanel';
import CoursePanel from './panels/CoursePanel';
import EmployersPanel from './panels/EmployersPanel';
import WithdrawalPanel from './panels/WithdrawalPanel';
import JobPanel from './panels/JobPanel';
import BlogPanel from './panels/BlogPanel';
import MessagePanel from './panels/MessagePanel';
import TransactionPanel from './panels/TransactionPanel';
import ReferralPanel from './panels/ReferralPanel';
import WebAppPanel from './panels/WebAppPanel';
import CertificatePanel from './panels/CertificatePanel';
import SettingsPanel from './panels/SettingsPanel';
import ApplicationsPanel from './panels/ApplicationsPanel';
import SupportTicketsPanel from './panels/SupportTicketsPanel';
import PaymentVerification from './panels/PaymentVerification';
import AdminChatPanel from './panels/AdminChatPanel';
import SocialTaskPanel from './panels/SocialTaskPanel';
import CourseOrdersPanel from './panels/CourseOrdersPanel';
import AdminProfile from './panels/AdminProfile';

const AdminDashboard = () => {
  const [activePanel, setActivePanel] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openGroups, setOpenGroups] = useState({ users: true, content: false, finance: false, system: false, tools: false });
  const { userData, user } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const { currency, toggleCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync active panel with URL query if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const panel = params.get('panel');
    if (panel) setActivePanel(panel);
  }, [location]);

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
    toast.success('Signed out successfully');
    navigate('/');
  };

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Grouped sidebar navigation according to Phase 2 requirements
  const navGroups = [
    {
      key: 'main',
      label: null,
      items: [
        { key: 'dashboard', label: t('overview'), icon: HiHome, color: 'text-blue-400' },
      ]
    },
    {
      key: 'registry',
      label: 'Users',
      items: [
        { key: 'all-users', label: 'All Users', icon: HiUserGroup, color: 'text-cyan-400' },
        { key: 'students', label: t('students'), icon: HiAcademicCap, color: 'text-indigo-400' },
        { key: 'teachers', label: t('teachers'), icon: HiUserAdd, color: 'text-purple-400' },
        { key: 'employers', label: t('job_owners'), icon: HiOfficeBuilding, color: 'text-blue-500' },
      ]
    },
    {
      key: 'academy',
      label: 'Academy',
      items: [
        { key: 'courses', label: t('courses'), icon: HiAcademicCap, color: 'text-blue-400' },
        { key: 'certificates', label: t('certificates'), icon: HiShieldCheck, color: 'text-indigo-400' },
        { key: 'course-orders', label: 'Enrollments', icon: HiClipboardList, color: 'text-indigo-400' },
      ]
    },
    {
      key: 'finance',
      label: 'Finance',
      items: [
        { key: 'payments-verify', label: 'Payments', icon: HiCreditCard, color: 'text-emerald-400' },
        { key: 'transactions', label: 'Advanced Audit', icon: HiCash, color: 'text-amber-400' },
        { key: 'withdrawals', label: 'Withdrawals', icon: HiCurrencyDollar, color: 'text-green-400' },
        { key: 'referrals', label: 'Referrals', icon: HiLink, color: 'text-blue-400' },
      ]
    },
    {
      key: 'digital-post',
      label: 'Content',
      items: [
        { key: 'social-tasks', label: 'Marketing', icon: HiLightningBolt, color: 'text-amber-400' },
        { key: 'posts', label: 'Blog', icon: HiNewspaper, color: 'text-rose-400' },
        { key: 'web-apps', label: 'Apps', icon: HiDeviceMobile, color: 'text-blue-400' },
      ]
    },
    {
      key: 'support-mgmt',
      label: 'Support',
      items: [
        { key: 'service-orders', label: 'Services', icon: HiGlobe, color: 'text-cyan-400' },
        { key: 'chat', label: 'Chat', icon: HiChatAlt2, color: 'text-cyan-400' },
        { key: 'support', label: 'Tickets', icon: HiSupport, color: 'text-rose-400' },
        { key: 'applications', label: 'Job Applications', icon: HiClipboardList, color: 'text-amber-400' },
      ]
    },
    {
      key: 'tools',
      label: 'System',
      items: [
        { key: 'job-listings', label: 'Jobs', icon: HiBriefcase, color: 'text-emerald-400' },
        { key: 'settings', label: 'Settings', icon: HiCog, color: 'text-gray-400' },
        { key: 'profile', label: 'Profile', icon: HiUser, color: 'text-blue-400' },
      ]
    },
  ].filter(group => {
    if (userData?.role === 'accountant') {
      return ['main', 'finance'].includes(group.key);
    }
    return true;
  });

  // Flat nav items for label lookup
  const navItems = navGroups.flatMap(g => g.items);
  const getPanelLabel = () => navItems.find(i => i.key === activePanel)?.label || t('overview');

  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard': return <AdminOverview users={allUsers} courses={courses} jobs={jobs} posts={posts} applications={applications} onSwitchPanel={setActivePanel} />;
      case 'all-users': return <UserPanel users={allUsers} filterRole={null} onSwitchPanel={setActivePanel} />;
      case 'students': return <UserPanel users={allUsers} filterRole={ROLES.STUDENT} onSwitchPanel={setActivePanel} />;
      case 'teachers': return <UserPanel users={allUsers} filterRole={ROLES.TRAINER} onSwitchPanel={setActivePanel} />;
      case 'job-finders': return <UserPanel users={allUsers} filterRole={ROLES.JOB_FINDER} onSwitchPanel={setActivePanel} />;
      case 'buyers': return <UserPanel users={allUsers} filterRole={ROLES.CUSTOMER} onSwitchPanel={setActivePanel} />;
      case 'sellers': return <UserPanel users={allUsers} filterRole={ROLES.SELLER} onSwitchPanel={setActivePanel} />;
      case 'support-techs': return <UserPanel users={allUsers} filterRole={ROLES.SUPPORT} onSwitchPanel={setActivePanel} />;
      case 'employers': return <UserPanel users={allUsers} filterRole={ROLES.EMPLOYER} onSwitchPanel={setActivePanel} />;
      case 'courses': return <CoursePanel courses={courses} />;
      case 'job-listings': return <JobPanel jobs={jobs} />;
      case 'posts': return <BlogPanel posts={posts} />;
      case 'web-apps': return <WebAppPanel />;
      case 'service-orders': return <ServiceOrdersPanel />;
      case 'certificates': return <CertificatePanel users={allUsers} courses={courses} />;
      case 'payments-verify': return <PaymentVerification />;
      case 'course-orders': return <CourseOrdersPanel />;
      case 'transactions': return <TransactionPanel />;
      case 'withdrawals': return <WithdrawalPanel />;
      case 'referrals': return <ReferralPanel />;
      case 'applications': return <ApplicationsPanel applications={applications} />;
      case 'support': return <SupportTicketsPanel users={allUsers} />;
      case 'settings': return <SettingsPanel />;
      case 'profile': return <AdminProfile userData={userData} user={user} />;
      case 'chat': return <AdminChatPanel allUsers={allUsers} />;
      case 'social-tasks': return <SocialTaskPanel />;
      default: return <AdminOverview users={allUsers} courses={courses} jobs={jobs} posts={posts} applications={applications} onSwitchPanel={setActivePanel} />;
    }
  };
  /* ── Top Public Navbar Links ── */
  const publicLinks = [
    { to: '/', label: t('home') },
    { to: '/services', label: t('services') },
    { to: '/courses', label: t('courses') },
    { to: '/jobs', label: t('jobs') },
    { to: '/blog', label: t('blog') },
    { to: '/about', label: t('about') },
    { to: '/contact', label: t('contact') },
  ];

  /* ── Sidebar Component ── */
  const renderSidebarContent = (onNavClick) => (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1e3a8a] via-[#1e1b4b] to-[#0f172a]">
      {/* Logo Section */}
      <div className="p-5 flex items-center gap-4 border-b border-white/5 shrink-0 bg-white/5 backdrop-blur-md">
        <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] shrink-0 transform transition-transform hover:scale-105">
          <span className="text-blue-800 font-black text-lg">SV</span>
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-black tracking-tighter text-white leading-none truncate uppercase">SV TECHER</h1>
          <p className="text-[10px] font-black text-blue-400 tracking-[0.2em] mt-1 uppercase opacity-80">{t('adminConsole')}</p>
        </div>
      </div>

      {/* Navigation - scrollable */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {navGroups.map(group => (
          <div key={group.key} className="mb-2">
            {/* Group Header (collapsible) */}
            {group.label && (
              <button
                onClick={() => toggleGroup(group.key)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 rounded-xl transition-all group mb-1"
              >
                <span className="text-[11px] font-black text-blue-300 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{group.label}</span>
                {openGroups[group.key]
                  ? <HiChevronDown className="w-3.5 h-3.5 text-blue-300/40" />
                  : <HiChevronRight className="w-3.5 h-3.5 text-blue-300/40" />}
              </button>
            )}
            {/* Group Items */}
            <div className="space-y-1">
              {(!group.label || openGroups[group.key]) && group.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => { 
                    navigate(`/dashboard/admin?panel=${item.key}`);
                    onNavClick?.(); 
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
                    activePanel === item.key
                      ? 'bg-blue-600 shadow-[0_8px_20px_rgb(37,99,235,0.3)] text-white scale-[1.02] border border-white/10'
                      : 'text-blue-200/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {/* Active Indicator */}
                  {activePanel === item.key && (
                    <div className="absolute left-0 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgb(34,211,238,0.5)]" />
                  )}
                  
                  <item.icon className={`w-5 h-5 shrink-0 transition-all duration-500 ${
                    activePanel === item.key ? 'text-white' : `${item.color} group-hover:text-white`
                  }`} />
                  <span className={`text-[13px] font-black tracking-wide truncate ${activePanel === item.key ? 'font-black' : 'font-bold'}`}>
                    {item.label}
                  </span>
                  
                  {/* Subtle hover effect light */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Theme & Language Toggles removed from sidebar to keep them exclusively on the right top navbar */}

      {/* User Info + Sign Out */}
      <div className="p-4 shrink-0 bg-black/20 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-3.5 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 mb-4 group transition-all hover:bg-white/10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xl shrink-0 transform group-hover:rotate-6 transition-transform">
            {getInitials(userData?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-white leading-none truncate">{userData?.name || 'SVTECH'}</p>
            <p onClick={() => setActivePanel('profile')} className="text-[10px] font-black text-blue-400 tracking-widest mt-1.5 uppercase opacity-70 cursor-pointer hover:text-white transition-colors">{t('superAdmin')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-[0_10px_30px_rgb(244,63,94,0.3)] hover:shadow-[0_15px_40px_rgb(244,63,94,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
        >
          <HiLogout className="w-5 h-5" />
          {t('terminateSession')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-[#080b18] font-sans">
      {/* ═══ TOP NAVBAR ═══ */}
      <header className="bg-[#1e1b4b] text-white shrink-0 z-50 border-b border-white/5 shadow-2xl">
        <div className="flex items-center justify-between px-4 lg:px-8 h-14">
          {/* Logo + Nav */}
          <div className="flex items-center gap-6 min-w-0">
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                <span className="text-blue-900 font-black text-base">SV</span>
              </div>
              <div className="hidden md:block">
                <span className="text-sm font-black tracking-tight block leading-none">SVTECH DIGITAL</span>
                <span className="text-[8px] font-bold text-blue-400 tracking-[0.3em] uppercase opacity-70">Technological Hub</span>
              </div>
            </Link>
            
            {/* Social Icons moved to Top Navbar */}
            <div className="hidden lg:flex items-center gap-4 px-6 border-l border-white/10 ml-2">
               <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white/40 hover:text-blue-500 transition-colors"><HiGlobe className="w-5 h-5" /></a>
               <a href="https://t.me" target="_blank" rel="noreferrer" className="text-white/40 hover:text-cyan-400 transition-colors"><HiLightningBolt className="w-5 h-5" /></a>
               <a href="mailto:contact@yegar.com" className="text-white/40 hover:text-rose-400 transition-colors"><HiMail className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Public Nav Dropdown */}
            <div className="relative group hidden md:block">
               <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest border border-white/10 transition-all">
                  Quick Access <HiChevronDown className="w-4 h-4" />
               </button>
               <div className="absolute right-0 mt-2 w-48 bg-[#1e1b4b] border border-white/10 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[100] p-2">
                  <Link to="/" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors"><HiHome className="w-4 h-4 text-blue-400" /> Go Home</Link>
                  <Link to="/services" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors"><HiGlobe className="w-4 h-4 text-cyan-400" /> Services</Link>
                  <Link to="/about" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors"><HiCollection className="w-4 h-4 text-purple-400" /> About Lab</Link>
               </div>
            </div>

            {/* Theme */}
            <button 
              onClick={toggleTheme} 
              className={`p-3 rounded-2xl transition-all duration-500 border-2 shadow-xl ${
                theme === 'dark' 
                  ? 'bg-blue-900 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10' 
                  : 'bg-white text-blue-600 border-blue-50 hover:bg-blue-50'
              }`} 
              title="Toggle theme"
            >
              {theme === 'dark' ? <HiSun className="w-6 h-6 animate-spin-slow" /> : <HiMoon className="w-6 h-6" />}
            </button>
            {/* Language */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-[11px] font-black text-white hover:bg-blue-500 transition-all shadow-[0_8px_20px_rgb(37,99,235,0.25)] border border-white/10 uppercase tracking-widest shrink-0"
              title="Switch language"
            >
              <HiTranslate className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'en' ? 'አማርኛ' : 'English'}</span>
            </button>
            
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-all"
            >
              <HiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 shadow-[10px_0_30px_rgb(0,0,0,0.1)] z-40 overflow-hidden">
          {renderSidebarContent()}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative w-[280px] h-full shadow-2xl flex flex-col overflow-hidden transform transition-transform duration-500">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-5 -right-12 w-10 h-10 flex items-center justify-center rounded-xl text-white bg-blue-600 shadow-xl z-50 border border-white/20"
              >
                <HiX className="w-6 h-6" />
              </button>
              {renderSidebarContent(() => setMobileSidebarOpen(false))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Sub-header Controls */}
          <div className="bg-white dark:bg-[#0e1225] border-b border-gray-200 dark:border-white/5 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <h2 className="text-lg lg:text-xl font-black text-gray-900 dark:text-white tracking-tight truncate">{getPanelLabel()}</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-700/30 shrink-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgb(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em]">{t('system_health')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
                <HiSearch className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500" />
                <input
                  type="text"
                  placeholder={t('search') + '...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-bold text-gray-700 dark:text-white placeholder-gray-400 w-24 md:w-48 transition-all"
                />
              </div>
              
              <button
                onClick={() => window.open('/', '_blank')}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black dark:hover:bg-blue-700 transition-all hover:-translate-y-0.5"
              >
                <HiGlobe className="w-4 h-4" />
                <span className="hidden md:inline">{t('open_display')}</span>
              </button>
            </div>
          </div>

          {/* Scrollable Panel Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-4 bg-[#f8fafc] dark:bg-[#080b18]" style={{ scrollbarWidth: 'thin' }}>
            <div className="max-w-full mx-auto min-h-full">
              {renderPanel()}
            </div>
          </main>
        </div>
      </div>

        {/* Internal Footer Hidden as requested */}
    </div>
  );
};

const MobileNavItem = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 px-4 transition-all ${active ? 'text-blue-600' : 'text-gray-400 dark:text-white/40'}`}
  >
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-blue-600/10' : ''}`}>
      <Icon className={`w-6 h-6 transition-transform ${active ? 'scale-110' : ''}`} />
    </div>
    <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
  </button>
);

export default AdminDashboard;
