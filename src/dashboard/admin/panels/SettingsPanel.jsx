import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  HiTranslate, HiCurrencyDollar, HiGlobe, HiCog, 
  HiLockClosed, HiShieldCheck, HiStatusOnline, HiExclamation,
  HiEyeOff, HiRefresh, HiServer, HiLightningBolt, HiFingerPrint
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { auth } from '../../../core/firebase/firebase';
import { updatePassword } from 'firebase/auth';
import { systemService } from '../../../core/services/firestoreService';

const SettingsPanel = () => {
  const { lang, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ 
    isMaintenance: false,
    openEnrollment: true,
    openJobs: true,
    openSocialEarnings: true,
    allowSignups: true
  });

  useEffect(() => {
    return systemService.subscribe(setSettings);
  }, []);

  const toggleSetting = async (key) => {
    try {
      await systemService.update({ [key]: !settings[key] });
      toast.success(`${key.replace(/([A-Z])/g, ' $1').toUpperCase()} updated!`);
    } catch {
      toast.error("Failed to sync production state.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("Passwords don't match");
    if (passwords.new.length < 6) return toast.error("Password too short");
    
    setLoading(true);
    try {
      await updatePassword(auth.currentUser, passwords.new);
      toast.success("Password updated successfully!");
      setPasswords({ new: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h3 className="text-4xl font-black text-blue-900 dark:text-white tracking-tighter uppercase  underline decoration-blue-600 decoration-4 underline-offset-8">System Control</h3>
          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-3">Advanced Parameters & Security Matrix</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-4 transition-all shadow-xl ${settings.isMaintenance ? 'border-rose-500 bg-rose-500/5 text-rose-600 shadow-rose-500/10' : 'border-emerald-500 bg-emerald-500/5 text-emerald-600 shadow-emerald-500/10'}`}>
             <div className={`w-3 h-3 rounded-full ${settings.isMaintenance ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'}`} />
             <span className="text-[11px] font-black uppercase tracking-widest">{settings.isMaintenance ? 'Maintenance Active' : 'Site Online'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Language & Identity Matrix */}
        <div className="space-y-10">
          <div className="bg-white dark:bg-[#0e1225] rounded-[3rem] border border-blue-50 dark:border-white/10 p-10 shadow-2xl shadow-blue-900/5">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 rounded-[1.8rem] bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/20">
                <HiTranslate className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-2xl text-blue-900 dark:text-white uppercase tracking-tighter">Identity Language</h4>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Site Location</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { id: 'en', label: 'GB ENGLISH (UK)', flag: '🇬🇧', code: 'US-EN' },
                { id: 'am', label: 'ET አማርኛ (ET)', flag: '🇪🇹', code: 'ET-AM' }
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className={`group relative p-8 rounded-[2.5rem] border-4 transition-all duration-500 text-left overflow-hidden ${
                    lang === l.id 
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 scale-[1.02]' 
                      : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white hover:border-indigo-400'
                  }`}
                >
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl group-hover:scale-125 transition-transform">{l.flag}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${lang === l.id ? 'bg-white/20 border-white/30' : 'bg-slate-200 dark:bg-black/20 border-slate-300 dark:border-white/10 opacity-50'}`}>
                         {l.code}
                      </span>
                   </div>
                   <p className="text-sm font-black uppercase tracking-[0.1em]">{l.label}</p>
                   {lang === l.id && <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-2xl" />}
                </button>
              ))}
            </div>
          </div>

          {/* System Health Pulse */}
          <div className="bg-white dark:bg-[#0e1225] rounded-[3rem] border border-blue-50 dark:border-white/10 p-10 shadow-2xl shadow-blue-900/5 overflow-hidden group">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.8rem] bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20">
                  <HiServer className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-2xl text-blue-900 dark:text-white uppercase tracking-tighter">System Health</h4>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Real-time Node Status</p>
                </div>
              </div>
              <button className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-blue-600 hover:rotate-180 transition-all duration-700 shadow-inner">
                <HiRefresh className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
               {[
                 { label: 'API Gateway', status: 'Optimal', icon: HiStatusOnline, color: 'text-emerald-500' },
                 { label: 'Database Sync', status: '12ms Latency', icon: HiLightningBolt, color: 'text-blue-500' },
                 { label: 'Security Firewall', status: 'Shields Active', icon: HiShieldCheck, color: 'text-indigo-500' },
                 { label: 'Public Enrollment', status: settings.openEnrollment ? 'OPEN' : 'CLOSED', icon: HiAcademicCap, color: settings.openEnrollment ? 'text-emerald-500' : 'text-rose-500', toggle: true, key: 'openEnrollment' },
                 { label: 'Job Postings', status: settings.openJobs ? 'OPEN' : 'CLOSED', icon: HiBriefcase, color: settings.openJobs ? 'text-emerald-500' : 'text-rose-500', toggle: true, key: 'openJobs' },
                 { label: 'Social Activity', status: settings.openSocialEarnings ? 'OPEN' : 'CLOSED', icon: HiCash, color: settings.openSocialEarnings ? 'text-emerald-500' : 'text-rose-500', toggle: true, key: 'openSocialEarnings' },
                 { label: 'Public Signups', status: settings.allowSignups ? 'OPEN' : 'CLOSED', icon: HiUserAdd, color: settings.allowSignups ? 'text-emerald-500' : 'text-rose-500', toggle: true, key: 'allowSignups' },
                 { label: 'Gatekeeper Mode', status: settings.isMaintenance ? 'RESTRICTED' : 'PUBLIC', icon: HiExclamation, color: settings.isMaintenance ? 'text-rose-500' : 'text-emerald-500', toggle: true, key: 'isMaintenance' }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                       {item.icon && <item.icon className={`w-6 h-6 ${item.color}`} />}
                       <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{item.label || 'Node'}</span>
                    </div>
                    {item.toggle ? (
                      <button 
                        onClick={() => toggleSetting(item.key)}
                        className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${['OPEN', 'PUBLIC'].includes(item.status) ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-rose-600 text-white shadow-rose-600/20'}`}
                      >
                        {item.status}
                      </button>
                    ) : (
                      <span className={`text-[11px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                    )}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Security & Command Console */}
        <div className="space-y-10">
          <div className="bg-white dark:bg-[#0e1225] rounded-[3rem] border border-blue-50 dark:border-white/10 p-10 shadow-2xl shadow-blue-900/5">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 rounded-[1.8rem] bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-600/20">
                <HiLockClosed className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-2xl text-blue-900 dark:text-white uppercase tracking-tighter">Access Control</h4>
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Admin Override Mode</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                   <HiFingerPrint className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                   <input
                    type="password"
                    placeholder="NEW MASTER PASSCODE"
                    value={passwords.new}
                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                    className="w-full pl-20 pr-8 py-6 rounded-[2rem] bg-slate-50 dark:bg-black p-4 border-2 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-black placeholder:text-slate-300 outline-none focus:border-rose-500 transition-all text-sm uppercase tracking-widest"
                   />
                </div>
                <div className="relative">
                   <HiShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                   <input
                    type="password"
                    placeholder="CONFIRM MASTER PASSCODE"
                    value={passwords.confirm}
                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    className="w-full pl-20 pr-8 py-6 rounded-[2rem] bg-slate-50 dark:bg-black p-4 border-2 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-black placeholder:text-slate-300 outline-none focus:border-rose-500 transition-all text-sm uppercase tracking-widest"
                   />
                </div>
              </div>
              <button 
                disabled={loading}
                className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-rose-600 to-red-700 text-white font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-rose-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 "
              >
                {loading ? 'Initiating Encryption...' : 'Rotate Security Keys'}
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
             <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`p-8 rounded-[2.5rem] mb-8 border-4 transition-all duration-700 ${settings.isMaintenance ? 'bg-rose-500/20 border-rose-500 shadow-[0_0_80px_rgba(244,63,94,0.4)]' : 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.4)]'}`}>
                   <HiEyeOff className={`w-14 h-14 ${settings.isMaintenance ? 'text-rose-500' : 'text-emerald-500'}`} />
                </div>
                <h4 className="text-4xl font-black uppercase tracking-tighter mb-4 ">GateKeeper Console</h4>
                <p className="text-[10px] font-black text-blue-200/50 uppercase tracking-[0.3em] mb-10 leading-relaxed max-w-xs">Control public job availability and site-wide maintenance settings.</p>
                
                <button
                  onClick={() => toggleSetting('isMaintenance')}
                   className={`px-16 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[11px] transition-all shadow-2xl hover:scale-110 active:scale-95  ${
                     settings.isMaintenance 
                       ? 'bg-rose-600 text-white shadow-rose-900/60 hover:bg-rose-500' 
                       : 'bg-emerald-600 text-white shadow-emerald-900/60 hover:bg-emerald-500'
                   }`}
                >
                  {settings.isMaintenance ? 'Open Front Display' : 'Close Front Display'}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
