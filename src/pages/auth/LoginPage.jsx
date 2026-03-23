import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash, FaGithub, FaLinkedin } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import { loginUser, socialLogin, resetPassword, getAuthErrorMessage } from '../../core/services/authService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/redirect', { replace: true });
    }
  }, [user, navigate]);

  const handleResetPassword = async () => {
    if (!email.includes('@')) {
      toast.warning('Please enter your email address to reset password.');
      return;
    }
    setResetting(true);
    try {
      await resetPassword(email);
      toast.success('Password reset email sent! Please check your inbox.');
      setShowForgot(false);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setResetting(false);
    }
  };

  const validateForm = () => {
    if (!email.includes('@')) {
      toast.error(t('language') === 'am' ? 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ' : 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      toast.error(t('language') === 'am' ? 'የይለፍ ቃሉ ቢያንስ 6 ቁምፊ ሊሆን ይገባል' : 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await loginUser(email, password);
      toast.success('Welcome back!');
      const redirectPath = location.state?.returnUrl || '/redirect';
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
      await socialLogin(provider);
      toast.success('Signed in successfully!');
      const redirectPath = location.state?.returnUrl || '/redirect';
      navigate(redirectPath);
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 mt-20 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-lg"
      >
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute -top-20 -left-20 w-56 h-56 bg-cyan-400/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-indigo-400/20 blur-[80px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-xl mb-5">
              <span className="text-blue-700 font-black text-xl">SV</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">{t('welcomeBack')}</h1>
            <p className="text-blue-100/70 font-medium text-sm">{t('signInAccount')}</p>
          </div>

          {showForgot ? (
            <div className="space-y-5 relative z-10 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-6 text-white pt-4">
                <h2 className="text-2xl font-black mb-2">Reset Password</h2>
                <p className="text-sm text-blue-100/70 font-medium">Enter your email and we'll send you a link to reset your password.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-200 mb-2 ml-1">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-blue-300/50 outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50 transition-all font-medium"
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetting || !email}
                className="w-full py-4 rounded-xl bg-cyan-500 text-white font-black text-sm shadow-xl hover:bg-cyan-400 transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {resetting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full text-center text-xs font-bold text-blue-300 hover:text-white transition-colors mt-2 pb-4"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10 animate-in fade-in duration-300">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-blue-200 mb-2 ml-1">{t('email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-blue-300/50 outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50 transition-all font-medium"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-xs font-bold text-blue-200">{t('password')}</label>
                    <button 
                      type="button" 
                      onClick={() => setShowForgot(true)}
                      className="text-[10px] font-bold text-cyan-400 hover:text-white transition-colors tracking-wide"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-blue-300/50 outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50 transition-all font-medium pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-white text-blue-900 font-black text-sm shadow-xl hover:bg-cyan-400 hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin" />
                  ) : (
                    <>{t('signIn')} <HiArrowRight size={18} /></>
                  )}
                </button>
              </form>

              {/* Social Auth */}
              <div className="mt-8 relative z-10">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <span className="relative px-4 bg-[#1e3a8a] text-[10px] font-bold text-blue-200 uppercase tracking-widest rounded-full border border-white/10">
                    {t('orContinueWith')}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { provider: 'google', icon: FaGoogle, label: 'Google', color: 'text-rose-400' },
                    { provider: 'facebook', icon: FaFacebook, label: 'Facebook', color: 'text-blue-400' },
                    { provider: 'github', icon: FaGithub, label: 'GitHub', color: 'text-white' },
                    { provider: 'linkedin', icon: FaLinkedin, label: 'LinkedIn', color: 'text-blue-300' },
                  ].map(({ provider, icon: Icon, label, color }) => (
                    <button
                      key={provider}
                      onClick={() => handleSocialLogin(provider)}
                      disabled={loading}
                      className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wide hover:bg-white hover:text-blue-900 transition-all group"
                    >
                      <Icon className={`text-base ${color} group-hover:text-current`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center relative z-10">
                <p className="text-sm font-medium text-blue-200/70">
                  {t('dontHaveAccount')}{' '}
                  <Link to="/register" className="text-white font-black hover:text-cyan-400 transition-colors underline underline-offset-4">
                    {t('signUpNow')}
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
