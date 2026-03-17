import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiClock, HiAcademicCap, HiUser, HiArrowRight, HiStar } from 'react-icons/hi';
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
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => navigate('/courses')}
      className="group relative rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl bg-gradient-to-br from-blue-700 to-indigo-900 border border-white/10"
    >
      {/* Gradient Header */}
      <div className={`relative h-52 bg-gradient-to-br ${gradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />

        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-700 opacity-40"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiAcademicCap className="w-20 h-20 text-white/20" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
          <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white">
            {course.level || 'All Levels'}
          </span>
          {course.price && (
            <span className="text-sm font-black bg-white/95 text-slate-900 px-3 py-1.5 rounded-full shadow-lg">
              {formatPrice(course.price)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-7 flex flex-col relative z-10">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <HiStar key={i} className="w-3.5 h-3.5 text-amber-400" />
          ))}
          <span className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Top Rated</span>
        </div>

        <h3 className="text-xl font-black text-white uppercase tracking-tight leading-snug mb-3 group-hover:text-cyan-300 transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-blue-100/70 line-clamp-2 leading-relaxed mb-5 font-bold">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-[10px] font-black text-blue-200 uppercase tracking-widest mb-6">
          {course.duration && (
            <span className="flex items-center gap-1.5">
              <HiClock className="w-4 h-4 text-cyan-400" /> {course.duration}
            </span>
          )}
          {course.instructor && (
            <span className="flex items-center gap-1.5">
              <HiUser className="w-4 h-4 text-cyan-400" /> {course.instructor}
            </span>
          )}
        </div>

        <SocialActionBar item={course} type="course" />

        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            if (!user) {
              navigate('/register', { state: { defaultRole: 'student', returnUrl: '/courses' } });
            } else {
              onEnroll ? onEnroll(course) : navigate('/courses'); 
            }
          }}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all group/btn"
        >
          {showActions ? 'Enroll Now' : 'View Course'} <HiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default CourseCard;
