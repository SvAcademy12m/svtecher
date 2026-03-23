import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/ui/Spinner';
import { ROLES, ROLE_DASHBOARD_PATHS } from '../core/utils/constants';
import { HiShieldCheck, HiLockClosed } from 'react-icons/hi';
import { toast } from 'react-toastify';

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.ACCOUNTANT];
const ADMIN_PIN = '2026';

/** Protect routes by role(s) */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userData, loading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [adminUnlocked, setAdminUnlocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    let timer;
    if (!loading) {
      timer = setTimeout(() => setIsVerifying(false), 800);
    } else {
      setIsVerifying(true);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // Check sessionStorage for admin unlock
  useEffect(() => {
    if (sessionStorage.getItem('svtech_admin_verified') === 'true') {
      setAdminUnlocked(true);
    }
  }, []);

  if (loading || isVerifying) return <Spinner fullScreen text="Authenticating Matrix..." />;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userData?.role)) {
    const redirectPath = ROLE_DASHBOARD_PATHS[userData?.role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Admin Security Gate
  const isAdminRoute = allowedRoles.some(r => ADMIN_ROLES.includes(r));
  const isAdminUser = ADMIN_ROLES.includes(userData?.role);

  if (isAdminRoute && isAdminUser && !adminUnlocked) {
    const handlePinSubmit = (e) => {
      e.preventDefault();
      if (pinInput === ADMIN_PIN) {
        sessionStorage.setItem('svtech_admin_verified', 'true');
        setAdminUnlocked(true);
        setPinError(false);
        toast.success('Admin Access Granted');
      } else {
        setPinError(true);
        setPinInput('');
        toast.error('Invalid Security PIN');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 shadow-2xl shadow-blue-900/30 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-blue-600/30 mb-8">
              <HiShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Admin Vault</h2>
            <p className="text-[10px] font-black text-blue-400/70 uppercase tracking-[0.4em] mb-10">Restricted Security Checkpoint</p>
            
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="relative">
                <HiLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                  placeholder="Enter Security PIN (Hint: 2026)"
                  className={`w-full bg-white/5 border ${pinError ? 'border-rose-500 animate-shake' : 'border-white/10'} text-white text-center text-2xl font-black tracking-[0.5em] p-5 rounded-2xl outline-none focus:border-blue-500 placeholder:text-white/30 placeholder:text-sm placeholder:tracking-widest transition-all`}
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 hover:brightness-110 transition-all active:scale-[0.98]"
              >
                Verify & Access
              </button>
            </form>
            
            <p className="text-[9px] font-bold text-white/20 mt-8 uppercase tracking-widest">Session-Locked • SVTech Security Protocol</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

