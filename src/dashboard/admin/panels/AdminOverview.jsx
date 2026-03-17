import React from 'react';
import { HiUsers, HiAcademicCap, HiBriefcase, HiNewspaper, HiDocumentText, HiCash, HiTrendingUp, HiShoppingCart, HiSwitchHorizontal } from 'react-icons/hi';
import { ROLES, ROLE_LABELS } from '../../../core/utils/constants';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';

const AdminOverview = ({ users, courses, jobs, posts, applications }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const students = users.filter(u => u.role === ROLES.STUDENT).length;
  const teachers = users.filter(u => u.role === ROLES.TRAINER).length;
  const jobFinders = users.filter(u => u.role === ROLES.JOB_FINDER).length;
  const customers = users.filter(u => u.role === ROLES.CUSTOMER).length;
  const sellers = users.filter(u => u.role === ROLES.SELLER).length;
  const openJobs = jobs.filter(j => j.status === 'open').length;
  const publishedPosts = posts.filter(p => p.status === 'published').length;

  // Role distribution for pie chart simulation
  const roleData = [
    { label: 'Students', count: students, color: '#3b82f6', pct: users.length ? (students / users.length * 100) : 0 },
    { label: 'Teachers', count: teachers, color: '#8b5cf6', pct: users.length ? (teachers / users.length * 100) : 0 },
    { label: 'Buyers', count: customers, color: '#10b981', pct: users.length ? (customers / users.length * 100) : 0 },
    { label: 'Sellers', count: sellers, color: '#f59e0b', pct: users.length ? (sellers / users.length * 100) : 0 },
    { label: 'Job Finders', count: jobFinders, color: '#ec4899', pct: users.length ? (jobFinders / users.length * 100) : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight">{t('overview') || 'Overview'}</h3>
          <p className="text-sm font-black text-blue-600/50 dark:text-indigo-400/50 mt-1 uppercase tracking-widest">{t('platform_intelligence')}</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-100/50 dark:bg-white/5 p-1 rounded-2xl border border-blue-200/50 dark:border-white/5">
           <button className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 shadow-sm text-[11px] font-black text-blue-900 dark:text-white uppercase tracking-wider">Today</button>
           <button className="px-4 py-2 rounded-xl text-[11px] font-black text-blue-600/60 dark:text-slate-400 uppercase tracking-wider hover:text-blue-600 dark:hover:text-white transition-colors">Week</button>
           <button className="px-4 py-2 rounded-xl text-[11px] font-black text-blue-600/60 dark:text-slate-400 uppercase tracking-wider hover:text-blue-600 dark:hover:text-white transition-colors">Month</button>
        </div>
      </div>

      {/* Main Stat Cards - Advanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Row 1: Core Platform Stats */}
        <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 rounded-[2.5rem] p-7 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors" />
          <div className="flex items-center justify-between mb-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <HiUsers className="w-6 h-6 text-blue-100" />
            </div>
            <HiTrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-black tracking-tighter leading-none mb-2">{users.length.toLocaleString()}</p>
          <p className="text-[11px] font-black text-blue-200/60 uppercase tracking-[0.2em]">{t('totalUsers')}</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-[2.5rem] p-7 text-white shadow-xl shadow-cyan-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors" />
          <div className="flex items-center justify-between mb-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <HiAcademicCap className="w-6 h-6 text-blue-100" />
            </div>
            <span className="px-3 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-widest border border-white/20">{courses.length} courses</span>
          </div>
          <p className="text-4xl font-black tracking-tighter leading-none mb-2">{courses.filter(c => c.status !== 'unpublished').length}</p>
          <p className="text-[11px] font-black text-blue-100/60 uppercase tracking-[0.2em]">{t('activeCourses')}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 rounded-[2.5rem] p-7 text-white shadow-xl shadow-amber-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors" />
          <div className="flex items-center justify-between mb-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <HiBriefcase className="w-6 h-6 text-amber-100" />
            </div>
            <span className="px-3 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-widest border border-white/20">{openJobs} active</span>
          </div>
          <p className="text-4xl font-black tracking-tighter leading-none mb-2">{jobs.length}</p>
          <p className="text-[11px] font-black text-amber-100/60 uppercase tracking-[0.2em]">{t('activeJobs')}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-[2.5rem] p-7 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors" />
          <div className="flex items-center justify-between mb-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <HiNewspaper className="w-6 h-6 text-emerald-100" />
            </div>
            <span className="px-3 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-widest border border-white/20">{publishedPosts} live</span>
          </div>
          <p className="text-4xl font-black tracking-tighter leading-none mb-2">{posts.length}</p>
          <p className="text-[11px] font-black text-emerald-100/60 uppercase tracking-[0.2em]">{t('blogPosts')}</p>
        </div>

        {/* Row 2: Demographic Breakdown - Upgraded to Premium Gradients */}
        <div className="bg-gradient-to-br from-violet-600 via-indigo-700 to-indigo-900 rounded-[2.5rem] p-7 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors" />
          <div className="flex items-center justify-between mb-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <HiAcademicCap className="w-6 h-6 text-indigo-100" />
            </div>
            <span className="text-[10px] font-black text-indigo-200/60 uppercase tracking-widest">{users.length ? Math.round((students/users.length)*100) : 0}% share</span>
          </div>
          <p className="text-4xl font-black tracking-tighter leading-none mb-2">{students.toLocaleString()}</p>
          <p className="text-[11px] font-black text-indigo-100/60 uppercase tracking-[0.2em]">{t('students')}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 via-fuchsia-700 to-fuchsia-900 rounded-[2.5rem] p-7 text-white shadow-xl shadow-purple-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors" />
          <div className="flex items-center justify-between mb-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <HiUsers className="w-6 h-6 text-purple-100" />
            </div>
            <span className="text-[10px] font-black text-purple-200/60 uppercase tracking-widest">{users.length ? Math.round((teachers/users.length)*100) : 0}% share</span>
          </div>
          <p className="text-4xl font-black tracking-tighter leading-none mb-2">{teachers.toLocaleString()}</p>
          <p className="text-[11px] font-black text-purple-100/60 uppercase tracking-[0.2em]">{t('teachers')}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-teal-900 rounded-[2.5rem] p-7 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors" />
          <div className="flex items-center justify-between mb-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <HiShoppingCart className="w-6 h-6 text-emerald-100" />
            </div>
            <span className="text-[10px] font-black text-emerald-200/60 uppercase tracking-widest">{users.length ? Math.round((customers/users.length)*100) : 0}% share</span>
          </div>
          <p className="text-4xl font-black tracking-tighter leading-none mb-2">{customers.toLocaleString()}</p>
          <p className="text-[11px] font-black text-emerald-100/60 uppercase tracking-[0.2em]">{t('buyers')}</p>
        </div>

        <div className="bg-gradient-to-br from-rose-600 via-pink-700 to-pink-900 rounded-[2.5rem] p-7 text-white shadow-xl shadow-rose-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors" />
          <div className="flex items-center justify-between mb-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <HiSwitchHorizontal className="w-6 h-6 text-rose-100" />
            </div>
            <span className="text-[10px] font-black text-rose-200/60 uppercase tracking-widest">{users.length ? Math.round((sellers/users.length)*100) : 0}% share</span>
          </div>
          <p className="text-4xl font-black tracking-tighter leading-none mb-2">{sellers.toLocaleString()}</p>
          <p className="text-[11px] font-black text-rose-100/60 uppercase tracking-[0.2em]">{t('sellers')}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Distribution — Pie Chart */}
        <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-50 dark:border-white/5 p-8 shadow-xl shadow-blue-900/5 transition-colors">
          <h4 className="text-lg font-black text-blue-900 dark:text-white mb-8 tracking-tight uppercase tracking-widest">{t('user_demographics')}</h4>
          <div className="flex flex-col sm:flex-row items-center gap-10">
            {/* CSS Pie Chart */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 filter drop-shadow-xl">
                {roleData.reduce((acc, role, i) => {
                  const offset = acc.offset;
                  const dashArray = `${role.pct} ${100 - role.pct}`;
                  acc.elements.push(
                    <circle
                      key={i}
                      cx="50" cy="50" r="40"
                      fill="transparent"
                      stroke={role.color}
                      strokeWidth="15"
                      strokeDasharray={dashArray}
                      strokeDashoffset={-offset}
                      className="transition-all duration-1000 ease-in-out hover:stroke-white cursor-pointer"
                    />
                  );
                  acc.offset += role.pct;
                  return acc;
                }, { elements: [], offset: 0 }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-black text-blue-900 dark:text-white leading-none">{users.length}</p>
                  <p className="text-[10px] text-blue-600/50 dark:text-indigo-400/50 font-black uppercase tracking-widest mt-1">Total</p>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-1 gap-4 w-full">
              {roleData.map((role, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 dark:bg-white/5 border border-blue-100 dark:border-white/5 group hover:bg-white dark:hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ background: role.color }} />
                    <span className="text-sm font-black text-blue-900/70 dark:text-slate-200/70 group-hover:text-blue-900 dark:group-hover:text-white">{t(role.label.toLowerCase())}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-blue-900 dark:text-white">{role.count}</span>
                    <span className="text-[10px] font-black text-blue-600/40 dark:text-indigo-400/40">({role.pct.toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Growth — Bar Chart */}
        <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-50 dark:border-white/5 p-8 shadow-xl shadow-blue-900/5 transition-colors">
          <h4 className="text-lg font-black text-blue-900 dark:text-white mb-8 tracking-tight uppercase tracking-widest">{t('growth_metrics')}</h4>
          <div className="flex items-end gap-3 h-48 mb-8 px-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [30, 50, 75, 45, 85, 60];
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full relative flex flex-col justify-end h-full">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-900 dark:bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg z-10">
                      {Math.round(heights[i] * 1.5)}%
                    </div>
                    <div
                      className="w-full rounded-2xl bg-gradient-to-t from-blue-700 to-indigo-500 shadow-lg shadow-blue-600/10 group-hover:scale-y-105 transition-all duration-500 origin-bottom"
                      style={{ height: `${heights[i]}%`, minHeight: '12px' }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-blue-900/40 dark:text-slate-400/40 group-hover:text-blue-900 dark:group-hover:text-white uppercase tracking-tighter">{month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 mt-auto pt-6 border-t border-blue-50 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-lg shadow-blue-600/20" />
              <span className="text-[11px] font-black text-blue-900/60 dark:text-slate-400/60 uppercase tracking-widest">Platform Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/20" />
              <span className="text-[11px] font-black text-amber-900/60 dark:text-slate-400/60 uppercase tracking-widest">Revenue Impact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Status Overview */}
        <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-50 dark:border-white/5 p-8 shadow-xl shadow-blue-900/5 transition-colors">
          <h4 className="text-lg font-black text-blue-900 dark:text-white mb-6 tracking-tight uppercase tracking-widest">{t('job_metrics')}</h4>
          <div className="space-y-4">
            {[
              { status: 'Open', count: jobs.filter(j => j.status === 'open').length, color: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
              { status: 'Closed', count: jobs.filter(j => j.status === 'closed').length, color: 'bg-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-400' },
              { status: 'Paused', count: jobs.filter(j => j.status === 'paused').length, color: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/30 dark:bg-white/5 border border-blue-100/50 dark:border-white/5">
                <span className={`w-3 h-3 rounded-full ${item.color} shadow-lg shadow-black/20`} />
                <span className="flex-1 text-sm font-black text-blue-900/70 dark:text-slate-300/70 uppercase tracking-wide">{item.status}</span>
                <span className={`px-4 py-1.5 rounded-xl text-xs font-black ${item.bg} ${item.text} border border-white/10 shadow-sm`}>{item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-blue-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                 <HiDocumentText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[11px] font-black text-blue-600/60 dark:text-indigo-400/60 uppercase tracking-widest">{applications.length} {t('total_applications')}</span>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-50 dark:border-white/5 p-8 shadow-xl shadow-blue-900/5 transition-colors">
          <h4 className="text-lg font-black text-blue-900 dark:text-white mb-6 tracking-tight uppercase tracking-widest">{t('recentUsers')}</h4>
          <div className="space-y-4">
            {users.slice(0, 6).map(u => (
              <div key={u.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                    {u.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-blue-900 dark:text-white tracking-tight line-clamp-1">{u.name || u.email}</p>
                    <p className="text-[10px] font-black text-blue-600/50 dark:text-indigo-400/50 uppercase tracking-widest">{ROLE_LABELS[u.role] || u.role}</p>
                  </div>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'suspended' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-emerald-500 shadow-emerald-500/50'} shadow-lg`} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-50 dark:border-white/5 p-8 shadow-xl shadow-blue-900/5 transition-colors">
          <h4 className="text-lg font-black text-blue-900 dark:text-white mb-6 tracking-tight uppercase tracking-widest">{t('recentPosts')}</h4>
          <div className="space-y-4">
            {posts.slice(0, 5).map(p => (
              <div key={p.id} className="p-4 rounded-2xl bg-blue-50/30 dark:bg-white/5 border border-blue-100/50 dark:border-white/5 hover:border-blue-300 dark:hover:border-white/20 transition-all group">
                <p className="text-sm font-black text-blue-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-wide">{p.title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-black text-blue-600/40 dark:text-indigo-400/40 uppercase tracking-[0.2em]">{p.category}</span>
                  <span className="w-1 h-1 rounded-full bg-blue-100 dark:bg-white/10" />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${p.status === 'published' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {p.status || 'published'}
                  </span>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="text-xs font-black text-blue-600/40 dark:text-indigo-400/40 uppercase tracking-widest text-center py-10">{t('no_data_found')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
