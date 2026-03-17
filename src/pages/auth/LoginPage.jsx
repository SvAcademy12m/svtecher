import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import { loginUser, socialLogin } from '../../core/services/authService';
import { toast } from 'react-toastify';

const LoginPage = () => {
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
      navigate('/redirect');
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
      navigate('/redirect');
    } catch (err) {
      toast.error('Social login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-20 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[120px]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-2xl relative overflow-hidden group">
          {/* Internal Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 blur-[60px] group-hover:bg-blue-500/30 transition-colors duration-700" />
          
          {/* Header */}
          <div className="text-center mb-10 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6 transform hover:rotate-6 transition-transform">
              <span className="text-white font-black text-xl italic">SV</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-500 font-medium tracking-tight">Access your digital domain</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Account Identifier</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Security Key</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative group/btn overflow-hidden rounded-2xl p-[1px] font-black text-sm uppercase tracking-widest disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative py-4 bg-[#111] rounded-[0.95rem] flex items-center justify-center gap-3 group-hover/btn:bg-transparent transition-colors text-white">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Initialize Access <HiArrowRight size={18} />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] bg-white px-4 mx-auto w-fit">
              Social Auth
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-blue-200 transition-all shadow-sm"
            >
              <FaGoogle className="text-rose-500 text-lg" /> Google
            </button>
            <button
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
              className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-blue-200 transition-all shadow-sm"
            >
              <FaFacebook className="text-blue-600 text-lg" /> Facebook
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-10 font-medium">
            New to the frontier?{' '}
            <Link to="/register" className="text-blue-400 font-black hover:text-cyan-400 transition-colors uppercase tracking-widest">
              Create ID
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
