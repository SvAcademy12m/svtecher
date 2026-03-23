import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash, FaGithub, FaLinkedin, FaCheck } from 'react-icons/fa';
import { HiArrowRight, HiAcademicCap, HiBriefcase, HiDesktopComputer, HiShoppingCart, HiShieldCheck, HiArrowLeft, HiLightBulb, HiGift, HiUserAdd, HiCog, HiOfficeBuilding } from 'react-icons/hi';
import { registerUser, socialLogin, getAuthErrorMessage } from '../../core/services/authService';
import { systemService } from '../../core/services/firestoreService';
import { ROLES, ROLE_DASHBOARD_PATHS } from '../../core/utils/constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { db } from '../../core/firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const ROLE_CARDS = [
  { id: ROLES.STUDENT, title: 'Student', icon: HiAcademicCap, desc: 'Courses & Tech Training', color: 'from-blue-600 to-indigo-600' },
  { id: ROLES.CUSTOMER, title: 'Buyer', icon: HiShoppingCart, desc: 'Software & Digital Tools', color: 'from-cyan-500 to-blue-500' },
  { id: ROLES.SELLER, title: 'Seller', icon: HiUserAdd, desc: 'Sell Digital Products', color: 'from-amber-500 to-orange-500' },
  { id: ROLES.JOB_FINDER, title: 'Job Seeker', icon: HiBriefcase, desc: 'Find Tech Jobs', color: 'from-emerald-500 to-teal-500' },
  { id: ROLES.EMPLOYER, title: 'Job Owner', icon: HiOfficeBuilding, desc: 'Post & Hire Writers', color: 'from-blue-500 to-cyan-500' },
  { id: ROLES.TRAINER, title: 'Instructor', icon: HiDesktopComputer, desc: 'Teach & Publish Courses', color: 'from-purple-600 to-pink-600' },
  { id: ROLES.SUPPORT, title: 'Support', icon: HiShieldCheck, desc: 'Technical & Maintenance', color: 'from-rose-500 to-red-500' },
  { id: ROLES.ADMIN, title: 'Administrator', icon: HiCog, desc: 'System Operation Phase', color: 'from-slate-700 to-slate-900' },
];

const getPasswordStrength = (password) => {
  if (!password) return { label: '', color: 'bg-white/20', percent: 0 };
  let score = 0;
  if (password.length > 5) score += 1;
  if (password.length > 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', ptColor: 'text-rose-400', percent: 25 };
  if (score === 2 || score === 3) return { label: 'Fair', color: 'bg-amber-400', ptColor: 'text-amber-400', percent: 50 };
  if (score === 4) return { label: 'Good', color: 'bg-blue-400', ptColor: 'text-blue-400', percent: 75 };
  return { label: 'Strong', color: 'bg-emerald-500', ptColor: 'text-emerald-400', percent: 100 };
};

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [systemSettings, setSystemSettings] = useState(null);
  const getReferralCode = () => {
    const urlRef = searchParams.get('ref');
    if (urlRef) return urlRef;
    const stored = localStorage.getItem('svtech_referral');
    if (stored) {
      try {
        const { code, expiry } = JSON.parse(stored);
        if (new Date().getTime() < expiry) return code;
        localStorage.removeItem('svtech_referral');
      } catch (e) { }
    }
    return null;
  };

  const refCode = getReferralCode();
  
  useEffect(() => {
    return systemService.subscribe(setSystemSettings);
  }, []);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/redirect', { replace: true });
    }
  }, [user, navigate]);

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: location.state?.defaultRole || ROLES.STUDENT, skills: '', phone: '', location: '',
  });
  const [referralInput, setReferralInput] = useState(refCode || 'svtecher.com');
  const [referrerName, setReferrerName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Lookup referrer name when ?ref= is present
  useEffect(() => {
    if (!refCode) return;
    const lookupReferrer = async () => {
      try {
        let q = query(collection(db, 'users'), where('uid', '==', refCode));
        let snap = await getDocs(q);
        if (snap.empty) {
           q = query(collection(db, 'users'), where('referralCode', '==', refCode));
           snap = await getDocs(q);
        }
        if (!snap.empty) {
          setReferrerName(snap.docs[0].data().name || 'a friend');
        }
      } catch (_) {}
    };
    lookupReferrer();
  }, [refCode]);

  const resolveReferralTarget = async (code) => {
    if (!code || code === 'svtecher.com' || code === 'svtech.com') return code;
    try {
      let q = query(collection(db, 'users'), where('uid', '==', code));
      let snap = await getDocs(q);
      if (!snap.empty) return snap.docs[0].id;
      
      q = query(collection(db, 'users'), where('referralCode', '==', code));
      snap = await getDocs(q);
      if (!snap.empty) return snap.docs[0].id;
    } catch (_) {}
    return code; 
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validateStep2 = () => {
    if (!form.name.trim()) { toast.error('Full name is required'); return false; }
    if (!form.email.includes('@')) { toast.error('Valid email is required'); return false; }
    if (!form.phone.trim()) { toast.error('Phone number is required'); return false; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    if (form.role === ROLES.SUPPORT && !form.location.trim()) { toast.error('Location is required for Support role'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const actualReferrerUid = await resolveReferralTarget(referralInput || null);
      await registerUser(form.email, form.password, form, actualReferrerUid);
      toast.success('Welcome to SVTECH! Your account is ready.');
      const redirectPath = location.state?.returnUrl || ROLE_DASHBOARD_PATHS[form.role] || '/';
      navigate(redirectPath);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    try {
      const actualReferrerUid = await resolveReferralTarget(referralInput || null);
      await socialLogin(provider, actualReferrerUid);
      toast.success('Account created successfully!');
      const redirectPath = location.state?.returnUrl || '/dashboard';
      navigate(redirectPath);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (systemSettings && systemSettings.allowSignups === false) {
    return (
      <div className="flex-1 mt-20 min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#0e1225] p-10 rounded-[3rem] shadow-2xl text-center max-w-lg border border-rose-100 dark:border-white/10">
           <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-100 dark:border-rose-900/20">
              <HiLockClosed className="w-12 h-12 text-rose-500" />
           </div>
           <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Signups Closed</h2>
           <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-10 uppercase text-xs tracking-widest">
              SVTECH is currently updating its security protocol. Public registrations are temporarily restricted. Please contact us or try again later.
           </p>
           <button onClick={() => navigate('/')} className="w-full py-5 bg-gradient-to-r from-blue-700 to-indigo-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-blue-700/20">Return to Grid</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 mt-20 min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10"
      >
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-700 to-indigo-900 text-white relative">
          <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-xl">
                <span className="text-blue-700 font-black text-lg">SV</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-widest leading-none">SVTECH</span>
                <span className="text-[10px] font-bold tracking-[0.4em] text-white/60">DIGITAL</span>
              </div>
            </div>

            <h2 className="text-4xl font-black leading-[1.15] tracking-tight">
              Join Ethiopia's<br />
              <span className="text-cyan-400">Digital</span><br />
              Community.
            </h2>
            <p className="mt-6 text-blue-100 text-base leading-relaxed max-w-xs font-medium">
              Learn, work, and grow with thousands of tech professionals across Ethiopia.
            </p>

            {/* Referral Banner */}
            {refCode && (
              <div className="mt-6 flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                <HiGift className="w-5 h-5 text-yellow-300 shrink-0" />
                <p className="text-sm font-bold text-white">
                  {referrerName ? `${referrerName} invited you!` : 'You were referred by a friend!'} <span className="text-cyan-300">Sign up to join.</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <HiShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-white/80">Secure &amp; Safe Platform</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <HiLightBulb className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-white/80">World-Class Tech Training</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-7 sm:p-10 flex flex-col justify-center bg-gradient-to-br from-blue-700 to-indigo-900 text-white relative">
          <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
          <div className="relative z-10">
            {/* Step Indicator */}
            <div className="mb-7 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className={`w-8 h-2 rounded-full transition-all ${step >= 1 ? 'bg-white' : 'bg-white/20'}`} />
                <div className={`w-8 h-2 rounded-full transition-all ${step >= 2 ? 'bg-white' : 'bg-white/20'}`} />
              </div>
              <p className="text-[11px] font-bold text-blue-300 uppercase tracking-widest">
                Step {step} of 2 — {step === 1 ? 'Choose Your Role' : 'Create Account'}
              </p>
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="mt-2 text-xs font-bold text-blue-300/70 hover:text-white flex items-center gap-1 mx-auto"
                >
                  <HiArrowLeft className="w-3 h-3" /> Back
                </button>
              )}
              <h1 className="text-2xl font-black text-white tracking-tight mt-2">
                {step === 1 ? 'What describes you best?' : 'Your Details'}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {ROLE_CARDS.map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setForm({ ...form, role: role.id })}
                        className={`flex flex-col items-start gap-3 p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                          form.role === role.id
                            ? 'border-white bg-white/20 shadow-xl scale-[1.02]'
                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-700 shadow-lg">
                          <role.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">{role.title}</h4>
                          <p className="text-[10px] text-blue-200/70 font-medium mt-0.5">{role.desc}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      type="submit"
                      className="col-span-2 mt-2 py-4 rounded-2xl bg-white text-blue-900 hover:bg-cyan-400 hover:text-white font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Continue <HiArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="space-y-4"
                  >
                    {/* Mobile referral banner */}
                    {refCode && (
                      <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 lg:hidden">
                        <HiGift className="w-4 h-4 text-yellow-300 shrink-0" />
                        <p className="text-xs font-bold text-white">
                          {referrerName ? `Invited by ${referrerName}` : 'You have a referral bonus!'}
                        </p>
                      </div>
                    )}

                    {/* Referral Code Input */}
                    <div>
                      <label className="block text-xs font-bold text-blue-200 mb-1.5 ml-1">Referral Code</label>
                      <div className="relative">
                        <HiGift className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 w-4 h-4" />
                        <input
                          type="text"
                          value={referralInput}
                          onChange={(e) => setReferralInput(e.target.value)}
                          className="w-full bg-white/10 border border-yellow-400/30 rounded-xl pl-10 pr-4 py-3 text-white font-medium placeholder-blue-300/40 focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400/50 outline-none transition-all"
                          placeholder="svtecher.com"
                        />
                      </div>
                      {referralInput && (
                        <p className="text-[10px] font-bold text-yellow-300/80 mt-1.5 ml-1 flex items-center gap-1">
                          <HiGift className="w-3 h-3" /> You'll receive 20 Birr bonus on signup!
                        </p>
                      )}
                    </div>


                    <div>
                      <label className="block text-xs font-bold text-blue-200 mb-1.5 ml-1">{t('fullName')}</label>
                      <input
                        name="name" type="text" value={form.name} onChange={handleChange} required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-medium placeholder-blue-300/40 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/50 outline-none transition-all"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-200 mb-1.5 ml-1">{t('email')}</label>
                      <input
                        name="email" type="email" value={form.email} onChange={handleChange} required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-medium placeholder-blue-300/40 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/50 outline-none transition-all"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-200 mb-1.5 ml-1">{t('phone') || 'Phone Number'}</label>
                      <input
                        name="phone" type="tel" value={form.phone} onChange={handleChange} required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-medium placeholder-blue-300/40 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/50 outline-none transition-all"
                        placeholder="+251 900 000 000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-200 mb-1.5 ml-1">{t('password')}</label>
                      <div className="relative mb-2">
                        <input
                          name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-medium placeholder-blue-300/40 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/50 outline-none transition-all pr-12"
                          placeholder="At least 6 characters"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors">
                          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {form.password.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="px-1 mt-1 overflow-hidden"
                          >
                            <div className="flex justify-between items-center mb-1.5 pl-1">
                              <span className="text-[10px] font-bold text-blue-300/70 tracking-wide">Password Strength</span>
                              <span className={`text-[10px] font-black uppercase tracking-wider ${getPasswordStrength(form.password).ptColor}`}>
                                {getPasswordStrength(form.password).label}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className={`h-full transition-all duration-500 ${getPasswordStrength(form.password).color}`}
                                style={{ width: `${getPasswordStrength(form.password).percent}%` }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {form.role === ROLES.SUPPORT && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-xs font-bold text-blue-200 mb-1.5 ml-1">Assigned Location</label>
                        <input
                          name="location" type="text" value={form.location} onChange={handleChange} required
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-medium placeholder-blue-300/40 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/50 outline-none transition-all"
                          placeholder="e.g. Addis Ababa, Bole"
                        />
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-white text-blue-900 hover:bg-cyan-400 hover:text-white font-black text-sm shadow-xl transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin" />
                      ) : (
                        <>{t('createAccount')} <FaCheck className="w-4 h-4" /></>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Social Login */}
            {step === 1 && (
              <div className="mt-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#1a2e5e] px-3 text-[10px] font-bold text-blue-300 uppercase tracking-widest rounded-full border border-white/10">
                      {t('orContinueWith')}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { p: 'google', icon: FaGoogle, label: 'Google', cls: 'text-rose-400' },
                    { p: 'facebook', icon: FaFacebook, label: 'Facebook', cls: 'text-blue-400' },
                    { p: 'github', icon: FaGithub, label: 'GitHub', cls: 'text-white' },
                    { p: 'linkedin', icon: FaLinkedin, label: 'LinkedIn', cls: 'text-sky-300' },
                  ].map(({ p, icon: Icon, label, cls }) => (
                    <button key={p} type="button" onClick={() => handleSocialLogin(p)} disabled={loading}
                      className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wide hover:bg-white hover:text-blue-900 transition-all group">
                      <Icon className={`text-base ${cls} group-hover:text-current`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm font-medium text-blue-200/70">
                {t('alreadyHaveAccount')}{' '}
                <Link to="/login" className="text-white font-black hover:text-cyan-400 transition-colors underline underline-offset-4">
                  {t('signIn')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
