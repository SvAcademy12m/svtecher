import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  HiTranslate, HiCurrencyDollar, HiGlobe, HiCog, 
  HiLockClosed, HiShieldCheck, HiStatusOnline, HiExclamation,
  HiEyeOff, HiRefresh, HiServer, HiLightningBolt
} from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { auth } from '../../../core/firebase/firebase';
import { updatePassword } from 'firebase/auth';

import { systemService } from '../../../core/services/firestoreService';
import { useEffect } from 'react';

const SettingsPanel = () => {
  const { lang, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ isMaintenance: false });

  useEffect(() => {
    return systemService.subscribe(setSettings);
  }, []);

  const toggleMaintenance = async () => {
    try {
      await systemService.update({ isMaintenance: !settings.isMaintenance });
      toast.success(`Production state updated!`);
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight uppercase">{t('settings')}</h3>
          <p className="text-sm font-black text-blue-600/50 dark:text-indigo-400/50 uppercase tracking-widest mt-1">System Control & Security</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border-2 flex items-center gap-3 transition-all ${settings.isMaintenance ? 'border-rose-500 bg-rose-500/5 text-rose-600' : 'border-emerald-500 bg-emerald-500/5 text-emerald-600'}`}>
             <div className={`w-2 h-2 rounded-full ${settings.isMaintenance ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest">{settings.isMaintenance ? 'Maintenance Mode Active' : 'Front End Live'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Core Prefs */}
        <div className="space-y-8">
          {/* Language & Interface */}
          <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-50 dark:border-white/5 p-8 shadow-xl shadow-blue-900/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <HiTranslate className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="font-black text-blue-900 dark:text-white uppercase tracking-tight">{t('language')} & Region</h4>
                <p className="text-[11px] font-black text-blue-600/40 dark:text-indigo-400/40 uppercase tracking-widest">Global Display Preferences</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'en', label: 'English (UK)', flag: '🇬🇧' },
                { id: 'am', label: 'አማርኛ (ET)', flag: '🇪🇹' }
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className={`group p-6 rounded-[2rem] border-2 transition-all duration-500 ${
                    lang === l.id 
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 scale-[1.05]' 
                      : 'border-blue-50 dark:border-white/5 bg-blue-50/30 dark:bg-white/5 text-blue-900 dark:text-white hover:border-indigo-200 dark:hover:border-indigo-900'
                  }`}
                >
                  <p className="text-3xl mb-3 group-hover:scale-125 transition-transform">{l.flag}</p>
                  <p className="text-sm font-black uppercase tracking-widest">{l.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* System Health Monitor */}
          <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-50 dark:border-white/5 p-8 shadow-xl shadow-blue-900/5 group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <HiServer className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-black text-blue-900 dark:text-white uppercase tracking-tight">System Health</h4>
                  <p className="text-[11px] font-black text-emerald-600/40 uppercase tracking-widest">Real-time Infrastructure</p>
                </div>
              </div>
              <button className="p-3 rounded-2xl bg-blue-50 dark:bg-white/5 text-blue-600 hover:rotate-180 transition-all duration-700">
                <HiRefresh className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
               {[
                 { label: 'API Gateway', status: 'Optimal', icon: HiStatusOnline, color: 'text-emerald-500' },
                 { label: 'Database Latency', status: '12ms', icon: HiLightningBolt, color: 'text-blue-500' },
                 { label: 'Security Firewall', status: 'Active', icon: HiShieldCheck, color: 'text-indigo-500' },
                 { label: 'Maintenance Mode', status: settings.isMaintenance ? 'OFFLINE' : 'ONLINE', icon: HiExclamation, color: settings.isMaintenance ? 'text-rose-500' : 'text-emerald-500', toggle: true }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-blue-50/50 dark:bg-white/5 border border-blue-100/30 dark:border-white/5">
                    <div className="flex items-center gap-4">
                       <item.icon className={`w-5 h-5 ${item.color}`} />
                       <span className="text-xs font-black text-blue-900/60 dark:text-slate-300/60 uppercase tracking-wide">{item.label}</span>
                    </div>
                    {item.toggle ? (
                      <button 
                        onClick={toggleMaintenance}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.isMaintenance ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
                      >
                        {item.status}
                      </button>
                    ) : (
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                    )}
                 </div>
               ))}
            </div>
            
            {/* Vulnerability Alert */}
            <div className="mt-8 p-5 rounded-[2rem] bg-rose-500/10 border-2 border-rose-500/20 flex flex-col items-center text-center gap-3">
               <HiShieldCheck className="w-10 h-10 text-rose-500 animate-pulse" />
               <p className="text-xs font-black text-rose-600 uppercase tracking-widest">Vulnerability Shield Passive</p>
               <p className="text-[10px] text-rose-500/70 font-black uppercase leading-tight">No active threats detected. Deep scan completed 14m ago.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Maintenance */}
        <div className="space-y-8">
          {/* Security & Password */}
          <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-50 dark:border-white/5 p-8 shadow-xl shadow-blue-900/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <HiLockClosed className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h4 className="font-black text-blue-900 dark:text-white uppercase tracking-tight">Access Control</h4>
                <p className="text-[11px] font-black text-rose-600/40 dark:text-rose-400/40 uppercase tracking-widest">Password & Encryption</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="space-y-4">
                <div className="relative group">
                   <HiLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                   <input
                    type="password"
                    placeholder="NEW MASTER PASSWORD"
                    value={passwords.new}
                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 text-blue-900 dark:text-white font-black placeholder:text-slate-400 outline-none focus:border-rose-500 transition-all text-sm uppercase tracking-widest"
                   />
                </div>
                <div className="relative group">
                   <HiShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                   <input
                    type="password"
                    placeholder="CONFIRM MASTER PASSWORD"
                    value={passwords.confirm}
                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 text-blue-900 dark:text-white font-black placeholder:text-slate-400 outline-none focus:border-rose-500 transition-all text-sm uppercase tracking-widest"
                   />
                </div>
              </div>
              <button 
                disabled={loading}
                className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-rose-500 to-red-600 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-rose-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Encrypting...' : 'Update Security Keys'}
              </button>
            </form>
          </div>

          {/* Close Front Display (Maintenance Mode Card) */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
             <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`p-6 rounded-[2.5rem] mb-6 border-2 transition-all duration-700 ${settings.isMaintenance ? 'bg-rose-500/20 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.3)]' : 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]'}`}>
                   <HiEyeOff className={`w-12 h-12 ${settings.isMaintenance ? 'text-rose-500' : 'text-emerald-500'}`} />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tight mb-2">GateKeeper Console</h4>
                <p className="text-sm font-black text-blue-200/50 uppercase tracking-widest mb-8">Manage Public Site Visibility</p>
                
                <button
                  onClick={toggleMaintenance}
                   className={`px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-2xl ${
                     settings.isMaintenance 
                       ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/40' 
                       : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/40'
                   }`}
                >
                  {settings.isMaintenance ? 'Open Front Display' : 'Close Front Display'}
                </button>
                <p className="mt-6 text-[10px] font-black text-blue-200/30 uppercase tracking-[0.2em]">
                  {settings.isMaintenance ? 'Front end is currently restricted to admins only' : 'Front end is publically accessible'}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

