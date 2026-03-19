import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash, FaGithub, FaLinkedin } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import { loginUser, socialLogin } from '../../core/services/authService';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
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
      toast.success('Access granted. Welcome back!');
      const redirectPath = location.state?.returnUrl || '/redirect';
      navigate(redirectPath);
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    try {
      await socialLogin(provider);
      toast.success('Social authentication successful');
      const redirectPath = location.state?.returnUrl || '/redirect';
      navigate(redirectPath);
    } catch (err) {
      toast.error('Social login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 mt-20 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[120px]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-lg"
      >
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3rem] p-10 sm:p-14 shadow-[0_32px_64px_-16px_rgba(30,58,138,0.3)] relative overflow-hidden group border border-white/10">
          {/* Decorative Internal Glows */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-400/20 blur-[80px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-400/20 blur-[80px] rounded-full" />
          
          {/* Header */}
          <div className="text-center mb-12 relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-white mx-auto flex items-center justify-center shadow-2xl mb-8 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <span className="text-blue-700 font-black text-2xl italic tracking-tighter">SV</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-3 uppercase italic">Access Terminal</h1>
            <p className="text-blue-100/60 font-bold uppercase tracking-[0.3em] text-[10px]">Initialize Secure Session</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 relative z-10 font-bold">
            <div>
              <label className="block text-[10px] font-black text-blue-200 mb-2 uppercase tracking-[0.2em] ml-1">Identity Protocol (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="USER@DOMAIN.COM"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-blue-300/40 outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/40 transition-all font-black"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-blue-200 mb-2 uppercase tracking-[0.2em] ml-1">Security Key (Password)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-blue-300/40 outline-none focus:ring-4 focus:ring-cyan-400/20 focus:border-cyan-400/40 transition-all font-black pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 rounded-[2rem] bg-white text-blue-900 font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:bg-cyan-400 hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin" />
              ) : (
                <>
                  Connect <HiArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Section */}
          <div className="mt-12 relative z-10">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <span className="relative px-4 bg-[#1e3a8a] text-[9px] font-black text-blue-200 uppercase tracking-[0.4em] rounded-full border border-white/5">
                Legacy Connect
              </span>
            </div>
            {/* Social buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-blue-900 transition-all group"
            >
              <FaGoogle className="text-rose-400 text-lg group-hover:text-rose-500" /> Google
            </button>
            <button
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
              className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-blue-900 transition-all group"
            >
              <FaFacebook className="text-blue-400 text-lg group-hover:text-blue-600" /> Facebook
            </button>
            <button
              onClick={() => handleSocialLogin('github')}
              disabled={loading}
              className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-blue-900 transition-all group"
            >
              <FaGithub className="text-white text-lg group-hover:text-slate-900" /> GitHub
            </button>
            <button
              onClick={() => handleSocialLogin('linkedin')}
              disabled={loading}
              className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-blue-900 transition-all group"
            >
              <FaLinkedin className="text-blue-300 text-lg group-hover:text-blue-700" /> LinkedIn
            </button>
          </div>
          </div>

          <div className="mt-12 text-center relative z-10">
            <p className="text-xs font-bold text-blue-200/60 uppercase tracking-widest">
              Unregistered Identity?{' '}
              <Link to="/register" className="text-white font-black hover:text-cyan-400 transition-colors ml-2 underline underline-offset-4">
                Initialize ID
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
