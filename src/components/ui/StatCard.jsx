import React from 'react';
import { motion } from 'framer-motion';

/**
 * StatCard - matches the dashboard's vibrant gradient style.
 * Props: title, value, subtitle, icon (React component), gradient (Tailwind from-/to- classes), badge, variant ('dark' | 'light')
 */
const StatCard = ({ title, value, subtitle, icon: Icon, gradient = 'from-blue-700 to-indigo-900', badge, variant = 'dark', className = '' }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={`relative rounded-[2rem] overflow-hidden shadow-2xl transition-all ${
      variant === 'dark' 
        ? `text-white bg-gradient-to-br ${gradient}` 
        : 'bg-white border border-slate-100 text-slate-900'
    } ${className}`}
  >
    {/* Shine/Noise */}
    <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${variant === 'dark' ? 'opacity-20' : 'opacity-[0.03]'} pointer-events-none`} />
    <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full ${variant === 'dark' ? 'bg-white/10' : 'bg-blue-50'} blur-xl`} />

    <div className="relative p-7">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          variant === 'dark' ? 'bg-white/20' : 'bg-blue-50 border border-blue-100'
        }`}>
          {Icon && <Icon className={`w-6 h-6 ${variant === 'dark' ? 'text-white' : 'text-blue-600'}`} />}
        </div>
        {badge && (
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
            variant === 'dark' ? 'bg-white/20 backdrop-blur-sm' : 'bg-blue-600 text-white'
          }`}>
            {badge}
          </span>
        )}
      </div>

      <p className={`text-5xl font-black tracking-tighter leading-none mb-3 ${
        variant === 'dark' ? '' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-900'
      }`}>
        {value}
      </p>
      <p className={`${variant === 'dark' ? 'text-white/60' : 'text-slate-400'} font-black text-xs uppercase tracking-widest`}>
        {title}
      </p>
      {subtitle && <p className={`${variant === 'dark' ? 'text-white/40' : 'text-slate-400/60'} text-xs mt-1`}>{subtitle}</p>}
    </div>
  </motion.div>
);

export default StatCard;
