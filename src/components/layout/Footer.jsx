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
        { label: 'Web Development', to: '/services' },
        { label: 'Mobile Apps', to: '/services' },
        { label: 'Accounting Softwares', to: '/services' },
        { label: 'Cybersecurity', to: '/services' },
        { label: 'AI Solutions', to: '/services' },
      ]
    },
    {
      title: t('company'),
      links: [
        { label: t('aboutUs'), to: '/about' },
        { label: t('techBlog'), to: '/blog' },
        { label: 'Careers', to: '/jobs' },
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
    <footer className="relative bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 pt-32 pb-24 sm:pb-12 overflow-hidden border-t border-white/5">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_30px_rgba(34,211,238,0.4)]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 lg:gap-8 mb-24">
          {/* Brand Column */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-500/20 border border-white/20">
                <span className="text-white font-black text-xl italic">SV</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
                  SVTECH <span className="text-cyan-400">DIGITAL</span>
                </span>
                <span className="text-[10px] font-black tracking-[0.4em] text-blue-300/60 mt-1 uppercase">Tech Ecosystem</span>
              </div>
            </div>
            
            <p className="text-blue-100/60 text-sm font-bold leading-relaxed max-w-xs uppercase tracking-tight">
              {t('footerDesc').toUpperCase()}
            </p>

            <div className="flex flex-wrap gap-2.5">
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
                  className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-200 ${social.color} hover:text-white hover:border-transparent transition-all duration-500 transform hover:-translate-y-2 shadow-xl`}
                  title={social.title}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
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
                      className="text-blue-100/50 hover:text-cyan-400 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center group"
                    >
                      <span className="w-0 group-hover:w-4 h-px bg-cyan-400 mr-0 group-hover:mr-3 transition-all"></span>
                      {link.label.toUpperCase()}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
          <button onClick={() => navigate('/register')} className="px-10 py-5 bg-white text-blue-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-cyan-400 hover:text-white transition-all shadow-2xl active:scale-95">
            Initialise Onboarding
          </button>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12 border-y border-white/5">
          <div className="flex items-center">
            <div className="flex flex-wrap gap-8 items-center">
              <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
                  <FaEnvelope className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] text-blue-400 uppercase font-black tracking-[0.3em] leading-none mb-2">Secure Channel</p>
                  <p className="text-sm font-black text-white">{CONTACT_INFO.email.toUpperCase()}</p>
                </div>
              </a>
              <div className="h-10 w-px bg-white/10 hidden xl:block"></div>
              <div className="flex items-center gap-5 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-300 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-xl">
                  <FaPhone className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] text-blue-400 uppercase font-black tracking-[0.3em] leading-none mb-2">Hdq Hotlines</p>
                  <p className="text-sm font-black text-white">{CONTACT_INFO.phone}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center md:justify-end gap-5">
             <div className="text-right hidden sm:block">
                <p className="text-xs text-white font-black uppercase tracking-widest italic">Ethiopia's Digital Frontier</p>
                <p className="text-[9px] text-blue-400 uppercase font-black tracking-[0.4em] mt-1">SVTECH PRO SYSTEMS</p>
             </div>
             <div className="w-10 h-6 rounded-md bg-gradient-to-b from-[#009b3a] via-[#fedd00] to-[#ef1c24] flex flex-col shadow-lg border border-white/10"></div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-blue-100/30 text-[10px] font-black uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} SV TECH PRO SYSTEMS. ALL PROTOCOLS RESERVED.
          </p>
          <div className="flex items-center gap-8">
            <span className="text-[9px] text-blue-500/50 uppercase font-black tracking-[0.5em] italic">Designed For The 22nd Century</span>
          </div>
        </div>
      </div>
    </footer>

  );
};

export default Footer;
