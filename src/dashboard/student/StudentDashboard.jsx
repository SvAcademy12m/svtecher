import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiHome, HiBookOpen, HiCurrencyDollar, HiMail, HiLogout, HiMenu, HiX, HiAcademicCap, HiPlay, HiCheckCircle, HiVideoCamera, HiUserGroup, HiUsers, HiLink } from 'react-icons/hi';
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] flex-col flex-shrink-0">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-100 px-4 lg:px-6 flex items-center justify-between flex-shrink-0">
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50">
          {activePanel === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900">Welcome back, {userData?.name?.split(' ')[0]}!</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-4 md:p-5 text-white shadow-lg">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                    <HiPlay className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black">{enrollments.length}</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-blue-100 uppercase tracking-wider mt-1">Courses</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 shadow-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                    <HiAcademicCap className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">0</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Certificates</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 shadow-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                    <HiUsers className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">124</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Followers</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 shadow-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                    <HiUserGroup className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">45</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Following</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 shadow-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                    <HiLink className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">12</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Referrals</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 shadow-sm relative overflow-hidden">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-3">
                    <HiCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-500" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">Level 3</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Network</p>
                  <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-50 rounded-tl-full -mr-4 -mb-4 opacity-50" />
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-bold text-slate-900 mb-4">Continue Learning</h4>
                {enrollments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {enrollments.map(e => (
                       <div key={e.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-lg transition-all group cursor-pointer">
                         <div className="h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-4 flex items-center justify-center">
                           <HiVideoCamera className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors" />
                         </div>
                         <h5 className="font-bold text-slate-900 text-sm">{e.courseTitle || 'Interactive Course'}</h5>
                         <div className="mt-3 flex items-center justify-between">
                           <div className="flex-1 mr-4">
                             <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-blue-500 h-full w-[20%]" />
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 mt-1">20% Complete</p>
                           </div>
                           <button className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             <HiPlay className="w-4 h-4 ml-0.5" />
                           </button>
                         </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <HiBookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500 mb-4">You haven't enrolled in any courses yet.</p>
                    <button onClick={() => navigate('/courses')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
                      Browse Courses
                    </button>
                  </div>
                )}
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
