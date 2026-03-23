import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiHome, HiBriefcase, HiDocumentText, HiMail, HiLogout, HiMenu, HiX, 
  HiOfficeBuilding, HiCheckCircle, HiStar, HiUserGroup, HiLink, HiTranslate, 
  HiCurrencyDollar, HiMoon, HiSun, HiGlobe, HiCog, HiSearch
} from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logoutUser } from '../../core/services/authService';
import { db } from '../../core/firebase/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getInitials } from '../../core/utils/formatters';
import SocialEarningsCard from '../../components/cards/SocialEarningsCard';

const JobFinderDashboard = () => {
  const [activePanel, setActivePanel] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { userData, user } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const { currency, toggleCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(query(collection(db, 'applications'), where('applicantId', '==', user.uid)), (snap) => {
      setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const navSections = [
    {
      title: 'Career Portal',
      items: [
        { key: 'overview', label: 'Dashboard', icon: HiHome },
        { key: 'my-applications', label: 'My Applications', icon: HiDocumentText },
        { key: 'saved-jobs', label: 'Saved Jobs', icon: HiStar },
        { key: 'referrals', label: 'Referrals', icon: HiLink },
      ]
    },
    {
      title: 'My Profile',
      items: [
        { key: 'resume', label: 'My Resume/CV', icon: HiBriefcase },
        { key: 'messages', label: 'Messages', icon: HiMail },
      ]
    }
  ];

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-8 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl rotate-3 transform transition-transform group-hover:rotate-0">
            <span className="text-blue-700 font-black text-xl">SV</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-white">Career</h1>
            <p className="text-[10px] font-black text-blue-200 tracking-widest mt-1 uppercase">Job Finder Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 overflow-y-auto dark-scroll">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-12' : ''}>
            <h3 className="px-5 text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-4 opacity-50">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => { setActivePanel(item.key); onNavClick?.(); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-sm tracking-tight ${
                    activePanel === item.key
                      ? 'bg-white/20 text-white shadow-xl border border-white/20 backdrop-blur-md'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform ${activePanel === item.key ? 'scale-110' : ''}`} />
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
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-rose-900/40 hover:bg-rose-600 transition-all active:scale-95 group mb-6"
        >
          <HiLogout className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>

        <div className="p-2 bg-white/10 rounded-2xl border border-white/20 flex items-center gap-4 pr-6">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-700 font-black shadow-lg shadow-blue-900/20">
            {getInitials(userData?.name)}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-black text-white leading-none truncate max-w-[100px]">{userData?.name || 'Candidate'}</p>
            <p className="text-[9px] font-black text-blue-200 tracking-wider mt-1 opacity-60 uppercase">Active Finder</p>
          </div>
        </div>
      </div>
    </div>
  );

  const getPanelLabel = () => {
    return navSections.flatMap(s => s.items).find(i => i.key === activePanel)?.label || 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] dark:bg-[#080b18] overflow-x-hidden font-sans pb-20 lg:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-blue-700 text-white shadow-[10px_0_40px_rgba(0,0,0,0.1)] sticky top-0 h-screen overflow-hidden z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-[300px] bg-blue-700 text-white shadow-2xl transition-all duration-300 animate-in slide-in-from-left">
            <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-6 -right-12 w-10 h-10 flex items-center justify-center rounded-xl text-white bg-blue-600 shadow-xl z-50">
              <HiX className="w-6 h-6" />
            </button>
            <SidebarContent onNavClick={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-[#f8fbff] dark:bg-[#080b18]">
        {/* Top Navbar */}
        <header className="h-24 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 shadow-2xl shadow-blue-900/10 border-b border-white/10">
          <div className="flex items-center gap-6 flex-1">
             <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-3 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all border border-white/10">
                <HiMenu className="w-6 h-6" />
             </button>
             <div className="hidden md:block">
                <h2 className="text-2xl font-black text-white tracking-tighter leading-none  uppercase">{getPanelLabel()}</h2>
             </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
             <button onClick={() => navigate('/jobs')} className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">
                <HiOfficeBuilding className="w-4 h-4" /> Finalize Search
             </button>

             <div className="hidden sm:flex items-center gap-2 p-1 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
               <button onClick={toggleLanguage} className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all group relative">
                 <HiTranslate className="w-5 h-5" />
                 <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-500 rounded-full text-[8px] font-black flex items-center justify-center border border-white shadow-lg">{lang}</span>
               </button>
               <button onClick={toggleCurrency} className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all">
                 <HiCurrencyDollar className="w-5 h-5" />
               </button>
               <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white/20 text-white shadow-inner transition-all hover:bg-white/30">
                 {theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
               </button>
            </div>

            <div className="flex items-center gap-3 p-1.5 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
               <div className="hidden lg:block text-right pl-3 pr-1">
                  <p className="text-xs font-black text-white leading-none truncate max-w-[120px]">{userData?.name || 'Candidate'}</p>
                  <p className="text-[9px] font-black text-blue-200 tracking-wider mt-1.5 opacity-70  uppercase">Active Finder</p>
               </div>
               <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-blue-700 font-black shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  {getInitials(userData?.name)}
               </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-10 transition-all overflow-y-auto">
          {activePanel === 'overview' && (
            <div className="space-y-10 animate-in fade-in duration-700">
               <div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 uppercase">Career Dashboard</h3>
                  <p className="text-[10px] font-black text-slate-500 dark:text-white/40 tracking-[0.3em] uppercase">Status Level 2</p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="My Applications" val={applications.length} icon={HiDocumentText} color="from-blue-600 to-indigo-700" />
                  <StatCard label="Interviews" val={applications.filter(a => a.status === 'accepted').length} icon={HiCheckCircle} color="from-emerald-500 to-teal-600" />
                  <StatCard label="Followers" val={userData?.followersCount || 0} icon={HiGlobe} color="from-blue-600 to-indigo-800" />
                  <StatCard label="Wallet" val={`${userData?.walletBalance || 0} Br`} icon={HiLink} color="from-purple-600 to-indigo-700" />
               </div>

               {/* Recent Applications List */}
               <div className="bg-white dark:bg-white/5 rounded-[3rem] p-10 border border-slate-100 dark:border-white/10 shadow-sm">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 flex items-center gap-3 decoration-blue-600 decoration-4">
                    <HiBriefcase className="text-blue-600" /> Recent Application Logs
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-white/10">
                          <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Job Title</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Company</th>
                          <th className="text-center py-6 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map(app => (
                          <tr key={app.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                            <td className="py-6 px-4 font-black text-slate-900 dark:text-white text-sm">{app.jobTitle || 'Unknown Job'}</td>
                            <td className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SVTech Network</td>
                            <td className="py-6 px-4 text-center">
                              <span className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                app.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              }`}>
                                {app.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {applications.length === 0 && (
                    <div className="text-center py-24">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                         <HiBriefcase className="w-10 h-10 text-slate-200 dark:text-white/20" />
                      </div>
                      <p className="text-lg font-black text-slate-400 dark:text-white/40 uppercase tracking-widest mb-8">No active applications detected.</p>
                      <button onClick={() => navigate('/jobs')} className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all">
                        Search Jobs
                      </button>
                    </div>
                  )}
               </div>

            {/* Social Media Daily Earnings */}
            <SocialEarningsCard userId={user?.uid} />
            </div>
          )}
          {activePanel !== 'overview' && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">
                   <HiCog className="w-12 h-12 text-slate-300 dark:text-white/20" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">{activePanel.replace('-', ' ')}</h3>
                <p className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">System implementation in progress...</p>
             </div>
          )}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/80 dark:bg-[#0e1225]/80 backdrop-blur-xl border border-slate-100 dark:border-white/10 px-6 py-3 rounded-2xl flex items-center justify-between shadow-2xl">
           <MobileNavItem active={activePanel === 'overview'} icon={HiHome} onClick={() => setActivePanel('overview')} />
           <MobileNavItem active={activePanel === 'my-applications'} icon={HiDocumentText} onClick={() => setActivePanel('my-applications')} />
           <button 
             onClick={() => setMobileSidebarOpen(true)}
             className="w-14 h-14 -mt-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-2xl border-4 border-white dark:border-[#0e1225]"
           >
             <HiMenu className="w-7 h-7" />
           </button>
           <MobileNavItem active={activePanel === 'resume'} icon={HiBriefcase} onClick={() => setActivePanel('resume')} />
           <MobileNavItem active={activePanel === 'messages'} icon={HiMail} onClick={() => setActivePanel('messages')} />
        </nav>
      </div>
    </div>
  );
};

const StatCard = ({ label, val, icon: Icon, color }) => (
  <div className={`bg-gradient-to-br ${color} p-8 rounded-[2.5rem] text-white relative overflow-hidden group border border-white/10 shadow-xl`}>
     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
        <Icon className="w-24 h-24" />
     </div>
     <div className="relative z-10">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20">
           <Icon className="w-6 h-6" />
        </div>
        <h4 className="text-4xl font-black tracking-tighter leading-none mb-1">{val}</h4>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{label}</p>
     </div>
  </div>
);

const MobileNavItem = ({ active, icon: Icon, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 dark:text-white/40'}`}
  >
    <Icon className="w-6 h-6" />
  </button>
);

export default JobFinderDashboard;
