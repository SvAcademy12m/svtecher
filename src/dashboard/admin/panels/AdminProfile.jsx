import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiUserCircle, HiPencilAlt, HiShieldCheck, HiOutlineUserGroup, HiCamera, HiLockClosed, HiArrowRight, HiIdentification } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { userService } from '../../../core/services/firestoreService';

const AdminProfile = ({ user, userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: user?.email || '',
    phone: userData?.phone || '',
    bio: userData?.bio || 'System Administrator',
    role: userData?.role || 'Admin'
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.update(user.uid, {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio
      });
      toast.success('Admin Profile Synchronized!');
      setIsEditing(false);
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-white/10">
          <div className="p-8 lg:p-10 flex flex-col sm:flex-row items-center gap-8 bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-transparent lg:w-1/2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-white">
                 {userData?.photoURL ? (
                    <img src={userData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                       <HiUserCircle className="w-16 h-16" />
                    </div>
                 )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg">
                <HiShieldCheck className="w-4 h-4" />
              </div>
            </div>
            
            <div className="text-center sm:text-left flex-1">
               <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">{formData.name || 'SV Administrator'}</h3>
               <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-4">Official {formData.role}</p>
               <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                  <div className="px-4 py-1.5 bg-white dark:bg-white/10 border border-slate-100 dark:border-white/10 rounded-full text-[9px] font-black text-slate-500 dark:text-white/60 uppercase tracking-widest shadow-sm">
                    {userData?.referralsCount || 0} Referrals
                  </div>
                  <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-full text-[9px] font-black text-blue-600 uppercase tracking-widest shadow-sm">
                    Root Access
                  </div>
               </div>
            </div>
          </div>

          <div className="p-8 lg:p-10 flex-1 flex flex-col justify-between">
            <div className="mb-6">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 text-left">Admin Mission</p>
               <p className="text-xs font-bold text-slate-600 dark:text-white/60 leading-relaxed italic line-clamp-2">
                 "{formData.bio}"
               </p>
            </div>
            <div className="flex items-center gap-8 border-t border-slate-50 dark:border-white/5 pt-6 mt-auto">
               <div className="flex-1">
                  <p className="text-xl font-black text-slate-100 dark:text-white tracking-tighter">{userData?.followersCount || 0}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Followers</p>
               </div>
               <div className="w-px h-8 bg-slate-100 dark:bg-white/10" />
               <div className="flex-1">
                  <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{userData?.followingCount || 0}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Following</p>
               </div>
               <div className="flex-1 text-right">
                  <button onClick={() => setIsEditing(true)} className="p-3 bg-slate-900 dark:bg-white/10 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                     <HiPencilAlt className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <div className="bg-[#1e1b4b] text-white rounded-[3rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden h-full">
             <div className="absolute top-0 right-0 p-10 opacity-10">
                <HiIdentification className="w-40 h-40" />
             </div>
             <div className="relative z-10">
                <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Infrastructure Identity</p>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-b border-white/5 pb-3">
                      <span className="text-white/40 ">Node ID</span>
                      <span className="text-white tracking-tighter">{user?.uid?.slice(0, 12)}...</span>
                   </div>
                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-b border-white/5 pb-3">
                      <span className="text-white/40 ">Protocol</span>
                      <span className="text-white ">ACTIVE-ROOT</span>
                   </div>
                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-b border-white/5 pb-3">
                      <span className="text-white/40 ">Encryption</span>
                      <span className="text-white ">AES-256-GCM</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2">
           <div className="bg-white dark:bg-white/5 rounded-[4rem] p-10 md:p-16 border border-slate-100 dark:border-white/10 shadow-sm h-full">
              <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                 <HiOutlineUserGroup className="text-blue-600" /> {isEditing ? 'Pulse Edit' : 'Core Identity'}
              </h4>

              <form onSubmit={handleUpdate} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field label="Full Name" value={formData.name} disabled={!isEditing} onChange={(v) => setFormData({...formData, name: v})} />
                    <Field label="Email Protocol" value={formData.email} disabled={true} />
                    <Field label="Phone Link" value={formData.phone} disabled={!isEditing} placeholder="+251 ..." onChange={(v) => setFormData({...formData, phone: v})} />
                    <Field label="Access Level" value={formData.role} disabled={true} />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 ml-4 ">Administrative Bio</label>
                    <textarea 
                      disabled={!isEditing}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 p-8 rounded-[2.5rem] focus:border-blue-600 outline-none font-bold text-sm tracking-widest text-slate-600 dark:text-white/60 transition-all resize-none min-h-[150px]"
                    />
                 </div>

                 {isEditing && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 pt-4">
                       <button 
                         type="submit"
                         disabled={loading}
                         className="px-12 py-5 bg-blue-700 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/30 hover:bg-blue-800 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                       >
                          {loading ? 'Syncing...' : 'Update Node'} <HiArrowRight className="w-5 h-5" />
                       </button>
                       <button 
                         type="button"
                         onClick={() => setIsEditing(false)}
                         className="px-8 py-5 bg-slate-100 dark:bg-white/10 text-slate-400 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all"
                       >
                          Abort
                       </button>
                    </motion.div>
                 )}
              </form>

              {!isEditing && (
                 <div className="mt-16 p-10 bg-blue-50/50 dark:bg-blue-900/10 rounded-[3rem] border border-blue-100 dark:border-blue-900/20 border-b-4 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div>
                       <h5 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                          <HiLockClosed className="text-blue-600" /> Protocol Security
                       </h5>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Manage infrastructure and access nodes.</p>
                    </div>
                    <button onClick={() => window.location.href='/dashboard/admin?panel=settings'} className="px-10 py-4 bg-white dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-sm hover:shadow-xl transition-all">
                       System Settings
                    </button>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, disabled, onChange, placeholder }) => (
  <div className="group/field">
     <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 ml-4 ">{label}</label>
     <input 
       type="text"
       value={value}
       disabled={disabled}
       placeholder={placeholder}
       onChange={(e) => onChange && onChange(e.target.value)}
       className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 p-6 rounded-2xl focus:border-blue-600 outline-none font-black text-xs tracking-[0.2em] text-slate-900 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover/field:border-slate-200"
     />
  </div>
);

export default AdminProfile;
