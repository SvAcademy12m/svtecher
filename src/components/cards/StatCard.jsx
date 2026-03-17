import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, trend, gradient = false, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-2xl p-6 ${
        gradient
          ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200/50'
          : 'bg-white border border-slate-100 shadow-sm'
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          gradient ? 'bg-white/20' : 'bg-blue-50'
        }`}>
          {Icon && <Icon className={`w-5 h-5 ${gradient ? 'text-white' : 'text-blue-600'}`} />}
        </div>
        {trend && (
          <span className={`text-xs font-bold ${
            trend > 0 ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className={`text-3xl font-black ${gradient ? 'text-white' : 'text-slate-900'}`}>
        {value}
      </p>
      <p className={`text-xs font-semibold mt-1 uppercase tracking-wider ${
        gradient ? 'text-blue-100' : 'text-slate-400'
      }`}>
        {label}
      </p>
    </motion.div>
  );
};

export default StatCard;
