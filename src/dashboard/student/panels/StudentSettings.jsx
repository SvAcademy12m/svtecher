import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiLockClosed, HiShieldCheck, HiOutlineMail, HiDeviceMobile, HiKey, HiCheckCircle } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { getAuth, sendPasswordResetEmail, updatePassword } from 'firebase/auth';

const StudentSettings = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [pwForm, setPwForm] = useState({ newPassword: '', confirmPassword: '' });

  const handlePasswordReset = async () => {
    if (!user?.email) return toast.error("No email associated with this account.");
    setLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, user.email);
      toast.success(`Reset link dispatched to ${user.email}`);
    } catch (err) {
      toast.error(err.message || 'Transmission failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    if (pwForm.newPassword.length < 6) {
       return toast.error("Password must be at least 6 characters.");
    }
    setLoading(true);
    try {
      await updatePassword(user, pwForm.newPassword);
      toast.success("Security keys updated successfully.");
      setPwForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
       if(err.code === 'auth/requires-recent-login') {
         toast.error("Security timeout. Please sign out and sign back in to modify your core keys.");
       } else {
         toast.error(err.message || 'Key exchange failed.');
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto animate-in fade-in duration-700">
      
      {/* Settings Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-[3rem] p-12 border border-blue-900/50 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-blue-900/40 flex items-center justify-center border border-blue-500/30 shadow-inner">
               <HiShieldCheck className="w-10 h-10 text-cyan-400" />
            </div>
            <div>
               <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none">Security Center</h3>
               <p className="text-[10px] font-black text-cyan-400/70 mt-3 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> End-to-End Encryption Active
               </p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
         {/* Password Management Node */}
         <div className="bg-white dark:bg-[#0e1225] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-2xl group-hover:bg-cyan-400/20 transition-colors" />
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center text-blue-600 dark:text-cyan-400">
                     <HiKey className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Modify Access Key</h4>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Password Override</p>
                  </div>
               </div>

               <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">New Access Key</label>
                     <input 
                        type="password" 
                        required
                        value={pwForm.newPassword}
                        onChange={e => setPwForm({...pwForm, newPassword: e.target.value})}
                        className="w-full mt-2 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 p-4 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-500 transition-colors" 
                        placeholder="••••••••"
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Verify Access Key</label>
                     <input 
                        type="password" 
                        required
                        value={pwForm.confirmPassword}
                        onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})}
                        className="w-full mt-2 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 p-4 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-cyan-500 transition-colors" 
                        placeholder="••••••••"
                     />
                  </div>
                  <button disabled={loading} type="submit" className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-600 dark:hover:bg-cyan-400 dark:hover:text-white transition-all active:scale-95">
                     Initiate Key Exchange
                  </button>
               </form>
            </div>
         </div>

         {/* Advanced Threat Protection */}
         <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-10 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                  <HiOutlineMail className="w-24 h-24" />
               </div>
               <div className="relative z-10">
                  <h4 className="text-xl font-black uppercase tracking-tighter mb-2">Emergency Override</h4>
                  <p className="text-[10px] font-bold text-blue-200 leading-relaxed uppercase tracking-widest max-w-[200px]">Dispatch a secure reset link to your primary communication channel.</p>
                  <button onClick={handlePasswordReset} disabled={loading} className="mt-8 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-white hover:text-blue-900 transition-all active:scale-95 flex items-center gap-3">
                     <HiOutlineMail className="w-4 h-4" /> Send Reset Protocol
                  </button>
               </div>
            </div>

            <div className="bg-white dark:bg-[#0e1225] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-10 shadow-sm relative">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                        <HiDeviceMobile className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter shrink-0">Two-Step Verification</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-Factor Armor</p>
                     </div>
                  </div>
                  <button 
                     onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        toast.success(twoFactorEnabled ? "MFA Protocol Terminated." : "MFA Protocol Initialized.");
                     }}
                     className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 shadow-inner ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`}
                  >
                     <motion.div 
                        initial={false}
                        animate={{ x: twoFactorEnabled ? 24 : 0 }}
                        className="w-6 h-6 bg-white rounded-full shadow border-2 border-transparent"
                     />
                  </button>
               </div>
               <div className="mt-6 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest flex items-center gap-2">
                     {twoFactorEnabled ? <HiCheckCircle className="text-emerald-500 w-4 h-4 shrink-0" /> : <HiLockClosed className="text-slate-400 w-4 h-4 shrink-0" />}
                     {twoFactorEnabled ? "Your account is currently protected by Multi-Factor Authentication." : "Enhance your grid security by requiring a secondary verification metric."}
                  </p>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default StudentSettings;
