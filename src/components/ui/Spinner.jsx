import React from 'react';
import { motion } from 'framer-motion';

const Spinner = ({ fullScreen = false, text = 'Loading...' }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-[3px] border-slate-200" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-transparent border-t-blue-600 animate-spin" />
      </div>
      {text && <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{text}</p>}
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
