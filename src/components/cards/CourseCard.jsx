import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiClock, HiAcademicCap, HiUser, HiArrowRight, HiStar, HiFire, HiLocationMarker, HiGlobeAlt } from 'react-icons/hi';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import SocialActionBar from '../ui/SocialActionBar';

const LEVEL_GRADIENTS = {
  beginner: 'from-emerald-500 to-teal-600',
  intermediate: 'from-blue-600 to-indigo-700',
  advanced: 'from-purple-600 to-pink-700',
};

const CourseCard = ({ course, onEnroll, showActions = false }) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  const gradient = LEVEL_GRADIENTS[course.level] || 'from-blue-600 to-indigo-700';

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => navigate('/courses')}
      className="group relative rounded-[3rem] overflow-hidden cursor-pointer shadow-[0_20px_50px_-15px_rgba(30,58,138,0.4)] bg-gradient-to-br from-blue-700 to-indigo-950 border border-white/10"
    >
      {/* Visual Header */}
      <div className="relative h-48 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent z-10" />
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800">
            <HiAcademicCap className="w-16 h-16 text-white/20" />
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-blue-600/80 backdrop-blur-xl px-4 py-2 rounded-2xl text-white border border-white/20 shadow-xl">
              {course.level || 'ALL LEVELS'}
            </span>
            {(course.isAdmin || course.isVerified) && (
              <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-emerald-500 px-3 py-1 rounded-full text-white w-fit shadow-lg shadow-emerald-500/20">
                OFFICIAL
              </span>
            )}
          </div>
          {course.price && (
            <span className="text-sm font-black bg-white text-blue-900 px-4 py-2 rounded-2xl shadow-2xl transform group-hover:scale-110 transition-transform">
              {formatPrice(course.price)}
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-8 flex flex-col relative z-20">
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <HiStar key={i} className="w-3.5 h-3.5 text-cyan-400" />
            ))}
          </div>
          <span className="text-[9px] font-black text-blue-200/60 uppercase tracking-[0.3em] ml-2 font-bold">PREMIUM CONTENT</span>
        </div>

        <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-4 group-hover:text-cyan-400 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-[13px] text-blue-100/60 line-clamp-2 leading-relaxed mb-6 font-bold uppercase tracking-tight">
          {course.description}
        </p>

        <div className="flex items-center gap-5 text-[9px] font-black text-blue-200 uppercase tracking-widest mb-8 pb-6 border-b border-white/5">
          {course.duration && (
            <span className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10"><HiClock className="w-3 h-3 text-cyan-400" /></div> {course.duration?.toUpperCase()}
            </span>
          )}
          {course.instructor && (
            <span className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10"><HiUser className="w-3 h-3 text-cyan-400" /></div> {course.instructor?.toUpperCase()}
            </span>
          )}
        </div>

        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            if (!user) {
              navigate('/register', { state: { defaultRole: 'student', returnUrl: '/courses' } });
            } else {
              onEnroll ? onEnroll(course) : navigate('/courses'); 
            }
          }}
          className="flex items-center justify-center gap-3 w-full py-5 rounded-[1.5rem] bg-white text-blue-900 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cyan-400 hover:text-white transition-all transform active:scale-95 shadow-xl mb-4"
        >
          {/* Dynamic Registration Button aligned with PWA flow */}
          {(!user) ? (
             <>SIGN UP ACCOUNT <HiArrowRight className="w-4 h-4 text-blue-500" /></>
          ) : showActions ? (
             <>INITIALIZE ENROLLMENT <HiFire className="w-4 h-4 text-orange-500" /></>
          ) : (
             <>VIEW COURSE <HiArrowRight className="w-4 h-4" /></>
          )}
        </button>

        {/* Contact Actions */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <a
            href="tel:+251911234567"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all group"
          >
            <HiFire className="w-4 h-4 mb-1 group-hover:text-emerald-400 opacity-70 group-hover:opacity-100" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">Call</span>
          </a>
          <a
            href="sms:+251911234567"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all group"
          >
            <HiLocationMarker className="w-4 h-4 mb-1 group-hover:text-blue-400 opacity-70 group-hover:opacity-100" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">SMS</span>
          </a>
          <a
            href="mailto:contact@svtecher.com"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all group"
          >
            <HiGlobeAlt className="w-4 h-4 mb-1 group-hover:text-amber-400 opacity-70 group-hover:opacity-100" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">Email</span>
          </a>
        </div>

        {/* Social Features */}
        <SocialActionBar item={course} type="course" />
      </div>
    </motion.div>
  );
};

export default CourseCard;
