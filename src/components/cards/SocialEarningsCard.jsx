import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTiktok, FaTelegramPlane, FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa';
import { HiExternalLink, HiCurrencyDollar, HiGift, HiClock, HiCheckCircle, HiSparkles } from 'react-icons/hi';
import { doc, getDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../core/firebase/firebase';
import { toast } from 'react-toastify';

const SOCIAL_TASKS = [
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@svtecher',
    icon: FaTiktok,
    url: 'https://www.tiktok.com/@svtecher',
    reward: 0.50,
    color: 'from-slate-800 to-slate-950',
    accent: 'text-pink-500',
    iconBg: 'bg-white/10',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    handle: 't.me/svtecher',
    icon: FaTelegramPlane,
    url: 'https://t.me/svtecher',
    reward: 0.50,
    color: 'from-sky-500 to-blue-600',
    accent: 'text-sky-200',
    iconBg: 'bg-white/20',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    handle: 'fb.me/svtecher',
    icon: FaFacebookF,
    url: 'https://www.facebook.com/svtecher',
    reward: 0.50,
    color: 'from-blue-600 to-indigo-700',
    accent: 'text-blue-200',
    iconBg: 'bg-white/20',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    handle: '@svtecher',
    icon: FaYoutube,
    url: 'https://www.youtube.com/@svtecher',
    reward: 0.50,
    color: 'from-red-600 to-rose-700',
    accent: 'text-red-200',
    iconBg: 'bg-white/20',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@svtecher',
    icon: FaInstagram,
    url: 'https://www.instagram.com/svtecher',
    reward: 0.50,
    color: 'from-pink-500 via-purple-600 to-orange-500',
    accent: 'text-pink-200',
    iconBg: 'bg-white/20',
  },
];

const SocialEarningsCard = ({ userId }) => {
  const [completedToday, setCompletedToday] = useState({});
  const [totalEarnedToday, setTotalEarnedToday] = useState(0);
  const [loading, setLoading] = useState('');

  const todayKey = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!userId) return;
    const loadProgress = async () => {
      try {
        const ref = doc(db, 'users', userId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const dailyTasks = data.dailySocialTasks || {};
          const todayTasks = dailyTasks[todayKey] || {};
          setCompletedToday(todayTasks);
          setTotalEarnedToday(Object.keys(todayTasks).length * 0.50);
        }
      } catch (err) {
        console.error('Failed to load social tasks:', err);
      }
    };
    loadProgress();
  }, [userId, todayKey]);

  const handleFollow = async (task) => {
    if (completedToday[task.id]) {
      window.open(task.url, '_blank');
      toast.info('Goal already reached today! Come back tomorrow.');
      return;
    }

    setLoading(task.id);
    window.open(task.url, '_blank');

    try {
      const ref = doc(db, 'users', userId);
      await updateDoc(ref, {
        [`dailySocialTasks.${todayKey}.${task.id}`]: true,
        earnings: increment(task.reward),
        walletBalance: increment(task.reward),
        updatedAt: serverTimestamp(),
      });

      setCompletedToday(prev => ({ ...prev, [task.id]: true }));
      setTotalEarnedToday(prev => prev + task.reward);
      toast.success(`+${task.reward.toFixed(2)} Birr added to your wallet! 🎉`, {
        icon: <HiSparkles className="text-yellow-400 w-6 h-6" />,
        style: { borderRadius: '20px', fontWeight: 'bold' }
      });
    } catch (err) {
      console.error('Earn task failed:', err);
      toast.error('Sync failed. Please refreshing.');
    } finally {
      setLoading('');
    }
  };

  const allDone = SOCIAL_TASKS.every(t => completedToday[t.id]);

  return (
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] rounded-[3rem] p-8 lg:p-12 text-white relative overflow-hidden border border-white/10 shadow-3xl">
      {/* Dynamic Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" 
      />

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 mb-12">
          <div className="max-w-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-orange-500/20">
                <HiGift className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-none">Social Rewards</h3>
                <p className="text-[10px] font-black text-blue-400 tracking-[0.3em] mt-2 uppercase opacity-80 underline decoration-blue-500 underline-offset-8">Advanced Earning Protocol</p>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-wide opacity-80">
              Engage with our official social media channels to unlock daily Birr rewards. Each activity is tracked in real-time.
            </p>
          </div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-6 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] px-8 py-6 border border-white/10 shadow-inner group transition-all"
          >
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500 transition-colors">
              <HiCurrencyDollar className="w-7 h-7 text-emerald-400 group-hover:text-white" />
            </div>
            <div>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={totalEarnedToday}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-3xl font-black tracking-tighter leading-none"
                >
                  {totalEarnedToday.toFixed(2)} <span className="text-xs text-blue-400 opacity-60">BR</span>
                </motion.p>
              </AnimatePresence>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Today's Revenue</p>
            </div>
          </motion.div>
        </div>

        {allDone && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] px-8 py-5"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <HiCheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">Daily social quota complete! Come back in 24 hours.</p>
          </motion.div>
        )}

        {/* Task Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {SOCIAL_TASKS.map((task, idx) => {
            const done = completedToday[task.id];
            const isLoading = loading === task.id;
            return (
              <motion.button
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleFollow(task)}
                disabled={isLoading}
                whileHover={!done ? { y: -10, scale: 1.02 } : {}}
                className={`relative flex flex-col items-center gap-5 p-8 rounded-[2.5rem] border transition-all duration-500 group overflow-hidden ${
                  done
                    ? 'bg-slate-900/40 border-emerald-500/20 opacity-90'
                    : `bg-gradient-to-br ${task.color} border-white/10 shadow-xl hover:shadow-2xl`
                }`}
              >
                {!done && (
                   <motion.div 
                     animate={{ opacity: [0.1, 0.3, 0.1] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-white/5 pointer-events-none" 
                   />
                )}

                {done && (
                  <div className="absolute top-4 right-4 animate-in zoom-in duration-500">
                    <HiCheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                )}

                <div className={`w-16 h-16 ${task.iconBg} rounded-3xl flex items-center justify-center ${done ? 'opacity-30' : 'group-hover:rotate-12'} transition-all duration-500 border border-white/10 shadow-inner`}>
                  <task.icon className="w-8 h-8" />
                </div>
                
                <div className="text-center">
                  <span className="text-sm font-black uppercase tracking-widest block mb-1">{task.label}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest opacity-40 block ${task.accent}`}>{task.handle}</span>
                </div>

                <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all ${
                  done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-white/15 text-white border border-white/10 group-hover:bg-white group-hover:text-slate-900'
                }`}>
                  {done ? (
                    <><HiCheckCircle className="w-4 h-4" /> Earned</>
                  ) : isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><HiCurrencyDollar className="w-4 h-4" /> +{task.reward.toFixed(2)} Br</>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-6 opacity-40">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
            <HiClock className="w-5 h-5" /> Social Oracle Refresh: 00:00 UTC
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
            <HiSparkles className="w-5 h-5" /> Max Daily Earning Cap: {(SOCIAL_TASKS.length * 0.50).toFixed(2)} BR
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialEarningsCard;
