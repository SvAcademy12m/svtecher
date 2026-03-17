import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLocationMarker, HiClock, HiBriefcase, HiCurrencyDollar, HiArrowRight, HiFire } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import SocialActionBar from '../ui/SocialActionBar';

const TYPE_STYLES = {
  'full-time': { gradient: 'from-blue-600 to-indigo-700', badge: 'Full-Time' },
  'part-time': { gradient: 'from-cyan-500 to-blue-600', badge: 'Part-Time' },
  'contract': { gradient: 'from-amber-500 to-orange-600', badge: 'Contract' },
  'remote': { gradient: 'from-emerald-500 to-teal-600', badge: 'Remote' },
  'internship': { gradient: 'from-purple-600 to-pink-700', badge: 'Internship' },
};

const JobCard = ({ job, onApply, showActions = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const style = TYPE_STYLES[job.type] || { gradient: 'from-blue-600 to-indigo-700', badge: 'Open' };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => navigate('/jobs')}
      className="group relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-900 border border-white/10 shadow-2xl cursor-pointer"
    >
      {/* Top Gradient Accent */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${style.gradient}`} />

      <div className="p-7">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center flex-shrink-0 shadow-xl transform group-hover:rotate-6 transition-transform`}>
            <HiBriefcase className="w-7 h-7 text-white" />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-gradient-to-r ${style.gradient} text-white shadow-lg`}>
            {style.badge}
          </span>
        </div>

        <h3 className="text-xl font-black text-white uppercase tracking-tight leading-snug mb-1 group-hover:text-cyan-300 transition-colors line-clamp-2">
          {job.title}
        </h3>
        {job.company && (
          <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-4">{job.company}</p>
        )}

        <p className="text-sm text-blue-100/70 line-clamp-3 leading-relaxed mb-6 font-black uppercase italic">
          "{job.description}"
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 mb-6">
          {job.location && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-200 uppercase tracking-widest">
              <HiLocationMarker className="w-4 h-4 text-cyan-400" /> {job.location}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-200 uppercase tracking-widest">
              <HiCurrencyDollar className="w-4 h-4 text-cyan-400" /> {job.salary}
            </span>
          )}
          {job.deadline && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-200 uppercase tracking-widest">
              <HiClock className="w-4 h-4 text-cyan-400" /> {job.deadline}
            </span>
          )}
        </div>

        <SocialActionBar item={job} type="job" />

        {/* CTA Button */}
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            if (!user) {
              navigate('/register', { state: { defaultRole: 'job_finder', returnUrl: '/jobs' } });
            } else {
              onApply ? onApply(job) : navigate('/jobs'); 
            }
          }}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all group/btn"
        >
          {showActions ? (
            <><HiFire className="w-4 h-4 text-orange-400" /> Apply Now</>
          ) : (
            <>View Job <HiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default JobCard;
