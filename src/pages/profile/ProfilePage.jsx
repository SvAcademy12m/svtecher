import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../core/services/firestoreService';
import { storage, db } from '../../core/firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react'; // Added useState and useEffect imports
import { HiUser, HiPencilAlt, HiX, HiIdentification, HiMail, HiPhone, HiChartBar, HiShare, HiClipboardCopy, HiCheck, HiShieldCheck } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { ROLES, ROLE_DASHBOARD_PATHS } from '../../core/utils/constants';

const ProfilePage = () => {
  const { uid } = useParams();
  const { userData: currentUserData, user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isOwnProfile = !uid || uid === currentUser?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      if (isOwnProfile) {
        setProfileData(currentUserData);
      } else {
        const data = await userService.getById(uid);
        setProfileData(data);
      }
    };
    fetchProfile();
  }, [uid, currentUserData, isOwnProfile]);

  useEffect(() => {
    if (profileData && isOwnProfile) {
      setForm({
        name: profileData.name || '',
        bio: profileData.bio || '',
        phone: profileData.phone || '',
      });
    }
  }, [profileData, isOwnProfile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.update(currentUser.uid, form);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `profiles/${currentUser.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        toast.error('Upload failed');
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await updateDoc(doc(db, 'users', currentUser.uid), { photoURL: downloadURL });
        toast.success('Profile picture updated!');
        setUploading(false);
      }
    );
  };

  const handleFollow = async () => {
    if (!currentUser) return toast.error('Please login to follow');
    const targetUserId = uid;
    try {
      const isFollowing = currentUserData.following?.includes(targetUserId);
      const batch = []; // We can't use real batches easily here, so we'll do sequential

      if (isFollowing) {
        await updateDoc(doc(db, 'users', currentUser.uid), { following: arrayRemove(targetUserId) });
        await updateDoc(doc(db, 'users', targetUserId), { followersCount: increment(-1) });
        toast.info('Unfollowed');
      } else {
        await updateDoc(doc(db, 'users', currentUser.uid), { following: arrayUnion(targetUserId) });
        await updateDoc(doc(db, 'users', targetUserId), { followersCount: increment(1) });
        toast.success('Following');
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const copyReferral = () => {
    const link = `${window.location.origin}/register?ref=${currentUser?.uid}`;
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
            <div className="relative group cursor-pointer" onClick={() => isOwnProfile && document.getElementById('pic-upload').click()}>
              <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1 shadow-2xl overflow-hidden">
                {profileData?.photoURL ? (
                  <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover rounded-[2.3rem]" />
                ) : (
                  <div className="w-full h-full rounded-[2.3rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black">
                    {profileData?.name?.charAt(0) || <HiUser />}
                  </div>
                )}
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[2.5rem]">
                    <HiPencilAlt className="text-white text-2xl" />
                  </div>
                )}
              </div>
              {isOwnProfile && <input type="file" id="pic-upload" className="hidden" onChange={handleImageUpload} accept="image/*" />}
              {uploading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-[2.5rem]"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-4xl font-black tracking-tighter uppercase">{profileData?.name || 'NAME'}</h1>
                <span className="px-4 py-1.5 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-[0.2em] self-center">
                  {profileData?.role || 'User'}
                </span>
              </div>
              <p className="text-blue-100/80 font-medium max-w-xl line-clamp-2">
                {profileData?.bio || (isOwnProfile ? "Write something about yourself..." : "This user hasn't set a bio yet.")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {!isOwnProfile ? (
                <button 
                  onClick={handleFollow}
                  className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 ${
                    currentUserData?.following?.includes(uid) 
                      ? 'bg-white/10 border border-white/20 text-white' 
                      : 'bg-white text-blue-700 hover:bg-cyan-400 hover:text-white'
                  }`}
                >
                  {currentUserData?.following?.includes(uid) ? 'Following' : 'Follow User'}
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-3 rounded-2xl bg-white text-blue-700 font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 flex items-center gap-2"
                  >
                    {isEditing ? <><HiX /> Cancel</> : <><HiPencilAlt /> Edit Bio</>}
                  </button>
                  {[ROLES.ADMIN, ROLES.ACCOUNTANT].includes(currentUserData?.role) && (
                    <button 
                      onClick={() => window.location.href = '/dashboard/admin'}
                      className="px-6 py-3 rounded-2xl bg-cyan-400 text-blue-900 font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 flex items-center gap-2 hover:bg-white"
                    >
                      <HiShieldCheck /> Admin Console
                    </button>
                  )}
                </div>
              )}
            </div>
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
                  <HiIdentification className="text-blue-600" /> Manage My Info
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
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">About Me</label>
                    <textarea 
                      rows="4"
                      value={form.bio} 
                      onChange={(e) => setForm({...form, bio: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all resize-none"
                      placeholder="Tell the community about your expertise..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Phone Number</label>
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
                    {loading ? 'Saving...' : <><HiCheck className="w-5 h-5" /> Save Profile</>}
                  </button>
                </div>
              </motion.form>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">My Account</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <HiMail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">My Email</p>
                      <p className="font-bold text-slate-900 mt-1">{profileData?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                      <HiPhone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Phone</p>
                      <p className="font-bold text-slate-900 mt-1">{profileData?.phone || 'Not linked'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <HiIdentification className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Account ID</p>
                      <p className="text-[11px] font-mono font-bold text-slate-500 mt-1 truncate max-w-[150px]">
                        {profileData?.uid || uid}
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
                  <span className="font-black text-slate-900">{profileData?.followersCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Referrals</span>
                  <span className="font-black text-slate-900">{profileData?.referralsCount || 0}</span>
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
                <h4 className="text-lg font-black uppercase tracking-tight">Refer & Earn</h4>
                <p className="text-xs text-blue-100/70 font-bold mt-2 leading-relaxed">
                  Invite your friends to SVTECH and earn rewards on every enrollment.
                </p>
                <button 
                  onClick={copyReferral}
                  className="w-full mt-6 py-4 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 group"
                >
                  <HiClipboardCopy className="group-hover:scale-125 transition-transform" /> Copy My Link
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
