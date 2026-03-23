import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiChevronRight, HiMail, HiPhone } from 'react-icons/hi';
import { NavLink } from 'react-router-dom';
import { FaTelegram, FaWhatsapp, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';
import { CONTACT_INFO } from '../../core/utils/constants';

const MobileMenuDrawer = ({ isOpen, onClose, footerSections }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 rounded-t-[3rem] z-[120] max-h-[90vh] overflow-y-auto shadow-2xl border-t border-white/20"
          >
            <div className="p-8 pb-32">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black border border-white/20">SV</div>
                  <span className="text-xl font-black text-white tracking-tighter uppercase">SVTECH <span className="text-cyan-300">Digital</span></span>
                </div>
                <button onClick={onClose} className="p-3 rounded-2xl bg-white/10 text-white">
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-12">
                {footerSections.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="text-cyan-300 font-black text-[10px] uppercase tracking-[0.4em] mb-6 pl-1">
                      {section.title}
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {section.links.map((link, lIdx) => (
                        <NavLink
                          key={lIdx}
                          to={link.to}
                          onClick={onClose}
                          className="flex items-center justify-between p-5 rounded-2xl bg-white/10 border border-white/10 active:scale-95 transition-all group"
                        >
                          <span className="text-sm font-black text-white uppercase tracking-widest">{link.label}</span>
                          <HiChevronRight className="w-5 h-5 text-white/40 group-hover:text-cyan-300 transition-colors" />
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Contact Strip */}
                <div className="pt-8 border-t border-white/20">
                  <div className="flex items-center gap-4 mb-8">
                    <a href={`tel:${CONTACT_INFO.phones[0]}`} className="flex-1 flex items-center justify-center gap-3 py-5 bg-white text-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/40">
                      <HiPhone className="w-4 h-4" /> Call Expertise
                    </a>
                    <a href={`sms:${CONTACT_INFO.phones[0]}`} className="flex-1 flex items-center justify-center gap-3 py-5 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/40">
                      <FaWhatsapp className="w-4 h-4" /> Message Support
                    </a>
                  </div>

                  <div className="flex justify-center gap-5">
                    {[
                      { icon: FaTelegram, color: 'text-white bg-blue-500/20 border-blue-400/30' },
                      { icon: FaWhatsapp, color: 'text-white bg-emerald-500/20 border-emerald-400/30' },
                      { icon: FaInstagram, color: 'text-white bg-pink-500/20 border-pink-400/30' },
                      { icon: FaTiktok, color: 'text-white bg-slate-500/20 border-slate-400/30' },
                      { icon: FaYoutube, color: 'text-white bg-red-500/20 border-red-400/30' },
                    ].map((social, i) => (
                      <div key={i} className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${social.color}`}>
                        <social.icon className="w-6 h-6" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenuDrawer;
