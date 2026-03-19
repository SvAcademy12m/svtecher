import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiPhone, HiIdentification, HiPencilAlt, HiCheck, HiX, HiShare, HiChartBar, HiClipboardCopy } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../core/services/firestoreService';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { userData, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name || '',
        bio: userData.bio || '',
        phone: userData.phone || '',
      });
    }
  }, [userData]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.update(user.uid, form);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const copyReferral = () => {
    const link = `${window.location.origin}/register?ref=${user?.uid}`;
    navigator.clipboard.writeText(link);
    toast.info('Referral link copied!');
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1 shadow-2xl">
              <div className="w-full h-full rounded-[2.3rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black italic">
                {userData?.name ? userData.name.charAt(0) : <HiUser />}
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic">{userData?.name || 'TECHNICIAN'}</h1>
                <span className="px-4 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-[0.2em] self-center">
                  {userData?.role || 'User'}
                </span>
              </div>
              <p className="text-blue-100/80 font-medium max-w-xl line-clamp-2">
                {userData?.bio || "No bio set. Initialize your digital identity to stand out in the SVTECH ecosystem."}
              </p>
            </div>

            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-3 rounded-2xl bg-white text-blue-700 font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 flex items-center gap-2"
            >
              {isEditing ? <><HiX /> Cancel</> : <><HiPencilAlt /> Edit Bio</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {isEditing ? (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleUpdate} 
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl"
              >
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                  <HiIdentification className="text-blue-600" /> Identity Management
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={form.name} 
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Professional Bio</label>
                    <textarea 
                      rows="4"
                      value={form.bio} 
                      onChange={(e) => setForm({...form, bio: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all resize-none"
                      placeholder="Tell the community about your expertise..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Phone Protocol</label>
                    <input 
                      type="text" 
                      value={form.phone} 
                      onChange={(e) => setForm({...form, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-5 rounded-[2rem] bg-blue-700 hover:bg-blue-800 text-white font-black uppercase tracking-[0.3em] text-sm shadow-xl shadow-blue-700/30 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? 'Initializing...' : <><HiCheck className="w-5 h-5" /> Save Changes</>}
                  </button>
                </div>
              </motion.form>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Base Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <HiMail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Email Interface</p>
                      <p className="font-bold text-slate-900 mt-1">{userData?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                      <HiPhone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Phone Frequency</p>
                      <p className="font-bold text-slate-900 mt-1">{userData?.phone || 'Not linked'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <HiIdentification className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Account UID</p>
                      <p className="text-[11px] font-mono font-bold text-slate-500 mt-1 truncate max-w-[150px]">
                        {user?.uid}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <div className="bg-slate-50 rounded-[2.5rem] p-8">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <HiChartBar className="text-indigo-600" /> Platform Impact
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Followers</span>
                  <span className="font-black text-slate-900">124</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Referrals</span>
                  <span className="font-black text-slate-900">12</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Courses</span>
                  <span className="font-black text-slate-900">4 Enrolled</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 text-center">
                <HiShare className="text-4xl mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-black uppercase tracking-tight italic">Refer & Earn</h4>
                <p className="text-xs text-blue-100/70 font-bold mt-2 leading-relaxed">
                  Invite your friends to SVTECH and earn rewards on every enrollment.
                </p>
                <button 
                  onClick={copyReferral}
                  className="w-full mt-6 py-4 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 group"
                >
                  <HiClipboardCopy className="group-hover:scale-125 transition-transform" /> Copy Protocol Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
