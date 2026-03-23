import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiUserGroup, HiBadgeCheck, HiShare, HiTrendingUp, HiGlobeAlt, 
  HiUsers, HiLightningBolt, HiCheckCircle, HiDuplicate, HiIdentification, HiFingerPrint, HiShieldCheck
} from 'react-icons/hi';
import { formatDateTime } from '../../../core/utils/formatters';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { toast } from 'react-toastify';
import { useLanguage } from '../../../contexts/LanguageContext';

const StudentReferrals = ({ userData }) => {
  const { t } = useLanguage();
  const [referredUsers, setReferredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const referralCode = userData?.referralCode || userData?.uid?.slice(0, 8);
  const referralLink = useMemo(() => {
    return `${window.location.origin}/register?ref=${referralCode || ''}`;
  }, [referralCode]);

  useEffect(() => {
    if (!userData?.uid) return;
    const q = query(collection(db, 'users'), where('referredBy', '==', userData.uid));
    const unsub = onSnapshot(q, (snap) => {
      setReferredUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [userData?.uid]);

  const stats = useMemo(() => {
    const referralCount = referredUsers.length;
    
    // Dynamically pull real earnings instead of hardcoding
    const etbEarnings = (userData?.commissionBalance || 0) + (userData?.earnings || 0);
    const usdEarnings = (etbEarnings / 120).toFixed(2); // Mock conversion

    return [
      { label: 'Network Size', value: userData?.followersCount || 0, icon: HiUsers, color: 'text-blue-600' },
      { label: 'Active Friends', value: referralCount.toString(), icon: HiUserGroup, color: 'text-cyan-500' },
      { 
        label: 'Total Payout', 
        value: `${etbEarnings.toFixed(2)} Br`, 
        subValue: `$${usdEarnings}`,
        icon: HiLightningBolt, 
        color: 'text-emerald-500' 
      }
    ];
  }, [referredUsers, userData]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  const getRoleInfo = (count) => {
    if (count >= 101) return { title: 'Ambassador', next: 'Max Level', goal: 101, color: 'text-purple-500', bg: 'bg-purple-500/10' };
    if (count >= 51) return { title: 'Director', next: 'Ambassador', goal: 101, color: 'text-rose-500', bg: 'bg-rose-500/10' };
    if (count >= 21) return { title: 'Leader', next: 'Director', goal: 51, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    if (count >= 6) return { title: 'Builder', next: 'Leader', goal: 21, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    return { title: 'Starter', next: 'Builder', goal: 6, color: 'text-blue-500', bg: 'bg-blue-500/10' };
  };

  const role = getRoleInfo(referredUsers.length);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header & Link Card */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
           <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-2">Networking Program</h3>
           <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
             Invite & <span className="text-blue-700">Earn</span>
           </h2>
        </div>
        
        <div className="bg-white dark:bg-white/5 p-4 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center gap-6 shadow-2xl shadow-blue-900/5 overflow-hidden group">
           <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shrink-0">Your Invite Link</div>
              <code className="text-xs font-black text-blue-700 dark:text-blue-400 tracking-tight truncate max-w-[200px] sm:max-w-md">{referralLink}</code>
           </div>
           <button 
             onClick={copyLink}
             className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 shrink-0"
           >
              <HiDuplicate className="w-4 h-4" /> Copy Link
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {stats.map((s, idx) => (
           <motion.div 
             key={s.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: idx * 0.1 }}
             className="bg-white dark:bg-[#0e1225] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                 <s.icon className="w-24 h-24 text-blue-600" />
              </div>
              <div className="relative z-10 flex items-center justify-between mb-6">
                 <s.icon className={`w-10 h-10 ${s.color} hover:rotate-12 transition-transform`} />
                 <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black border-none">Verified Metric</Badge>
              </div>
              <div className="flex items-baseline gap-3">
                 <h4 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{s.value}</h4>
                 {s.subValue && <span className="text-sm font-black text-slate-400 opacity-50">{s.subValue}</span>}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 whitespace-nowrap">{s.label}</p>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visualization */}
        <div className="lg:col-span-2 bg-[#0e1225] text-white rounded-[4rem] p-12 shadow-2xl shadow-blue-900/20 relative overflow-hidden group border border-white/5">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50" />
           
           <div className="relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-16">
                 <div>
                    <h4 className="text-3xl font-black uppercase tracking-tighter mb-2">Network Growth</h4>
                    <p className={`text-[10px] uppercase tracking-[0.4em] font-black flex items-center gap-2 ${role.color}`}>
                       <HiTrendingUp className="text-cyan-400" /> Pyramid Role: {role.title}
                    </p>
                 </div>
                 <HiGlobeAlt className="w-12 h-12 text-cyan-500/20 animate-spin-slow" />
              </div>

              <div className="flex-1 flex items-center justify-center py-10">
                 <div className="relative">
                    <motion.div 
                       animate={{ 
                         boxShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 60px rgba(59,130,246,0.3)", "0 0 0px rgba(59,130,246,0)"] 
                       }}
                       transition={{ repeat: Infinity, duration: 3 }}
                       className="w-32 h-32 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 rounded-[2.5rem] flex items-center justify-center border-4 border-white/20 shadow-2xl relative z-20 group-hover:scale-105 transition-transform"
                    >
                       <span className="text-2xl font-black tracking-tighter">ME</span>
                    </motion.div>

                    {/* Nodes Simulation */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]">
                       {referredUsers.slice(0, 6).map((r, i) => {
                          const angle = (i * (360 / Math.min(6, referredUsers.length))) * (Math.PI / 180);
                          const x = Math.cos(angle) * 160;
                          const y = Math.sin(angle) * 160;
                          return (
                             <motion.div 
                                key={r.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="absolute"
                                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}
                             >
                                <div className="w-12 h-12 bg-white/5 border border-white/10 backdrop-blur-3xl rounded-2xl flex items-center justify-center text-cyan-400 shadow-xl group/node hover:bg-cyan-400 hover:text-white transition-all cursor-pointer">
                                   <HiCheckCircle className="w-6 h-6" />
                                   <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-white">
                                      {r.name}
                                   </div>
                                </div>
                             </motion.div>
                          );
                       })}
                    </div>
                 </div>
              </div>

              <div className="mt-16 pt-8 border-t border-white/5 flex gap-10">
                 <Legend icon={HiCheckCircle} color="text-cyan-400" label="Active Friends" />
                 <Legend icon={HiLightningBolt} color="text-blue-500" label="Network Growth" />
              </div>
           </div>
        </div>

        {/* Node Matrix Registry */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0e1225] rounded-[3rem] border-[4px] border-black dark:border-white/10 overflow-hidden shadow-2xl transition-all">
           <div className="p-8 border-b-4 border-black dark:border-white/5 flex justify-between items-center bg-blue-600 text-white">
              <h4 className="text-xl font-black uppercase tracking-tighter">My Referral Matrix Hub</h4>
              <span className="px-5 py-1.5 rounded-2xl bg-white text-blue-600 text-[10px] font-black tracking-wider shadow-lg">{referredUsers.length} Nodes Synchronized</span>
           </div>
           
           <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
              <table className="w-full border-collapse min-w-[1000px]">
                 <thead className="sticky top-0 z-20">
                    <tr className="bg-black text-white">
                       <th className="text-left p-6 text-[11px] font-black tracking-widest uppercase border-r-[3px] border-b-4 border-black">Identity Node</th>
                       <th className="text-center p-6 text-[11px] font-black tracking-widest uppercase border-r-[3px] border-b-4 border-black">Role Group</th>
                       <th className="text-right p-6 text-[11px] font-black tracking-widest uppercase border-r-[3px] border-b-4 border-black">Comm. Yield (ETB)</th>
                       <th className="text-center p-6 text-[11px] font-black tracking-widest uppercase border-r-[3px] border-b-4 border-black">Activity Status</th>
                       <th className="text-right p-6 text-[11px] font-black tracking-widest uppercase border-b-4 border-black">Registered On</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y-[3px] divide-black dark:divide-white/10 bg-white dark:bg-black/40">
                    {referredUsers.length === 0 ? (
                       <tr>
                          <td colSpan="5" className="p-20 text-center">
                             <div className="opacity-20 flex flex-col items-center">
                                <HiUserGroup className="w-20 h-20 mb-4" />
                                <p className="text-sm font-black uppercase tracking-[0.3em]">No Referral Nodes Detected</p>
                             </div>
                          </td>
                       </tr>
                    ) : (
                       referredUsers.map((r) => (
                          <tr key={r.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors group">
                             <td className="p-6 border-r-[3px] border-black dark:border-white/10">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-white dark:bg-white/5 border-[3px] border-black rounded-2xl flex items-center justify-center font-black text-blue-600 text-xs shadow-xl group-hover:rotate-6 transition-all">
                                      {r.name.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1.5 uppercase">{r.name}</p>
                                      <p className="text-[9px] font-black text-blue-600/40 uppercase tracking-widest">ID: {r.id?.slice(0, 8)}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="p-6 border-r-[3px] border-black dark:border-white/10 text-center">
                                <span className="inline-block px-4 py-1.5 border-[3px] border-black rounded-xl text-[9px] font-black uppercase tracking-widest">
                                   {r.role}
                                </span>
                             </td>
                             <td className="p-6 border-r-[3px] border-black dark:border-white/10 text-right">
                                <p className="text-sm font-black text-emerald-600 tabular-nums">+{r.commissionValue || 0} ETB</p>
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Direct Bonus</p>
                             </td>
                             <td className="p-6 border-r-[3px] border-black dark:border-white/10 text-center">
                                <div className="flex justify-center gap-3">
                                   <div className={`p-2 rounded-lg border-2 ${r.hasPaidCourse ? 'bg-emerald-50 border-emerald-600 text-emerald-600' : 'bg-slate-50 border-black/10 text-slate-200'}`} title="Course Payment">
                                      <HiIdentification className="w-4 h-4" />
                                   </div>
                                   <div className={`p-2 rounded-lg border-2 ${r.hasPaidService ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-slate-50 border-black/10 text-slate-200'}`} title="Service Payment">
                                      <HiFingerPrint className="w-4 h-4" />
                                   </div>
                                </div>
                             </td>
                             <td className="p-6 text-right">
                                <p className="text-xs font-black text-slate-800 dark:text-white tabular-nums uppercase">{r.createdAt ? (r.createdAt.toDate ? r.createdAt.toDate().toLocaleDateString() : new Date(r.createdAt.seconds * 1000).toLocaleDateString()) : 'N/A'}</p>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">Verified Node</p>
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
           
           <div className="p-8 border-t-4 border-black dark:border-white/5 bg-slate-50 dark:bg-black/20 flex justify-between items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Network Integrity: Authenticated</p>
              <button onClick={() => window.print()} className="px-6 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">Print Matrix Report</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const Legend = ({ icon: Icon, color, label }) => (
  <div className="flex items-center gap-3">
     <div className={`w-8 h-8 ${color} bg-white/5 rounded-xl flex items-center justify-center border border-white/5`}>
        <Icon className="w-4 h-4" />
     </div>
     <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</span>
  </div>
);

const Badge = ({ children, variant, className }) => (
  <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${variant === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-400'} ${className}`}>
    {children}
  </span>
);

export default StudentReferrals;
