import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPhone, HiMail, HiLocationMarker, HiArrowRight, HiCheckCircle, HiHashtag } from 'react-icons/hi';
import { FaTelegram, FaWhatsapp } from 'react-icons/fa';
import { CONTACT_INFO } from '../../core/utils/constants';
import { fadeUp } from '../../core/utils/animations';
import { toast } from 'react-toastify';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../core/firebase/firebase';
import { useLanguage } from '../../contexts/LanguageContext';

const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/8 outline-none transition-all font-medium";

const ContactPage = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(t('noResults')); // Fallback for "Please fill required fields"
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...form,
        createdAt: serverTimestamp(),
        read: false,
      });
      toast.success(t('messageSent'));
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#0e1225]">
      {/* ─── Hero ─── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-blue-600/8 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <HiMail className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-black text-blue-300 uppercase tracking-[0.3em]">{t('contact')}</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-tight mb-6">
              {t('contactTitle').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t('contactTitle').split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-black uppercase leading-relaxed">
              {t('contactDesc')}
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
            {[
              { icon: HiPhone, label: t('callUs'), value: CONTACT_INFO.phone, link: `tel:${CONTACT_INFO.phone}`, gradient: 'from-blue-600 to-indigo-700', shadow: 'shadow-blue-500/20' },
              { icon: HiMail, label: t('email'), value: CONTACT_INFO.email, link: `mailto:${CONTACT_INFO.email}`, gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20' },
              { icon: HiLocationMarker, label: t('location'), value: 'Addis Ababa, Ethiopia', link: null, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
            ].map((item, i) => (
              <motion.a
                key={i}
                href={item.link || '#'}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`group relative rounded-[2rem] overflow-hidden bg-gradient-to-br ${item.gradient} p-7 shadow-2xl ${item.shadow} block`}
              >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-1">{item.label}</p>
                  <p className="text-white font-black text-base leading-snug">{item.value}</p>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
            {/* Info Side */}
            <motion.div {...fadeUp} className="space-y-10">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">
                  {t('responseTime')}
                </h2>
                <p className="text-slate-400 font-black uppercase leading-relaxed">
                  {t('responseDesc')}
                </p>
              </div>

              {/* Barcode System (Digital Credential) */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 relative group overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col sm:flex-row items-center gap-8">
                  <div className="shrink-0 bg-white p-4 rounded-2xl shadow-2xl rotate-1 group-hover:rotate-0 transition-transform">
                    {/* Simulated SVG Barcode Code-128 */}
                    <svg width="140" height="80" viewBox="0 0 140 80">
                       <rect width="140" height="80" fill="white" />
                       {[2,5,8,12,15,20,22,25,30,35,40,42,45,50,55,58,62,65,70,75,80,82,85,90,95,98,102,105,110,115,120,122,125,130,135].map((x, i) => (
                          <rect key={i} x={x} y="10" width={i % 3 === 0 ? "3" : "1"} height="50" fill="black" />
                       ))}
                       <text x="70" y="72" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SVTECH-DIGITAL-2026</text>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">{t('officialBarcode')}</h4>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                      {t('scanForDetails')}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-cyan-400">
                       <HiHashtag className="w-5 h-5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Digital Auth Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">{t('instantSupport')}</p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href={CONTACT_INFO.telegram}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-xs uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                  >
                    <FaTelegram className="w-5 h-5" /> TELEGRAM
                  </a>
                  <a
                    href={CONTACT_INFO.whatsapp}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                  >
                    <FaWhatsapp className="w-5 h-5" /> WHATSAPP
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Form Side */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.15 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 blur-[60px]" />

              {sent ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <HiCheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">{t('messageSent')}</h3>
                  <p className="text-slate-400 font-medium mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-xl shadow-blue-500/20">
                    {t('sendAnother')}
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 relative">
                    {t('sendMessage')}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-6 relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">{t('fullName')} *</label>
                        <input
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          required
                          placeholder="John Doe"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">{t('email')} *</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          required
                          placeholder="you@example.com"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">{t('subject')}</label>
                      <input
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder="Project inquiry, support, etc."
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">{t('message')} *</label>
                      <textarea
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        required
                        rows={5}
                        placeholder="Describe your project or question..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative group/btn overflow-hidden rounded-2xl p-[1px] font-black text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:scale-110 transition-transform duration-500" />
                      <div className="relative py-4 bg-slate-900 rounded-[0.95rem] flex items-center justify-center gap-3 group-hover/btn:bg-transparent transition-colors text-white">
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>{t('sendButton')} <HiArrowRight size={18} /></>
                        )}
                      </div>
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
