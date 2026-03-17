import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { HiArrowRight, HiAcademicCap, HiBriefcase, HiDesktopComputer, HiShoppingCart, HiShieldCheck, HiArrowLeft } from 'react-icons/hi';
import { registerUser, socialLogin } from '../../core/services/authService';
import { ROLES, ROLE_DASHBOARD_PATHS } from '../../core/utils/constants';
import { toast } from 'react-toastify';

const ROLE_CARDS = [
  { id: ROLES.STUDENT, title: 'STUDENT', icon: HiAcademicCap, desc: 'Courses & Tech Training', color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20' },
  { id: ROLES.CUSTOMER, title: 'BUYER', icon: HiShoppingCart, desc: 'Software & Digital Tools', color: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/20' },
  { id: ROLES.JOB_FINDER, title: 'JOB FINDER', icon: HiBriefcase, desc: 'Enterprise Tech Roles', color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
  { id: ROLES.TRAINER, title: 'INSTRUCTOR', icon: HiDesktopComputer, desc: 'Publish & Teach Tech', color: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-500/20' },
];

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: location.state?.defaultRole || ROLES.STUDENT, skills: '', phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validateStep2 = () => {
    if (!form.name.trim()) { toast.error('Full name is required'); return false; }
    if (!form.email.includes('@')) { toast.error('Valid email is required'); return false; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    if (!validateStep2()) return;

    setLoading(true);
    try {
      await registerUser(form.email, form.password, form);
      toast.success('Welcome to SVTECH Digital Technology!');
      const redirectPath = location.state?.returnUrl || ROLE_DASHBOARD_PATHS[form.role] || '/';
      navigate(redirectPath);
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    try {
      await socialLogin(provider);
      toast.success('Social authentication successful');
      const redirectPath = location.state?.returnUrl || '/';
      navigate(redirectPath);
    } catch {
      toast.error('Social login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative z-10"
      >
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-700 to-indigo-900 text-white relative">
           <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
           
           <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl">
                  <span className="text-blue-700 font-black text-xl italic">SV</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-widest leading-none">SVTECH</span>
                  <span className="text-[10px] font-black tracking-[0.4em] text-white/60">DIGITAL</span>
                </div>
              </div>

              <h2 className="text-5xl font-black leading-[1.1] tracking-tighter italic">
                CRAFTING <br />
                <span className="text-cyan-400">DIGITAL</span> <br />
                EXCELLENCE.
              </h2>
              <p className="mt-8 text-blue-100 text-lg leading-relaxed max-w-xs font-medium">
                Join the most advanced tech ecosystem in Ethiopia and transform your digital future.
              </p>
           </div>

           <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-cyan-400 transition-colors">
                  <HiShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-white/80">Secure Platform</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-cyan-400 transition-colors">
                  <HiLightBulb className="w-6 h-6" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-white/80">Innovation Ready</span>
              </div>
           </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] block text-center w-full">PROTOCOL: STEP {step}/2</span>
            </div>
            {step === 2 && (
              <button onClick={() => setStep(1)} className="mb-4 text-xs font-black text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase tracking-widest">
                <HiArrowLeft /> BACK TO SELECTION
              </button>
            )}
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase text-center">
              {step === 1 ? "CHOOSE YOUR PATH" : "INITIALIZE IDENTITY"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {ROLE_CARDS.map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setForm({ ...form, role: role.id })}
                      className={`flex flex-col items-start gap-4 p-5 rounded-[2rem] border-2 transition-all duration-500 text-left ${
                        form.role === role.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-2xl shadow-blue-600/10 scale-[1.02]'
                          : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${role.color} flex items-center justify-center text-white shadow-xl ${role.shadow}`}>
                        <role.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-black tracking-widest transition-colors ${form.role === role.id ? 'text-blue-700' : 'text-slate-950'}`}>
                          {role.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase leading-none">{role.desc}</p>
                      </div>
                    </button>
                  ))}
                  <button 
                    type="submit" 
                    className="col-span-1 sm:col-span-2 mt-4 py-5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black uppercase tracking-[0.3em] text-sm shadow-xl shadow-blue-700/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    CONTINUE <HiArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">FULL NAME IDENTITY</label>
                    <input
                      name="name" type="text" value={form.name} onChange={handleChange} required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                      placeholder="ENTER FULL NAME"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">SECURE EMAIL INTERFACE</label>
                    <input
                      name="email" type="email" value={form.email} onChange={handleChange} required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                      placeholder="EMAIL@DOMAIN.COM"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">ENCRYPTED PASSWORD</label>
                    <div className="relative">
                      <input
                        name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300 pr-14"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black uppercase tracking-[0.3em] text-sm shadow-xl shadow-blue-700/30 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 mt-4"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>INITIALIZE ACCESS <FaCheck className="w-4 h-4" /></>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {step === 1 && (
            <div className="mt-10">
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <span className="relative px-4 bg-white text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">SECURE SOCIAL CONNECT</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleSocialLogin('google')} disabled={loading} className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                  <FaGoogle className="text-rose-500 text-lg" /> Google
                </button>
                <button onClick={() => handleSocialLogin('facebook')} disabled={loading} className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                  <FaFacebook className="text-blue-600 text-lg" /> Facebook
                </button>
              </div>
            </div>
          )}

          <div className="mt-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              ALREADY VERIFIED? <Link to="/login" className="text-blue-700 font-black hover:underline ml-2">LOGIN INTERFACE</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
