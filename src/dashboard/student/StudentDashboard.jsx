import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiHome, HiBookOpen, HiCurrencyDollar, HiMail, HiLogout, HiMenu, HiX, HiAcademicCap, HiPlay, HiCheckCircle, HiVideoCamera, HiUserGroup, HiLink, HiShare, HiClipboardCopy, HiUser } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { logoutUser } from '../../core/services/authService';
import { db } from '../../core/firebase/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getInitials } from '../../core/utils/formatters';

import { courseService } from '../../core/services/firestoreService';
import CourseCard from '../../components/cards/CourseCard';

const StudentDashboard = () => {
  const [activePanel, setActivePanel] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { userData, user } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [suggestedCourses, setSuggestedCourses] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(query(collection(db, 'enrollments'), where('studentId', '==', user.uid)), (snap) => {
      setEnrollments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    // Suggested courses from admin
    const unsubCourses = courseService.subscribe((data) => {
       setSuggestedCourses(data.slice(0, 3));
    });

    return () => {
      unsub();
      unsubCourses();
    };
  }, [user]);

  const navSections = [
    {
      items: [
        { key: 'overview', label: 'Overview', icon: HiHome },
        { key: 'my-courses', label: 'My Courses', icon: HiBookOpen },
        { key: 'certificates', label: 'Certificates', icon: HiAcademicCap },
      ]
    },
    {
      title: 'COMMUNITY & SUPPORT',
      items: [
        { key: 'messages', label: 'Messages', icon: HiMail },
        { key: 'payments', label: 'Payment History', icon: HiCurrencyDollar },
      ]
    }
  ];

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full bg-[#0e1225]" style={{ background: 'linear-gradient(180deg, #0e1225 0%, #151a33 50%, #0e1225 100%)' }}>
      <div className="p-4 pb-3 flex items-center gap-3 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <span className="text-white font-black text-xs">SV</span>
        </div>
        <div>
          <h1 className="text-sm font-black text-white tracking-tight">Student Portal</h1>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto w-[240px]">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-5' : ''}>
            {section.title && (
              <p className="px-3 mb-1.5 text-[10px] font-black text-blue-300/60 uppercase tracking-[0.2em]">{section.title}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => { setActivePanel(item.key); onNavClick?.(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    activePanel === item.key ? 'bg-blue-500/20 text-white border border-blue-400/20 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${activePanel === item.key ? 'text-blue-400' : ''}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-[9px] font-bold">
            {getInitials(userData?.name)}
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold text-white truncate">{userData?.name}</p>
            <p className="text-[9px] text-slate-500 truncate">Student</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors" title="Sign Out">
          <HiLogout className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-80px)] mt-20 bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] flex-col flex-shrink-0 sticky top-20 h-[calc(100vh-80px)] border-r border-slate-200">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-64 flex flex-col shadow-2xl">
            <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-white z-10">
              <HiX className="w-5 h-5" />
            </button>
            <SidebarContent onNavClick={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile Sidebar Floating Action Button (FAB) */}
      <button 
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl active:scale-90 transition-all"
      >
        <HiMenu className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-20 h-14 bg-white border-b border-slate-100 px-4 lg:px-6 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <HiMenu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-800 capitalize">{activePanel.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/courses')} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors">
               <HiBookOpen className="w-4 h-4" /> Browse Catalog
             </button>
          </div>
        </header>

        {/* Panel Container */}
        <main className="flex-1 p-4 lg:p-6 bg-slate-50">
          {activePanel === 'overview' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
                    Welcome back, <span className="text-blue-700">{userData?.name?.split(' ')[0]}</span>!
                  </h3>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Digital Technician Status: <span className="text-emerald-500">Active</span></p>
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={() => navigate('/profile')} className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                     <HiUser className="w-4 h-4 text-blue-600" /> Edit Bio
                   </button>
                   <button onClick={() => navigate('/courses')} className="px-5 py-2.5 rounded-xl bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center gap-2 shadow-xl shadow-blue-700/20">
                     <HiBookOpen className="w-4 h-4" /> Browse Academy
                   </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Academy Courses', val: enrollments.length, icon: HiPlay, color: 'from-blue-600 to-indigo-700' },
                  { label: 'Credentials', val: '0', icon: HiAcademicCap, iconColor: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: 'Tech Network', val: '124', icon: HiUserGroup, iconColor: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Referral Credits', val: '12', icon: HiLink, iconColor: 'text-purple-500', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                  <div key={i} className={`rounded-3xl p-6 ${stat.color ? `bg-gradient-to-br ${stat.color} text-white shadow-2xl shadow-blue-600/20` : `${stat.bg} border border-slate-100 shadow-sm`}`}>
                    <div className={`w-10 h-10 rounded-xl ${stat.color ? 'bg-white/20' : 'bg-white'} flex items-center justify-center mb-4 shadow-sm`}>
                      <stat.icon className={`w-5 h-5 ${stat.color ? 'text-white' : stat.iconColor}`} />
                    </div>
                    <p className="text-3xl font-black italic">{stat.val}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${stat.color ? 'text-blue-100/70' : 'text-slate-400'}`}>{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Learning Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Syncing Progress</h4>
                    <span className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">View All</span>
                  </div>
                  
                  {enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {enrollments.map(e => (
                         <div key={e.id} className="bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-2xl hover:scale-[1.02] transition-all group cursor-pointer relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors" />
                           <div className="relative z-10">
                             <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-500">
                                   <HiVideoCamera className="w-6 h-6 text-slate-400 group-hover:text-white" />
                                </div>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black rounded-lg uppercase">Core Node</span>
                             </div>
                             <h5 className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-700 transition-colors">{e.courseTitle || 'Tech Module'}</h5>
                             <div className="mt-6">
                               <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
                                 <span>Protocol Completion</span>
                                 <span className="text-blue-600">35%</span>
                               </div>
                               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: '35%' }}
                                   className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full shadow-lg shadow-blue-500/30" 
                                 />
                               </div>
                             </div>
                           </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <HiBookOpen className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 mb-6">Technician has zero active learning protocols.</p>
                      <button onClick={() => navigate('/courses')} className="px-8 py-3 bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-700/20 hover:scale-105 active:scale-95 transition-all">
                        Initialize Training
                      </button>
                    </div>
                  )}
                </div>

                {/* Sidebar Column: Referral HUD */}
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-indigo-700 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-cyan-400/10 transition-colors" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20">
                        <HiShare className="w-6 h-6 text-cyan-400 text-2xl" />
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight italic">Terminal Referral</h4>
                      <p className="text-[11px] text-blue-100/60 font-bold mt-2 leading-relaxed uppercase tracking-wider">
                        Expand the SVTECH network and unlock premium hardware credits.
                      </p>
                      
                      <div className="mt-8 space-y-4">
                         <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                            <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Your Protocol Link</p>
                            <p className="text-[10px] font-mono font-bold truncate opacity-80">{window.location.origin}/reg?ref={user?.uid}</p>
                         </div>
                         <button 
                           onClick={() => {
                             navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user?.uid}`);
                             toast.info('Referral protocol copied back to terminal!');
                           }}
                           className="w-full py-4 rounded-2xl bg-white text-indigo-950 font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-cyan-400 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                         >
                           <HiClipboardCopy className="text-sm" /> Copy Link
                         </button>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Modules */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <HiChartBar className="text-blue-600" /> Featured Training
                    </h4>
                    <div className="space-y-4">
                      {suggestedCourses.map(c => (
                        <div key={c.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                             SV
                           </div>
                           <div className="flex-1 overflow-hidden">
                             <h6 className="text-[13px] font-black text-slate-800 truncate leading-none uppercase tracking-tight">{c.title}</h6>
                             <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Premium Module</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activePanel !== 'overview' && (
             <div className="flex items-center justify-center h-full text-center">
               <div>
                  <h3 className="text-xl font-bold text-slate-900">{activePanel.replace('-', ' ')}</h3>
                  <p className="text-sm text-slate-500 mt-2">This section is being built.</p>
               </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
