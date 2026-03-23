import React from 'react';
import { motion } from 'framer-motion';

const Spinner = ({ fullScreen = false, text = 'Loading...' }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center">
        {/* Animated Rings */}
        <div className="w-20 h-20 rounded-[2rem] border-2 border-slate-100 dark:border-white/5" />
        <div className="absolute inset-0 w-20 h-20 rounded-[2rem] border-t-2 border-r-2 border-blue-600 animate-spin" />
        <div className="absolute inset-0 w-20 h-20 rounded-[2rem] border-b-2 border-l-2 border-cyan-400 animate-spin-reverse transition-all duration-1000" />
        
        {/* Logo Icon */}
        <div className="absolute w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 flex items-center justify-center shadow-xl border border-white/20">
          <span className="text-white font-black text-lg tracking-tighter">SV</span>
        </div>
      </div>
      {text && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{text}</p>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return <div className="py-20 flex items-center justify-center">{spinner}</div>;
};

export default Spinner;
