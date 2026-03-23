import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { HiLightningBolt, HiExternalLink, HiCheckCircle, HiCash, HiTrendingUp, HiUserGroup, HiClock } from 'react-icons/hi';
import { FaTiktok, FaTelegram, FaFacebook, FaYoutube, FaInstagram } from 'react-icons/fa';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { toast } from 'react-toastify';

const platformIcons = {
  tiktok: FaTiktok,
  telegram: FaTelegram,
  facebook: FaFacebook,
  youtube: FaYoutube,
  instagram: FaInstagram,
  default: HiLightningBolt
};

const SocialTasksPanel = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState({}); // Tracking user completion state
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ earnings: 0, completed: 0 });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: '', platform: 'tiktok', link: '', targetCount: 1000 });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    // 1. Fetch available tasks
    const tasksQuery = query(collection(db, 'social_tasks'), where('status', '==', 'active'), orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(tasksQuery, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. Fetch user's completion records
    if (user) {
      const userTasksQuery = query(collection(db, 'user_social_tasks'), where('userId', '==', user.uid));
      const unsubUserTasks = onSnapshot(userTasksQuery, (snap) => {
        const mapping = {};
        let totalEarnings = 0;
        let completedCount = 0;
        snap.docs.forEach(d => {
          const data = d.data();
          mapping[data.taskId] = { id: d.id, ...data };
          if (data.status === 'verified') {
            totalEarnings += (data.reward || 0);
            completedCount++;
          }
        });
        setUserTasks(mapping);
        setStats({ earnings: totalEarnings, completed: completedCount });
        setLoading(false);
      });
      return () => { unsubTasks(); unsubUserTasks(); };
    }

    return () => unsubTasks();
  }, [user]);

  const handleVerify = async (task) => {
    if (!user) return toast.error("Auth Session Required");
    
    setLoading(true);
    try {
      const existing = userTasks[task.id];
      if (existing) {
        if (existing.status === 'verified') return toast.info("Task already finalized");
        await updateDoc(doc(db, 'user_social_tasks', existing.id), {
          status: 'pending_verification',
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'user_social_tasks'), {
          userId: user.uid,
          taskId: task.id,
          taskTitle: task.title,
          reward: task.reward,
          platform: task.platform,
          status: 'pending_verification',
          createdAt: serverTimestamp()
        });
      }
      toast.success("Task transmission verified. Awaiting audit.");
    } catch (err) {
      toast.error("Protocol failure in verification");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Session required");
    setSubmitLoading(true);
    try {
      await addDoc(collection(db, 'social_tasks'), {
        ...submitForm,
        targetCount: Number(submitForm.targetCount),
        reward: 0,
        status: 'pending',
        createdBy: user.uid,
        authorName: user.name || 'Student',
        createdAt: serverTimestamp()
      });
      toast.success("Link submitted for review!");
      setShowSubmitModal(false);
      setSubmitForm({ title: '', platform: 'tiktok', link: '', targetCount: 1000 });
    } catch {
      toast.error("Submission failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col xl:flex-row gap-8 items-start justify-between">
        <div>
           <h2 className="text-4xl font-black text-blue-900 dark:text-white tracking-tighter uppercase underline decoration-blue-600 decoration-4 underline-offset-8">Social Matrix</h2>
           <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-4">Daily Engagement & Earning Protocols</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
           <button 
             onClick={() => setShowSubmitModal(true)}
             className="px-8 py-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-[2rem] shadow-2xl shadow-blue-900/40 hover:-translate-y-1 active:scale-95 transition-all font-black tracking-widest text-[11px] uppercase flex items-center gap-3 h-full"
           >
             <HiLightningBolt className="w-5 h-5" /> Promote Your Link
           </button>

           <div className="bg-white dark:bg-[#0e1225] p-6 rounded-[2rem] border border-blue-50 dark:border-white/5 shadow-xl flex items-center gap-6 min-w-[240px]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                 <HiCash className="w-7 h-7" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Yield</p>
                 <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{stats.earnings} <span className="text-[10px] text-blue-600">ETB</span></p>
              </div>
           </div>
           <div className="bg-white dark:bg-[#0e1225] p-6 rounded-[2rem] border border-blue-50 dark:border-white/5 shadow-xl flex items-center gap-6 min-w-[200px]">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <HiCheckCircle className="w-7 h-7" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed</p>
                 <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{stats.completed} <span className="text-[10px] text-blue-600">TASKS</span></p>
              </div>
           </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="py-32 text-center bg-white dark:bg-[#0e1225] rounded-[4rem] border border-blue-100 dark:border-white/10">
           <HiTrendingUp className="w-20 h-20 text-blue-100 dark:text-white/5 mx-auto mb-8 animate-pulse" />
           <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">No Active Tasks</p>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Matrix Refilling... Check back in 24h.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {tasks.map(task => {
            const Icon = platformIcons[task.platform] || platformIcons.default;
            const completion = userTasks[task.id];
            const isPending = completion?.status === 'pending_verification';
            const isVerified = completion?.status === 'verified';

            return (
              <div key={task.id} className="group bg-white dark:bg-[#0e1225] rounded-[3.5rem] border border-blue-50 dark:border-white/5 p-10 shadow-2xl hover:-translate-y-2 transition-all overflow-hidden relative">
                 {/* Design Orbs */}
                 <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all" />
                 
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                       <div className="w-16 h-16 rounded-[1.8rem] bg-slate-900 text-white flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-all duration-500">
                          <Icon className="w-8 h-8" />
                       </div>
                       <Badge variant={isVerified ? 'success' : isPending ? 'warning' : 'primary'} className="uppercase px-5 py-2 text-[10px] tracking-widest shadow-xl">
                          {isVerified ? 'Authorized' : isPending ? 'Audit Pending' : 'Available'}
                       </Badge>
                    </div>

                    <div className="space-y-3 mb-10">
                       <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.3em]">{task.platform} Protocol</p>
                       <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight line-clamp-2 uppercase">{task.title}</h4>
                    </div>

                    <div className="flex items-center gap-4 mb-10">
                       <div className="flex-1 bg-slate-50 dark:bg-black/40 p-5 rounded-[2rem] border border-blue-100 dark:border-white/5 flex flex-col items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Yield</span>
                          <span className="text-2xl font-black text-emerald-600 tabular-nums">{task.reward} ETB</span>
                       </div>
                       <div className="flex-1 bg-slate-50 dark:bg-black/40 p-5 rounded-[2rem] border border-blue-100 dark:border-white/5 flex flex-col items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Targets</span>
                          <span className="text-2xl font-black text-blue-600 tabular-nums">{task.targetCount || 1000}</span>
                       </div>
                    </div>

                    <div className="flex flex-col gap-3">
                       <a 
                         href={task.link} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all"
                       >
                          Open Channel <HiExternalLink className="w-5 h-5" />
                       </a>
                       
                       <button 
                         disabled={loading || isVerified || isPending}
                         onClick={() => handleVerify(task)}
                         className={`py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl transition-all ${
                            isVerified ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/20' : 
                            isPending ? 'bg-amber-600/10 text-amber-600 border border-amber-600/20' : 
                            'bg-blue-600 text-white hover:bg-black shadow-blue-600/20'
                         }`}
                       >
                          {isVerified ? 'Verification Complete' : isPending ? 'Audit in Progress' : 'Verify Completion'}
                       </button>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Social Proof Sidebar/Footer */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[4rem] p-12 text-white relative overflow-hidden group shadow-3xl">
         <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
            <HiUserGroup className="w-96 h-96" />
         </div>
         
         <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
            <div className="text-center xl:text-left">
               <h4 className="text-4xl font-black uppercase tracking-tighter mb-4">Community <span className="text-blue-400">Velocity</span></h4>
               <p className="text-blue-200/50 font-bold text-sm leading-relaxed uppercase tracking-widest max-w-lg">
                  Over <span className="text-white">12,400+</span> interactions verified this week. Real-time earnings are distributed every 24 hours to qualified accounts.
               </p>
            </div>
            
            <div className="flex gap-4">
               <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center">
                     <HiClock className="w-8 h-8 text-blue-400" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-200/50">Next Reset</span>
                  <span className="text-sm font-black text-white">04:12:00</span>
               </div>
            </div>
         </div>
      </div>

      {/* Submit Task Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Promote Social Link">
         <form onSubmit={handleSubmitTask} className="p-8 space-y-6">
            <div>
               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Campaign Title</label>
               <input required value={submitForm.title} onChange={e => setSubmitForm({...submitForm, title: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500" placeholder="e.g. Follow my TikTok page" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Platform</label>
                  <select value={submitForm.platform} onChange={e => setSubmitForm({...submitForm, platform: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500">
                     <option value="tiktok">TikTok</option>
                     <option value="telegram">Telegram</option>
                     <option value="facebook">Facebook</option>
                     <option value="youtube">YouTube</option>
                     <option value="instagram">Instagram</option>
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Target Interactions</label>
                  <input type="number" required value={submitForm.targetCount} onChange={e => setSubmitForm({...submitForm, targetCount: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500" min="10" placeholder="1000" />
               </div>
            </div>
            <div>
               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Direct Link (URL)</label>
               <input required type="url" value={submitForm.link} onChange={e => setSubmitForm({...submitForm, link: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500" placeholder="https://" />
            </div>
            <button disabled={submitLoading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700">
               {submitLoading ? 'Transmitting...' : 'Submit to Admin Audit'}
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default SocialTasksPanel;
