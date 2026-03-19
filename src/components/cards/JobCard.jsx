import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLocationMarker, HiClock, HiBriefcase, HiCurrencyDollar, HiArrowRight, HiFire, HiGlobeAlt } from 'react-icons/hi';
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
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => navigate('/jobs')}
      className="group relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-950 border border-white/10 shadow-[0_20px_50px_-15px_rgba(30,58,138,0.4)] cursor-pointer"
    >
      {/* Visual Header Accent */}
      <div className={`h-2 w-full bg-gradient-to-r ${style.gradient} shadow-[0_0_20px_rgba(59,130,246,0.3)]`} />

      <div className="p-8">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${style.gradient} flex items-center justify-center flex-shrink-0 shadow-2xl transform group-hover:rotate-6 transition-transform duration-500 border border-white/20`}>
            <HiBriefcase className="w-8 h-8 text-white" />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white shadow-xl`}>
            {style.badge?.toUpperCase() || 'OPEN'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
           <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-cyan-400 transition-colors">
            {job.title}
          </h3>
          {job.isVerified && (
             <div className="p-1 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/20" title="Official Verified Partnership">
                <HiFire className="w-3 h-3" />
             </div>
          )}
        </div>
        {job.company && (
          <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            {job.company?.toUpperCase()}
          </p>
        )}

        <p className="text-[13px] text-blue-100/60 line-clamp-3 leading-relaxed mb-8 font-bold uppercase tracking-tight italic">
          "{job.description}"
        </p>

        {/* Global Meta Info */}
        <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-white/5">
          {job.location && (
            <span className="flex items-center gap-2 text-[9px] font-black text-blue-200 uppercase tracking-widest">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10"><HiLocationMarker className="w-3 h-3 text-cyan-400" /></div> {job.location?.toUpperCase()}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
              <HiCurrencyDollar className="w-4 h-4 text-emerald-400" /> {job.salary?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            if (!user) {
              navigate('/register', { state: { defaultRole: 'job_finder', returnUrl: '/jobs' } });
            } else {
              onApply ? onApply(job) : navigate('/jobs'); 
            }
          }}
          className="flex items-center justify-center gap-3 w-full py-5 rounded-[1.5rem] bg-white text-blue-900 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cyan-400 hover:text-white transition-all transform active:scale-95 shadow-2xl mb-4"
        >
          {/* Dynamic Registration/Action Button completely aligned with PWA flow */}
          {(!user) ? (
            <>SIGN UP ACCOUNT <HiArrowRight className="w-4 h-4 text-blue-500" /></>
          ) : showActions ? (
            <>INITIALIZE APPLICATION <HiFire className="w-4 h-4 text-orange-500" /></>
          ) : (
            <>VIEW DETAILS <HiArrowRight className="w-4 h-4" /></>
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
        <SocialActionBar item={job} type="job" />
      </div>
    </motion.div>
  );
};

export default JobCard;
