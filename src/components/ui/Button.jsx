import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200/50 hover:shadow-blue-300/60',
  secondary: 'bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200/50',
  ghost: 'text-slate-600 hover:bg-slate-100',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-sm',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-300 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
