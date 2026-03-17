import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPhone, HiMail, HiLocationMarker, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
import { FaTelegram, FaWhatsapp } from 'react-icons/fa';
import { CONTACT_INFO } from '../../core/utils/constants';
import { toast } from 'react-toastify';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../core/firebase/firebase';

const CONTACT_CARDS = [
  { icon: HiPhone, label: 'Call Us', gradient: 'from-blue-600 to-indigo-700', shadow: 'shadow-blue-500/20' },
  { icon: HiMail, label: 'Email', gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20' },
  { icon: HiLocationMarker, label: 'Location', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/8 outline-none transition-all font-medium";

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...form,
        createdAt: serverTimestamp(),
        read: false,
      });
      toast.success('Message sent! We\'ll respond within 24 hours.');
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
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
              <span className="text-xs font-black text-blue-300 uppercase tracking-[0.3em]">Contact</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-tight mb-6">
              Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Connect</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Have a project in mind? Want a free consultation? We're ready to help you build something exceptional.
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
            {[
              { icon: HiPhone, label: 'Call Us', value: CONTACT_INFO.phone, link: `tel:${CONTACT_INFO.phone}`, gradient: 'from-blue-600 to-indigo-700', shadow: 'shadow-blue-500/20' },
              { icon: HiMail, label: 'Email', value: CONTACT_INFO.email, link: `mailto:${CONTACT_INFO.email}`, gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20' },
              { icon: HiLocationMarker, label: 'Location', value: 'Addis Ababa, Ethiopia', link: null, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Info Side */}
            <motion.div {...fadeUp} className="space-y-10">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">
                  Response time: <span className="text-cyan-400">&lt; 24hrs</span>
                </h2>
                <p className="text-slate-400 font-medium leading-relaxed">
                  We take every inquiry seriously. Whether it's a large enterprise project or a small web fix, our team responds promptly.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  'Free initial consultation',
                  'Detailed project proposal & timeline',
                  'Transparent pricing — no hidden fees',
                  'Dedicated project manager',
                  'Post-launch support included',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                    <HiCheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Instant Support</p>
                <div className="flex gap-4">
                  <a
                    href={CONTACT_INFO.telegram}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-xs uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                  >
                    <FaTelegram className="w-5 h-5" /> Telegram
                  </a>
                  <a
                    href={CONTACT_INFO.whatsapp}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                  >
                    <FaWhatsapp className="w-5 h-5" /> WhatsApp
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
                  <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Message Sent!</h3>
                  <p className="text-slate-400 font-medium mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-blue-500 transition-colors">
                    Send Another
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 relative">
                    Send a Message
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-5 relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Name *</label>
                        <input
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          required
                          placeholder="John Doe"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Email *</label>
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
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Subject</label>
                      <input
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder="Project inquiry, support, etc."
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Message *</label>
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
                          <>Send Message <HiArrowRight size={18} /></>
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
