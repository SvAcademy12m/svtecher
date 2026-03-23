import React from 'react';
import { FaTelegram, FaWhatsapp, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';
import { CONTACT_INFO } from '../../core/utils/constants';

const MobileFooter = () => {
  return (
    <div className="sm:hidden bg-white pt-10 pb-32 px-6 border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
       <div className="max-w-md mx-auto">
         {/* Join us svtech text */}
         <div className="text-center mb-10">
           <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-2">
             JOIN THE REVOLUTION
           </h3>
           <p className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
             SVTECH <span className="text-blue-600">Digital</span>
           </p>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Technology & Training</p>
         </div>
 
         {/* Social Media Icons - Natively Colored */}
         <div className="flex justify-center gap-4 mb-8">
           {[
             { icon: FaTelegram, url: CONTACT_INFO.telegram, color: 'text-[#0088cc] border-[#0088cc]/20 bg-[#0088cc]/5', label: 'Telegram' },
             { icon: FaWhatsapp, url: CONTACT_INFO.whatsapp, color: 'text-[#25d366] border-[#25d366]/20 bg-[#25d366]/5', label: 'WhatsApp' },
             { icon: FaInstagram, url: CONTACT_INFO.instagram, color: 'text-[#e4405f] border-[#e4405f]/20 bg-[#e4405f]/5', label: 'Instagram' },
             { icon: FaTiktok, url: CONTACT_INFO.tiktok, color: 'text-black border-black/10 bg-black/5', label: 'TikTok' },
             { icon: FaYoutube, url: CONTACT_INFO.youtube, color: 'text-[#ff0000] border-[#ff0000]/20 bg-[#ff0000]/5', label: 'YouTube' },
           ].map((social, i) => (
             <a
               key={i}
               href={social.url}
               target="_blank"
               rel="noopener noreferrer"
               aria-label={social.label}
               className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 cursor-pointer ${social.color}`}
             >
               <social.icon className="w-6 h-6" />
             </a>
           ))}
         </div>
 
         <div className="text-center pt-8 border-t border-slate-50">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
             © {new Date().getFullYear()} SVTECH DIGITAL TECHNOLOGY
           </p>
         </div>
       </div>
    </div>
  );
};

export default MobileFooter;
