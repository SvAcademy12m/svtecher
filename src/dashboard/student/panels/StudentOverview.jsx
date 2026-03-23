import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiPlay, HiAcademicCap, HiUserGroup, HiLink, HiClipboardCopy,
  HiClock, HiBookOpen, HiCurrencyDollar, HiGift, HiBadgeCheck,
  HiCheckCircle, HiChartBar, HiTrendingUp, HiShare, HiArrowRight,
  HiDownload, HiStar, HiLightningBolt
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { db } from '../../../core/firebase/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: 'easeOut' }
});

const StudentOverview = ({ userData, enrollments, suggestedCourses, user }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [recentActivity, setRecentActivity] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const certQ = query(collection(db, 'certificates'), where('studentId', '==', user.uid), limit(3));
    const unsubCert = onSnapshot(certQ, snap => setCertificates(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const txQ = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));
    const unsubTx = onSnapshot(txQ, snap => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const actQ = query(collection(db, 'user_social_tasks'), where('status', '==', 'verified'), orderBy('verifiedAt', 'desc'), limit(4));
    const unsubAct = onSnapshot(actQ, snap => setRecentActivity(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubCert(); unsubTx(); unsubAct(); };
  }, [user?.uid]);

  const walletBalance = userData?.walletBalance ?? 0;
  const commission = userData?.commissionBalance ?? 0;
  const referrals = userData?.referralsCount ?? 0;
  const rank = referrals >= 101 ? 'Ambassador' : referrals >= 51 ? 'Director' : referrals >= 21 ? 'Leader' : referrals >= 6 ? 'Builder' : 'Starter';

  const stats = [
    { label: 'Wallet Balance', value: `${walletBalance} Br`, icon: HiCurrencyDollar, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-900/30' },
    { label: 'Active Courses', value: enrollments.length, icon: HiBookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-900/30' },
    { label: 'Commissions', value: `${commission} Br`, icon: HiGift, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-900/30' },
    { label: 'Referrals', value: referrals, icon: HiUserGroup, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-900/30' },
    { label: 'Certificates', value: certificates.length, icon: HiAcademicCap, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-100 dark:border-rose-900/30' },
  ];

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-500">

      {/* HERO BANNER */}
      <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 p-10 md:p-14 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-cyan-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20 text-[10px] font-black text-cyan-300 uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Learning Access
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
              Welcome back,<br />
              <span className="text-cyan-400">{userData?.name?.split(' ')[0] || 'Student'}</span>
            </h2>
            <p className="mt-5 text-blue-200/70 font-bold uppercase tracking-[0.15em] text-xs leading-relaxed max-w-sm">
              Your personal learning matrix is active. Continue where you left off.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <span className="px-5 py-2 bg-white/10 text-white text-[10px] font-black rounded-xl border border-white/20 uppercase tracking-widest">
                Rank: <span className="text-cyan-300">{rank}</span>
              </span>
              <span className="px-5 py-2 bg-blue-500/20 text-cyan-300 text-[10px] font-black rounded-xl border border-blue-400/30 uppercase tracking-widest">
                {enrollments.length} Active Module{enrollments.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4 shrink-0">
            <button
              onClick={() => navigate('/courses')}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-blue-950 font-black text-xs uppercase tracking-widest shadow-2xl hover:shadow-white/30 hover:bg-cyan-50 transition-all active:scale-95"
            >
              <HiPlay className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              Browse Courses
            </button>
            <button
              onClick={() => navigate('/dashboard/student?panel=referrals')}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/10 text-white font-black text-xs uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all active:scale-95"
            >
              <HiShare className="w-5 h-5" />
              My Referral Link
            </button>
          </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((s, i) => (
          <motion.div key={i} {...fadeUp(i * 0.08)} className={`bg-white dark:bg-[#0e1225] border-2 ${s.border} rounded-3xl p-7 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden`}>
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className={`text-3xl font-black tracking-tighter text-slate-900 dark:text-white`}>{s.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-2">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* LEFT - My Courses */}
        <div className="xl:col-span-2 space-y-8">
          <motion.div {...fadeUp(0.15)}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.35em] flex items-center gap-2"><HiTrendingUp />Active Modules</h4>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-1">Enrolled Courses</h3>
              </div>
              <button
                onClick={() => navigate('/dashboard/student?panel=courses')}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-white/5 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                View All <HiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrollments.slice(0, 4).map((e, idx) => (
                  <motion.div key={e.id} {...fadeUp(idx * 0.1)} className="bg-white dark:bg-[#0e1225] rounded-2xl border-2 border-slate-100 dark:border-white/5 p-7 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group shadow-sm hover:shadow-xl cursor-pointer">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <HiBookOpen className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <span className={`px-3 py-1 text-[9px] font-black rounded-xl uppercase tracking-widest ${e.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                        {e.status === 'pending' ? 'Pending' : 'Enrolled'}
                      </span>
                    </div>
                    <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">{e.courseTitle}</h5>
                    <div className="mt-5 p-4 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-100 dark:border-white/5">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 dark:text-white/60 uppercase tracking-widest mb-2">
                        <span>Progress</span>
                        <span className="text-blue-600 dark:text-cyan-400">45%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ delay: 0.4 }} className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-white dark:bg-[#0e1225] rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
                <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-white/5 mx-auto flex items-center justify-center mb-6">
                  <HiBookOpen className="w-10 h-10 text-slate-300 dark:text-white/20" />
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Active Courses</h4>
                <p className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-[0.2em]">Enroll in a course to get started</p>
                <button onClick={() => navigate('/courses')} className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-all active:scale-95">
                  Browse Courses
                </button>
              </div>
            )}
          </motion.div>

          {/* Certificates & Transactions row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Certificates */}
            <motion.div {...fadeUp(0.25)} className="bg-white dark:bg-[#0e1225] rounded-2xl border-2 border-slate-100 dark:border-white/5 p-7 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.35em] flex items-center gap-1.5"><HiAcademicCap />Credentials</h4>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-1">My Certificates</h3>
                </div>
                <button onClick={() => navigate('/dashboard/student?panel=certificates')} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">All <HiArrowRight /></button>
              </div>
              <div className="space-y-3">
                {certificates.length > 0 ? certificates.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 group hover:border-amber-200 dark:hover:border-amber-900/50 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <HiBadgeCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{c.courseName}</p>
                      <p className="text-[9px] font-bold text-emerald-600 mt-0.5 uppercase tracking-widest">Grade: {c.grade}</p>
                    </div>
                    <HiDownload className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                )) : (
                  <div className="py-10 text-center">
                    <HiAcademicCap className="w-10 h-10 text-slate-200 dark:text-white/10 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No certificates yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div {...fadeUp(0.3)} className="bg-white dark:bg-[#0e1225] rounded-2xl border-2 border-slate-100 dark:border-white/5 p-7 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.35em] flex items-center gap-1.5"><HiChartBar />Finance</h4>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-1">Transactions</h3>
                </div>
                <button onClick={() => navigate('/dashboard/student?panel=payments')} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">All <HiArrowRight /></button>
              </div>
              <div className="space-y-3">
                {transactions.length > 0 ? transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <HiCurrencyDollar className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{tx.type?.replace('_', ' ') || 'Payment'}</p>
                    </div>
                    <p className="text-sm font-black text-emerald-600">+{tx.amount} Br</p>
                  </div>
                )) : (
                  <div className="py-10 text-center">
                    <HiCurrencyDollar className="w-10 h-10 text-slate-200 dark:text-white/10 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No transactions yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">

          {/* Referral Card */}
          <motion.div {...fadeUp(0.2)} className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 p-8 text-white border border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/15 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                <HiShare className="w-7 h-7 text-cyan-300" />
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tighter">Referral <span className="text-cyan-400">Network</span></h4>
              <p className="text-[10px] font-bold text-blue-200/60 uppercase tracking-[0.2em] mt-3 leading-relaxed">
                Share your link and earn commissions for every new user who signs up.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Total Referrals</span>
                  <span className="text-xl font-black text-white">{referrals}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Commission Earned</span>
                  <span className="text-xl font-black text-emerald-400">{commission} Br</span>
                </div>
              </div>

              <div className="mt-5 p-4 bg-black/30 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Your Referral Link</p>
                <code className="block text-[10px] font-bold text-white/80 truncate bg-white/5 p-3 rounded-xl border border-white/5 select-all">
                  {window.location.host}/register?ref={userData?.referralCode || user?.uid}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${userData?.referralCode || user?.uid}`);
                    toast.success('Referral link copied!');
                  }}
                  className="mt-3 w-full py-3 rounded-xl bg-cyan-500 text-blue-950 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <HiClipboardCopy className="w-4 h-4" /> Copy Link
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fadeUp(0.3)} className="bg-white dark:bg-[#0e1225] rounded-3xl border-2 border-slate-100 dark:border-white/5 p-7 shadow-sm">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.35em] flex items-center gap-1.5 mb-5"><HiLightningBolt />Quick Actions</h4>
            <div className="space-y-3">
              {[
                { label: 'Browse Courses', icon: HiBookOpen, action: () => navigate('/courses'), color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                { label: 'My Profile', icon: HiStar, action: () => navigate('/dashboard/student?panel=profile'), color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                { label: 'View Referrals', icon: HiUserGroup, action: () => navigate('/dashboard/student?panel=referrals'), color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'My Certificates', icon: HiAcademicCap, action: () => navigate('/dashboard/student?panel=certificates'), color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
              ].map((item, i) => (
                <button key={i} onClick={item.action} className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-blue-600 hover:text-white dark:hover:bg-white/10 transition-all group text-left">
                  <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0 group-hover:bg-white/20`}>
                    <item.icon className="w-5 h-5 group-hover:text-white" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight group-hover:text-white">{item.label}</span>
                  <HiArrowRight className="w-4 h-4 text-slate-300 group-hover:text-white ml-auto transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Global Activity */}
          <motion.div {...fadeUp(0.35)} className="bg-white dark:bg-[#0e1225] rounded-3xl border-2 border-slate-100 dark:border-white/5 p-7 shadow-sm">
            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.35em] flex items-center gap-1.5 mb-5"><HiClock />Global Activity</h4>
            <div className="space-y-3">
              {recentActivity.length > 0 ? recentActivity.map(a => (
                <div key={a.id} className="flex gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex shrink-0 items-center justify-center">
                    <HiCheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Task Verified</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">+{a.reward} ETB via {a.platform}</p>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center">
                  <HiClock className="w-10 h-10 text-slate-200 dark:text-white/10 mx-auto mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live stream loading...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
