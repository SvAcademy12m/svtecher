import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaYoutube, FaTiktok, FaTelegram, FaEnvelope, FaPhone } from 'react-icons/fa';
import { CONTACT_INFO } from '../../core/utils/constants';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

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
    <footer className="relative bg-gradient-to-b from-blue-900 to-indigo-950 pt-24 pb-12 overflow-hidden border-t border-white/5">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-black text-sm italic">SV</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase italic">
                SVTECH <span className="text-cyan-400">DIGITAL</span>
              </span>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {t('footerDesc')}
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { icon: FaTelegram, url: CONTACT_INFO.telegram, color: 'hover:bg-blue-500', title: 'Telegram' },
                { icon: FaWhatsapp, url: CONTACT_INFO.whatsapp, color: 'hover:bg-emerald-500', title: 'WhatsApp' },
                { icon: FaInstagram, url: CONTACT_INFO.instagram, color: 'hover:bg-pink-500', title: 'Instagram' },
                { icon: FaTiktok, url: CONTACT_INFO.tiktok, color: 'hover:bg-slate-600', title: 'Learn Tech' },
                { icon: FaTiktok, url: CONTACT_INFO.tiktokPro, color: 'hover:bg-blue-600', title: 'Computer Guy' },
                { icon: FaYoutube, url: CONTACT_INFO.youtube, color: 'hover:bg-red-500', title: 'SV Academy' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 ${social.color} hover:text-white hover:border-transparent transition-all duration-300 transform hover:-translate-y-1`}
                  title={social.title}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <NavLink 
                      to={link.to} 
                      className="text-white/70 hover:text-white text-[13px] font-black uppercase tracking-widest transition-all flex items-center group"
                    >
                      <span className="w-0 group-hover:w-3 h-px bg-cyan-400 mr-0 group-hover:mr-2 transition-all"></span>
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-y border-white/5">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-4 items-center">
              <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <FaEnvelope className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Email Us</p>
                  <p className="text-sm font-bold text-slate-300">{CONTACT_INFO.email}</p>
                </div>
              </a>
              <div className="h-8 w-px bg-white/5 hidden sm:block"></div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Connect with our Team</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {CONTACT_INFO.phones.map((phone, idx) => (
                    <a key={idx} href={`tel:${phone}`} className="text-sm font-black text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2">
                      <FaPhone className="w-3 h-3 text-blue-500" /> {phone}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center md:justify-end gap-2">
             <span className="text-xs text-slate-500">Ethiopia's Digital Frontier</span>
             <div className="w-8 h-5 rounded-sm bg-gradient-to-b from-green-600 via-yellow-400 to-red-600 flex flex-col"></div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} <span className="text-slate-300 font-bold">SV Tech Pro</span>. {t('allRightsReserved')}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-slate-600 uppercase font-black tracking-[0.2em]">Designed for Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
