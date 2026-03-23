import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiHome, HiOfficeBuilding, HiBriefcase, HiUserGroup, HiLogout, HiMenu, HiX, 
  HiPlus, HiClipboardList, HiTranslate, HiCurrencyDollar, HiMoon, HiSun, 
  HiGlobe, HiCog, HiLink, HiCheckCircle, HiClock, HiMail
} from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { logoutUser } from '../../core/services/authService';
import { getInitials } from '../../core/utils/formatters';
import { db } from '../../core/firebase/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import SocialEarningsCard from '../../components/cards/SocialEarningsCard';

const EmployerDashboard = () => {
  const [activePanel, setActivePanel] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { userData, user } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const { currency, toggleCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsubJobs = onSnapshot(query(collection(db, 'jobs'), where('employerId', '==', user.uid)), (snap) => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubApps = onSnapshot(query(collection(db, 'applications'), where('employerId', '==', user.uid)), (snap) => {
      setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubJobs(); unsubApps(); };
  }, [user]);

  const navSections = [
    {
      title: 'Employer Hub',
      items: [
        { key: 'overview', label: 'Dashboard', icon: HiHome },
        { key: 'my-jobs', label: 'My Job Posts', icon: HiBriefcase },
        { key: 'applications', label: 'Applications', icon: HiClipboardList },
        { key: 'referrals', label: 'Referrals', icon: HiLink },
      ]
    },
    {
      title: 'Manage',
      items: [
        { key: 'candidates', label: 'Candidates', icon: HiUserGroup },
        { key: 'messages', label: 'Messages', icon: HiMail },
      ]
    }
  ];

  const getPanelLabel = () => navSections.flatMap(s => s.items).find(i => i.key === activePanel)?.label || 'Dashboard';

  const handleLogout = async () => { await logoutUser(); navigate('/'); };

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-8 flex items-center gap-4 border-b border-white/10 shrink-0">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
          <span className="text-cyan-700 font-black text-xl">SV</span>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight leading-none text-white">Employer</h1>
          <p className="text-[10px] font-black text-cyan-200 tracking-widest mt-1 uppercase">Hiring Portal</p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-8 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-10' : ''}>
            <h3 className="px-5 text-[10px] font-black text-cyan-100 uppercase tracking-[0.2em] mb-4 opacity-50">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map(item => (
                <button key={item.key} onClick={() => { setActivePanel(item.key); onNavClick?.(); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-sm tracking-tight ${
                    activePanel === item.key ? 'bg-white/20 text-white shadow-xl border border-white/20' : 'text-cyan-100 hover:bg-white/10 hover:text-white'
                  }`}>
                  <item.icon className={`w-5 h-5 ${activePanel === item.key ? 'scale-110' : ''}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-6 mt-auto border-t border-white/10 shrink-0">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs tracking-widest shadow-xl hover:bg-rose-600 transition-all active:scale-95 group mb-6">
          <HiLogout className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Sign Out
        </button>
        <div className="p-2 bg-white/10 rounded-2xl border border-white/20 flex items-center gap-4 pr-6">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-cyan-700 font-black shadow-lg">{getInitials(userData?.name)}</div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-black text-white leading-none truncate max-w-[100px]">{userData?.name || 'Employer'}</p>
            <p className="text-[9px] font-black text-cyan-200 tracking-wider mt-1 opacity-60 uppercase">Verified Hirer</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] dark:bg-[#080b18] overflow-x-hidden font-sans pb-20 lg:pb-0">
      <aside className="hidden lg:flex flex-col w-72 bg-gradient-to-b from-cyan-700 to-blue-900 text-white shadow-2xl sticky top-0 h-screen overflow-hidden z-30">
        <SidebarContent />
      </aside>
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex animate-in fade-in duration-300">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-[300px] bg-gradient-to-b from-cyan-700 to-blue-900 text-white shadow-2xl animate-in slide-in-from-left">
            <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-6 -right-12 w-10 h-10 flex items-center justify-center rounded-xl text-white bg-cyan-600 shadow-xl z-50">
              <HiX className="w-6 h-6" />
            </button>
            <SidebarContent onNavClick={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col relative min-w-0">
        <header className="h-24 bg-gradient-to-r from-cyan-700 to-blue-900 text-white flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 shadow-2xl border-b border-white/10">
          <div className="flex items-center gap-6 flex-1">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-3 bg-white/10 rounded-2xl text-white"><HiMenu className="w-6 h-6" /></button>
            <h2 className="hidden md:block text-2xl font-black text-white tracking-tighter uppercase">{getPanelLabel()}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/jobs')} className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
              <HiPlus className="w-4 h-4" /> Post New Job
            </button>
            <div className="hidden sm:flex items-center gap-2 p-1 bg-white/10 rounded-2xl border border-white/20">
              <button onClick={toggleLanguage} className="p-2.5 rounded-xl hover:bg-white/20 text-white relative">
                <HiTranslate className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-cyan-500 rounded-full text-[8px] font-black border border-white">{lang}</span>
              </button>
              <button onClick={toggleCurrency} className="p-2.5 rounded-xl hover:bg-white/20 text-white"><HiCurrencyDollar className="w-5 h-5" /></button>
              <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white/20 text-white">{theme === 'dark' ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}</button>
            </div>
            <div className="flex items-center gap-3 p-1.5 bg-white/10 rounded-2xl border border-white/20 cursor-pointer group">
              <div className="hidden lg:block text-right pl-3 pr-1">
                <p className="text-xs font-black text-white leading-none truncate max-w-[120px]">{userData?.name || 'Employer'}</p>
                <p className="text-[9px] font-black text-cyan-200 tracking-wider mt-1.5 opacity-70 uppercase">Hiring Manager</p>
              </div>
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-cyan-700 font-black shadow-lg group-hover:scale-105 transition-transform">{getInitials(userData?.name)}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-10 overflow-y-auto bg-[#f8fbff] dark:bg-[#080b18]">
          {activePanel === 'overview' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 uppercase">Employer Dashboard</h3>
                <p className="text-[10px] font-black text-slate-500 dark:text-white/40 tracking-[0.3em] uppercase">Hiring Command Center</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Job Posts" val={jobs.length} icon={HiBriefcase} color="from-cyan-500 to-blue-700" />
                <StatCard label="Applications" val={applications.length} icon={HiClipboardList} color="from-emerald-500 to-teal-600" />
                <StatCard label="Accepted" val={applications.filter(a => a.status === 'accepted').length} icon={HiCheckCircle} color="from-amber-500 to-orange-600" />
                <StatCard label="Followers" val={userData?.followersCount || 0} icon={HiUserGroup} color="from-purple-600 to-indigo-700" />
              </div>
              <div className="bg-white dark:bg-white/5 rounded-[3rem] p-10 border border-slate-100 dark:border-white/10 shadow-sm">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 flex items-center gap-3">
                  <HiOfficeBuilding className="text-cyan-600" /> Recent Job Posts
                </h4>
                {jobs.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                      <HiBriefcase className="w-10 h-10 text-slate-200 dark:text-white/20" />
                    </div>
                    <p className="text-lg font-black text-slate-400 uppercase tracking-widest mb-8">No job posts yet</p>
                    <button onClick={() => navigate('/jobs')} className="px-10 py-4 bg-cyan-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-cyan-700 transition-all">Post a Job</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-white/10">
                          <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Title</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                          <th className="text-center py-6 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.slice(0, 5).map(job => (
                          <tr key={job.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                            <td className="py-6 px-4 font-black text-slate-900 dark:text-white text-sm">{job.title || 'Untitled'}</td>
                            <td className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.type || 'Full-Time'}</td>
                            <td className="py-6 px-4 text-center">
                              <span className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                job.status === 'open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                              }`}>{job.status || 'Open'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Social Media Daily Earnings */}
              <div className="mt-10">
                <SocialEarningsCard userId={user?.uid} />
              </div>
            </div>
          )}
          {activePanel !== 'overview' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">
                <HiCog className="w-12 h-12 text-slate-300 dark:text-white/20" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">{activePanel.replace(/-/g, ' ')}</h3>
              <p className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Coming soon...</p>
            </div>
          )}
        </main>
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/80 dark:bg-[#0e1225]/80 backdrop-blur-xl border border-slate-100 dark:border-white/10 px-6 py-3 rounded-2xl flex items-center justify-between shadow-2xl">
          <MobileNavItem active={activePanel === 'overview'} icon={HiHome} onClick={() => setActivePanel('overview')} />
          <MobileNavItem active={activePanel === 'my-jobs'} icon={HiBriefcase} onClick={() => setActivePanel('my-jobs')} />
          <button onClick={() => setMobileSidebarOpen(true)} className="w-14 h-14 -mt-10 bg-gradient-to-br from-cyan-600 to-blue-800 rounded-2xl flex items-center justify-center text-white shadow-2xl border-4 border-white dark:border-[#0e1225]">
            <HiMenu className="w-7 h-7" />
          </button>
          <MobileNavItem active={activePanel === 'applications'} icon={HiClipboardList} onClick={() => setActivePanel('applications')} />
          <MobileNavItem active={activePanel === 'messages'} icon={HiMail} onClick={() => setActivePanel('messages')} />
        </nav>
      </div>
    </div>
  );
};

const StatCard = ({ label, val, icon: Icon, color }) => (
  <div className={`bg-gradient-to-br ${color} p-8 rounded-[2.5rem] text-white relative overflow-hidden group border border-white/10 shadow-xl`}>
    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000"><Icon className="w-24 h-24" /></div>
    <div className="relative z-10">
      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20"><Icon className="w-6 h-6" /></div>
      <h4 className="text-4xl font-black tracking-tighter leading-none mb-1">{val}</h4>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{label}</p>
    </div>
  </div>
);

const MobileNavItem = ({ active, icon: Icon, onClick }) => (
  <button onClick={onClick} className={`p-3 rounded-xl transition-all ${active ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 dark:text-white/40'}`}>
    <Icon className="w-6 h-6" />
  </button>
);

export default EmployerDashboard;
