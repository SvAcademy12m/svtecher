import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  HiHome, HiBookOpen, HiCurrencyDollar, HiLogout, HiMenu, HiX, 
  HiAcademicCap, HiUserGroup, HiUser, HiShieldCheck, HiTranslate, HiMoon, HiSun, HiGlobe, HiCog, HiLightningBolt
} from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logoutUser } from '../../core/services/authService';
import { db } from '../../core/firebase/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { courseService } from '../../core/services/firestoreService';
import { getInitials } from '../../core/utils/formatters';

// Modular Panels
import StudentOverview from './panels/StudentOverview';
import StudentCourses from './panels/StudentCourses';
import StudentCertificates from './panels/StudentCertificates';
import StudentPayments from './panels/StudentPayments';
import StudentReferrals from './panels/StudentReferrals';
import StudentProfile from './panels/StudentProfile';
import SocialTasksPanel from './panels/SocialTasksPanel';
import StudentSettings from './panels/StudentSettings';

const StudentDashboard = () => {
  const { userData, user } = useAuth();
  const { formatPrice } = useCurrency();
  const { lang, toggleLanguage } = useLanguage();
  const { toggleCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [activePanel, setActivePanel] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [suggestedCourses, setSuggestedCourses] = useState([]);
  const mainContentRef = useRef(null);

  // Sync active panel with URL query if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const panel = params.get('panel');
    if (panel) setActivePanel(panel);
  }, [location]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(query(collection(db, 'enrollments'), where('studentId', '==', user.uid)), (snap) => {
      setEnrollments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubCourses = courseService.subscribe((data) => {
       setSuggestedCourses(data.slice(0, 3));
    });

    return () => {
      unsub();
      unsubCourses();
    };
  }, [user]);

  useEffect(() => {
    mainContentRef.current?.scrollTo(0, 0);
  }, [activePanel]);

  const navSections = [
    {
      title: 'Academy',
      items: [
        { key: 'overview', label: 'Dashboard', icon: HiHome },
        { key: 'courses', label: 'My Courses', icon: HiBookOpen },
        { key: 'certificates', label: 'Certificates', icon: HiAcademicCap },
        { key: 'profile', label: 'My Profile', icon: HiUser },
      ]
    },
    {
      title: 'Networking & Payments',
      items: [
        { key: 'payments', label: 'Transactions & Payments', icon: HiCurrencyDollar },
        { key: 'referrals', label: 'Referrals', icon: HiUserGroup },
        { key: 'social', label: 'Social Media Tasks', icon: HiLightningBolt },
      ]
    },
    {
      title: 'Security & Access',
      items: [
        { key: 'settings', label: 'Advanced Settings', icon: HiCog },
      ]
    }
  ];

  const getPanelLabel = () => {
    return navSections.flatMap(s => s.items).find(i => i.key === activePanel)?.label || 'Dashboard';
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-8 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl rotate-3 transform group-hover:rotate-0 transition-all duration-500">
            <span className="text-blue-900 font-black text-xl">SV</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-white">Student</h1>
            <p className="text-[10px] font-black text-blue-200/60 tracking-widest mt-1.5 uppercase">Premium Access</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scroll">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-12' : ''}>
            <h3 className="px-5 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => { 
                    navigate(`?panel=${item.key}`);
                    onNavClick?.(); 
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-sm tracking-tight ${
                    activePanel === item.key
                      ? 'bg-white/20 text-white shadow-xl border border-white/20 backdrop-blur-xl scale-[1.02]'
                      : 'text-blue-100/70 hover:bg-white/10 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform ${activePanel === item.key ? 'scale-110 text-cyan-300' : ''}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-red-900/40 hover:brightness-110 transition-all active:scale-95 group mb-6"
        >
          <HiLogout className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>

        <button 
          onClick={() => { setActivePanel('profile'); onNavClick?.(); }}
          className="w-full p-2 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 pr-6 hover:bg-white/10 transition-all text-left group"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-900 font-black shadow-lg shrink-0 group-hover:scale-105 transition-transform">
            {getInitials(userData?.name)}
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p className="text-xs font-black text-white leading-none truncate">{userData?.name || 'Student'}</p>
            <p className={`text-[9px] font-black ${userData?.referralsCount >= 6 ? 'text-emerald-400' : 'text-cyan-400'} tracking-wider mt-1.5 uppercase truncate opacity-80 uppercase`}>
              {userData?.referralsCount >= 101 ? 'Ambassador' : userData?.referralsCount >= 51 ? 'Director' : userData?.referralsCount >= 21 ? 'Leader' : userData?.referralsCount >= 6 ? 'Builder' : 'Starter'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview': return <StudentOverview userData={userData} suggestedCourses={suggestedCourses} enrollments={enrollments} user={user} />;
      case 'courses': return <StudentCourses userData={userData} enrollments={enrollments} suggestedCourses={suggestedCourses} />;
      case 'certificates': return <StudentCertificates userData={userData} enrollments={enrollments} />;
      case 'payments': return <StudentPayments userData={userData} />;
      case 'referrals': return <StudentReferrals userData={userData} />;
      case 'profile': return <StudentProfile userData={userData} user={user} />;
      case 'social': return <SocialTasksPanel />;
      case 'settings': return <StudentSettings userData={userData} user={user} />;
      default: return <StudentOverview userData={userData} suggestedCourses={suggestedCourses} enrollments={enrollments} user={user} />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-[#020617] font-sans transition-colors duration-500">
      <header className="h-20 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white shrink-0 z-50 border-b border-white/10 shadow-3xl flex items-center justify-between px-4 lg:px-10 backdrop-blur-3xl sticky top-0">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-blue-800 font-black text-lg">SV</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-tighter leading-none uppercase group-hover:text-cyan-400 transition-colors">SVTECH DIGITAL</h1>
              <p className="text-[8px] font-black text-blue-400 tracking-[0.3em] mt-1.5 uppercase opacity-60">Elite Academy</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
             <h2 className="text-sm font-black text-white uppercase tracking-tighter truncate max-w-[200px]">{getPanelLabel()}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          <div className="hidden md:flex items-center gap-2 p-1 bg-white/10 rounded-2xl border border-white/20">
            <button onClick={toggleLanguage} className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all relative">
              <HiTranslate className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-500 rounded-full text-[8px] font-black">{lang}</span>
            </button>
            <button onClick={toggleCurrency} className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all">
              <HiCurrencyDollar className="w-5 h-5" />
            </button>
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white/20 text-white transition-all">
              {theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>
          </div>

          <div onClick={() => setActivePanel('profile')} className="flex items-center gap-3 p-1 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
            <div className="hidden sm:block text-right pl-3 pr-1">
              <p className="text-xs font-black text-white leading-none">{userData?.name || 'Student'}</p>
              <p className="text-[8px] font-black text-blue-300 tracking-widest mt-1.5 opacity-70 uppercase truncate max-w-[100px]">
                {userData?.referralsCount >= 101 ? 'Ambassador' : userData?.referralsCount >= 51 ? 'Director' : userData?.referralsCount >= 21 ? 'Leader' : userData?.referralsCount >= 6 ? 'Builder' : 'Starter'}
              </p>
            </div>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-700 font-black shadow-lg">
              {getInitials(userData?.name)}
            </div>
          </div>
          
          <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2.5 bg-white/10 rounded-xl text-white">
            <HiMenu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 border-r border-white/5 shadow-2xl z-40 overflow-hidden">
          <SidebarContent />
        </aside>

        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative w-[85%] max-w-[320px] h-full bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-300">
              <button 
                onClick={() => setMobileSidebarOpen(false)} 
                className="absolute top-8 right-6 w-10 h-10 flex items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white z-50 transition-colors"
              >
                <HiX className="w-8 h-8" />
              </button>
              <SidebarContent onNavClick={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
           <div className="lg:hidden bg-white dark:bg-[#0e1225] border-b border-slate-100 dark:border-white/5 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{getPanelLabel()}</h3>
           </div>

           <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scroll bg-[#f8fafc] dark:bg-[#080b18]">
              <div className="max-w-[1600px] mx-auto min-h-full">
                 {renderPanel()}
              </div>
           </main>

           <footer className="shrink-0 px-8 py-4 bg-white dark:bg-[#0e1225] border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SVTECH Academy Hub <span className="mx-2">|</span> 2026 Ready</p>
              </div>
              <div className="hidden sm:flex items-center gap-6">
                 <span className="text-[9px] font-black text-slate-400 hover:text-blue-600 cursor-pointer uppercase transition-colors tracking-widest">Infrastructure Status</span>
                 <span className="text-[9px] font-black text-slate-400 hover:text-blue-600 cursor-pointer uppercase transition-colors tracking-widest">Protocol Guard</span>
              </div>
           </footer>
        </div>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/95 dark:bg-[#0e1225]/95 backdrop-blur-3xl border-t border-slate-200 dark:border-white/10 px-6 py-2 flex items-center justify-between pb-safe shadow-2xl">
        <MobileNavItem active={activePanel === 'overview'} icon={HiHome} onClick={() => navigate('?panel=overview')} />
        <MobileNavItem active={activePanel === 'courses'} icon={HiBookOpen} onClick={() => navigate('?panel=courses')} />
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="w-14 h-14 -mt-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-2xl border-4 border-white dark:border-[#0e1225]"
        >
          <HiMenu className="w-8 h-8" />
        </button>
        <MobileNavItem active={activePanel === 'referrals'} icon={HiUserGroup} onClick={() => navigate('?panel=referrals')} />
        <MobileNavItem active={activePanel === 'profile'} icon={HiUser} onClick={() => navigate('?panel=profile')} />
      </nav>
    </div>
  );
};

const MobileNavItem = ({ active, icon: Icon, onClick }) => (
  <button onClick={onClick} className={`p-2 rounded-xl transition-all ${active ? 'bg-blue-600/10 text-blue-600' : 'text-slate-400'}`}>
    <Icon className="w-6 h-6" />
  </button>
);

export default StudentDashboard;
