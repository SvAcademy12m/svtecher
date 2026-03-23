import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaYoutube, FaTiktok, FaTelegram, FaEnvelope, FaPhone } from 'react-icons/fa';
import { HiMail, HiPhone, HiGlobeAlt } from 'react-icons/hi';
import { CONTACT_INFO } from '../../core/utils/constants';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
    <footer className="relative bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 pt-16 pb-12 overflow-hidden border-t border-white/10">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_30px_rgba(34,211,238,0.4)]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6 mb-12">
          {/* Brand Column */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-500/20 border border-white/20">
                <span className="text-white font-black text-xl">SV</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
                  SVTECH <span className="text-cyan-300">DIGITAL</span>
                </span>
                <span className="text-[10px] font-black tracking-[0.4em] text-blue-100/80 mt-1 uppercase text-center">Technology & Training</span>
              </div>
            </div>
            
            <p className="text-blue-100/60 text-sm font-black leading-relaxed max-w-xs tracking-tight">
              Empowering Ethiopia's Digital Revolution Through Elite Software Training And Premium IT Infrastructure Solutions.
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { icon: FaTelegram, url: CONTACT_INFO.telegram, color: 'hover:bg-blue-500', title: 'TELEGRAM' },
                { icon: FaWhatsapp, url: CONTACT_INFO.whatsapp, color: 'hover:bg-emerald-500', title: 'WHATSAPP' },
                { icon: FaInstagram, url: CONTACT_INFO.instagram, color: 'hover:bg-pink-500', title: 'INSTAGRAM' },
                { icon: FaTiktok, url: CONTACT_INFO.tiktok, color: 'hover:bg-slate-600', title: 'TIKTOK' },
                { icon: FaYoutube, url: CONTACT_INFO.youtube, color: 'hover:bg-red-500', title: 'YOUTUBE' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-200 ${social.color} hover:text-white hover:border-transparent transition-all duration-500 transform hover:-translate-y-2 shadow-xl shrink-0`}
                  title={social.title}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns - visible on sm+ */}
          <div className="grid col-span-1 lg:col-span-3 grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-8">
            {footerSections.map((section, idx) => (
              <div key={idx}>
                <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]"></span>
                  {section.title.toUpperCase()}
                </h4>
                <ul className="space-y-5">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <NavLink 
                        to={link.to} 
                        className="text-white hover:text-cyan-300 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center group"
                      >
                        <span className="w-0 group-hover:w-4 h-px bg-cyan-300 mr-0 group-hover:mr-3 transition-all"></span>
                        {link.label.toUpperCase()}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Global Talent Badge */}
        <div className="mb-16 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20">
               <HiGlobeAlt className="w-8 h-8 animate-spin-slow" />
            </div>
            <div className="text-left">
              <h5 className="text-white font-black text-xl uppercase tracking-tighter">Global Technology Network</h5>
              <p className="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Connecting Ethiopia to the Digital Frontier</p>
            </div>
          </div>
          <button onClick={() => navigate('/register')} className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-cyan-400 hover:text-white transition-all shadow-2xl active:scale-95">
            Get Started
          </button>
        </div>

        {/* Contact Strip & Mobile Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12 border-y border-white/5">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col sm:flex-row flex-wrap gap-8 items-start sm:items-center">
              <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-5 group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
                  <FaEnvelope className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] text-blue-400 uppercase font-black tracking-[0.3em] leading-none">Secure Channel</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-[7px] text-blue-300 font-black uppercase tracking-widest border border-blue-500/30 animate-pulse">Protected</span>
                  </div>
                  <p className="text-sm sm:text-base font-black text-white">SUPPORT@SVTECHDIGITAL.COM</p>
                </div>
              </a>
              
              <div className="h-10 w-px bg-white/10 hidden xl:block"></div>
              
              <div className="flex items-center gap-5 group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-300 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-xl">
                  <FaPhone className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] text-blue-400 uppercase font-black tracking-[0.3em] leading-none mb-2">Hdq Hotlines</p>
                  <p className="text-sm sm:text-base font-black text-white">{CONTACT_INFO.phones.join(' | ')}</p>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons (Visible only on small screens) */}
            <div className="grid grid-cols-2 sm:hidden gap-3 w-full">
              <a 
                href={`tel:${CONTACT_INFO.phones[0]}`}
                className="flex items-center justify-center gap-3 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                <HiPhone className="w-4 h-4 text-blue-600" /> CALL NOW
              </a>
              <a 
                href={`sms:${CONTACT_INFO.phones[0]}?body=Welcome to SVTech`}
                className="flex items-center justify-center gap-3 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
              >
                <FaWhatsapp className="w-4 h-4 text-emerald-400" /> SMS US
              </a>
              <button 
                onClick={() => navigate('/register')}
                className="col-span-2 flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
              >
                GET PRECISE QUOTE <HiMail className="w-5 h-5 text-cyan-300" />
              </button>
            </div>
          </div>

          <div className="flex items-center md:justify-end gap-5">
             <div className="text-right hidden sm:block">
                <p className="text-xs text-white font-black uppercase tracking-widest">Ethiopia's Digital Frontier</p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[9px] text-blue-400 uppercase font-black tracking-[0.4em]">SVTECH DIGITAL TECHNOLOGY</p>
                </div>
             </div>
             <div className="w-12 h-7 rounded-md bg-gradient-to-b from-[#009b3a] via-[#fedd00] to-[#ef1c24] flex flex-col shadow-lg border border-white/10 overflow-hidden">
                <div className="h-1/3 bg-[#009b3a]" />
                <div className="h-1/3 bg-[#fedd00]" />
                <div className="h-1/3 bg-[#ef1c24]" />
             </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-blue-100/30 text-[10px] font-black uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} SVTECH DIGITAL TECHNOLOGY. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <span className="text-[9px] text-blue-500/50 uppercase font-black tracking-[0.5em]">Designed For The 22nd Century</span>
          </div>
        </div>
      </div>
    </footer>

  );
};

export default Footer;
