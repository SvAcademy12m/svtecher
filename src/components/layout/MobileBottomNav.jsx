import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiHome, HiAcademicCap, HiSupport, HiMenu } from 'react-icons/hi';
import { motion } from 'framer-motion';
import MobileMenuDrawer from './MobileMenuDrawer';
import { useLanguage } from '../../contexts/LanguageContext';

const MobileBottomNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { to: '/', icon: HiHome, label: 'Home' },
    { to: '/services', icon: HiSupport, label: 'Services' },
    { to: '/courses', icon: HiAcademicCap, label: 'Courses' },
  ];

  const footerSections = [
    {
      title: t('services'),
      links: [
        { label: 'Business Software Training', to: '/services' },
        { label: 'IT Maintenance & Repair', to: '/services' },
        { label: 'Network Installation', to: '/services' },
      ]
    },
    {
      title: t('company'),
      links: [
        { label: t('aboutUs'), to: '/about' },
        { label: t('techBlog'), to: '/blog' },
        { label: 'Digital Curriculum', to: '/courses' },
        { label: t('contactUs'), to: '/contact' },
      ]
    },
    {
      title: t('support'),
      links: [
        { label: t('helpCenter'), to: '#' },
        { label: t('termsOfService'), to: '#' },
        { label: t('privacyPolicy'), to: '#' },
      ]
    }
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden">
        {/* Glossy Backdrop */}
        <div className="absolute inset-0 bg-white/95 dark:bg-[#0e1225]/95 backdrop-blur-3xl border-t border-slate-200/50 dark:border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]" />
        
        <div className="relative flex items-center justify-around h-20 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center transition-all duration-300 ${
                  isActive ? 'text-blue-600 scale-110' : 'text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <div className={`relative p-3 rounded-2xl transition-all ${
                  isActive ? 'bg-blue-600/10' : ''
                }`}>
                  <item.icon className="w-7 h-7" />
                  {isActive && (
                    <motion.div 
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full"
                    />
                  )}
                </div>
              )}
            </NavLink>
          ))}

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              isMenuOpen ? 'text-blue-600 scale-110' : 'text-slate-400'
            }`}
          >
            <div className={`relative p-3 rounded-2xl transition-all ${
              isMenuOpen ? 'bg-blue-600/10' : ''
            }`}>
              <HiMenu className="w-7 h-7" />
            </div>
          </button>
        </div>
        
        {/* Safe Area Padding for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      <MobileMenuDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        footerSections={footerSections}
      />
    </>
  );
};

export default MobileBottomNav;
