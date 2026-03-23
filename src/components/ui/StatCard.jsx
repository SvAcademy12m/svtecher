import React from 'react';
import { motion } from 'framer-motion';

/**
 * StatCard - matches the dashboard's vibrant gradient style.
 * Props: title, value, subtitle, icon (React component), gradient (Tailwind from-/to- classes), badge, variant ('dark' | 'light')
 */
const StatCard = ({ title, value, subtitle, icon: Icon, gradient = 'from-blue-700 to-indigo-900', badge, variant = 'dark', className = '' }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    className={`relative rounded-[2.5rem] overflow-hidden transition-all duration-500 ${
      variant === 'dark' 
        ? `text-white bg-gradient-to-br ${gradient} shadow-2xl shadow-blue-900/40` 
        : 'bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] text-slate-900'
    } ${className} group`}
  >
    {/* Animated Glow Backdrop (Dark Mode Only) */}
    {variant === 'dark' && (
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    )}
    
    {/* Noise Texture */}
    <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${variant === 'dark' ? 'opacity-[0.15]' : 'opacity-[0.03]'} pointer-events-none`} />
    
    {/* Glossy Reflection */}
    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

    <div className="relative p-8">
      <div className="flex items-start justify-between mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500 ${
          variant === 'dark' ? 'bg-white/10 backdrop-blur-md border border-white/10' : 'bg-blue-50 border border-blue-100'
        }`}>
          {Icon && <Icon className={`w-7 h-7 ${variant === 'dark' ? 'text-white' : 'text-blue-600'}`} />}
        </div>
        {badge && (
          <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-3.5 py-1.5 rounded-full border ${
            variant === 'dark' ? 'bg-white/10 border-white/10 text-white' : 'bg-blue-600/10 border-blue-600/20 text-blue-600'
          }`}>
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className={`text-5xl font-black tracking-tighter leading-none mb-4 ${
          variant === 'dark' ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-900'
        }`}>
          {value}
        </p>
        <p className={`${variant === 'dark' ? 'text-white/70' : 'text-slate-400'} font-bold text-[10px] uppercase tracking-[0.4em]`}>
          {title}
        </p>
        {subtitle && (
          <p className={`${variant === 'dark' ? 'text-white/40' : 'text-slate-500/60'} text-[10px] font-medium tracking-wide mt-2`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Interactive Bottom Bar */}
      <div className={`mt-8 h-1 w-0 group-hover:w-full transition-all duration-700 rounded-full ${
        variant === 'dark' ? 'bg-white/30' : 'bg-blue-600/20'
      }`} />
    </div>
  </motion.div>
);

export default StatCard;
