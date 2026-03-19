import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HiUser, HiBadgeCheck } from 'react-icons/hi';
import React from 'react';

const UserCard = ({ user }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={() => {
        if (!currentUser) {
          navigate('/register', { state: { returnUrl: '/profile' } });
        } else {
          navigate(`/profile/${user.id || ''}`);
        }
      }}
      className="group p-6 rounded-[2.5rem] bg-gradient-to-br from-blue-700 to-indigo-950 border border-white/10 shadow-3xl overflow-hidden relative cursor-pointer"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 blur-[40px] rounded-full -mr-10 -mt-10" />
      
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:rotate-6 transition-transform">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <HiUser className="w-10 h-10 text-blue-700" />
            )}
          </div>
          {(user.role === 'admin' || user.isVerified) && (
            <div className={`absolute -bottom-2 -right-2 ${user.role === 'admin' ? 'bg-emerald-500' : 'bg-blue-500'} text-white p-1.5 rounded-xl shadow-lg border-2 border-white`}>
              <HiBadgeCheck className="w-4 h-4" />
            </div>
          )}
        </div>

        <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-1">
          {user.name?.toUpperCase() || 'ANONYMOUS'}
        </h4>
        <p className="text-[9px] font-black text-blue-300 uppercase tracking-[0.3em] mb-4">
          {user.role?.toUpperCase() || 'USER'} IDENTITY
        </p>

        {user.bio && (
          <p className="text-[11px] text-blue-100/60 font-bold uppercase tracking-tight mb-6 line-clamp-2">
            {user.bio}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          {user.skills?.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-[8px] font-black text-white bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 uppercase tracking-widest">
              {skill?.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard;
