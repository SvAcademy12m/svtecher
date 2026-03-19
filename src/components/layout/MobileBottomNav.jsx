import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiHome, HiAcademicCap, HiViewGrid, HiUser } from 'react-icons/hi';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
  const navItems = [
    { to: '/', icon: HiHome, label: 'HOME' },
    { to: '/courses', icon: HiAcademicCap, label: 'COURSES' },
    { to: '/services', icon: HiViewGrid, label: 'SERVICES' },
    { to: '/profile', icon: HiUser, label: 'PROFILE' },
  ];

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden px-3 pb-5 pt-8 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-1.5 flex items-center justify-around shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.3)] pointer-events-auto max-w-sm mx-auto">
        {navItems.map((item, i) => (
          <NavLink
            key={i}
            to={item.to}
            className={({ isActive }) => `
              relative flex flex-col items-center gap-1 min-w-[60px] py-2 rounded-[1.5rem] transition-all duration-500 group
              ${isActive ? 'text-blue-600 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-blue-500'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-blue-50 dark:bg-gradient-to-br dark:from-blue-600 dark:to-indigo-700 rounded-[1.2rem] -z-10 shadow-inner"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <item.icon className={`w-6 h-6 transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-active:scale-95'}`} />
                <span className={`text-[8px] font-black tracking-widest uppercase transition-all ${isActive ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-0.5'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.div>
  );
};

export default MobileBottomNav;
