import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCode, HiDesktopComputer, HiAcademicCap, HiShieldCheck, HiChartBar, HiGlobe, HiArrowRight, HiCheckCircle, HiLightBulb, HiCurrencyDollar, HiSupport, HiTicket } from 'react-icons/hi';
import { FaRobot, FaCalculator } from 'react-icons/fa';
import { fadeUp } from '../../core/utils/animations';
import ServiceOrderForm from '../../components/ServiceOrderForm';

const services = [
  {
    icon: FaCalculator,
    title: 'Business Accounting Solutions',
    desc: 'Master professional accounting ecosystem with hands-on training in Peachtree, QuickBooks, and IFRS compliance.',
    gradient: 'from-blue-600 to-indigo-700',
    shadow: 'shadow-blue-500/20',
    features: ['Peachtree (Sage 50) Expertise', 'QuickBooks Desktop & Online', 'IFRS Standards & Reporting'],
    badge: 'Pro Certification',
    type: 'training'
  },
  {
    icon: HiDesktopComputer,
    title: 'IT Maintenance & Repair',
    desc: 'Premium maintenance contracts and elite repair services for enterprise laptop and desktop fleets.',
    gradient: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/20',
    features: ['Corporate Fleet Support', 'Hardware & Software Repair', 'Preventative Maintenance'],
    badge: 'Enterprise Tier',
    type: 'maintenance'
  },
  {
    icon: HiCode,
    title: 'Web & Mobile Ecosystems',
    desc: 'Bespoke web applications and native mobile experiences built with cutting-edge frameworks for maximum scalability.',
    gradient: 'from-purple-600 to-indigo-700',
    shadow: 'shadow-purple-500/20',
    features: ['React & Next.js Development', 'iOS & Android Native Apps', 'Cloud Infrastructure (AWS/Firebase)'],
    badge: 'Elite Dev',
    type: 'development'
  },
  {
    icon: HiChartBar,
    title: 'Digital Marketing Matrix',
    desc: 'Data-driven marketing strategies including SEO, social media management, and high-conversion ad campaigns.',
    gradient: 'from-rose-500 to-pink-600',
    shadow: 'shadow-rose-500/20',
    features: ['Growth Hacking & SEO', 'Social Media Management', 'Paid Ad Optimization (PPC)'],
    badge: 'Growth Focused',
    type: 'marketing'
  },
  {
    icon: HiGlobe,
    title: 'Network Infrastructure',
    desc: 'End-to-end network design, installation, and secure configuration for scalable business environments.',
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
    features: ['LAN/WAN Implementation', 'Wireless Optimization', 'Server Rack Architecture'],
    badge: 'Infrastructure Ready',
    type: 'network'
  },
];


import Modal from '../../components/ui/Modal';
import { db } from '../../core/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

const ServicesPage = () => {
  const navigate = useNavigate();
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [repairForm, setRepairForm] = useState({
    name: '',
    contact: '',
    deviceType: 'Laptop',
    issue: '',
    date: ''
  });
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRepairSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'service_requests'), {
        ...repairForm,
        type: 'repair',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success('Repair request submitted! We will contact you shortly.');
      setIsRepairModalOpen(false);
      setRepairForm({ name: '', contact: '', deviceType: 'Laptop', issue: '', date: '' });
    } catch (err) {
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-white">
      {/* ─── Hero ─── */}
      <section className="relative pt-36 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/50 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div {...fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 shadow-sm group">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-black text-cyan-300 tracking-[0.3em]">Premium Services</span>
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="text-6xl sm:text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
            What We <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Architect</span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-slate-500 text-lg max-w-3xl mx-auto font-bold leading-relaxed">
            Professional excellence in business software training, technical maintenance, and global infrastructure.
          </motion.p>
        </div>
      </section>

      {/* ─── Services Grid ─── */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative group rounded-[2.5rem] overflow-hidden bg-gradient-to-br ${s.gradient} shadow-2xl ${s.shadow} cursor-pointer`}
                onClick={() => {
                  if (s.type === 'maintenance') setIsRepairModalOpen(true);
                  else if (['development', 'marketing', 'network'].includes(s.type)) {
                    setSelectedService(s);
                    setIsServiceModalOpen(true);
                  }
                  else navigate('/contact');
                }}
              >
                {/* Noise Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                
                {/* Glow Orb */}
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition-transform duration-700" />

                <div className="relative p-8">
                  {/* Badge */}
                  {s.badge && (
                    <span className="absolute top-6 right-6 text-[9px] font-black tracking-widest bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">
                      {s.badge}
                    </span>
                  )}

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-8 group-hover:bg-white/30 transition-colors">
                    <s.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-blue-100/90 text-sm leading-relaxed mb-8 font-medium">
                    {s.desc}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-8">
                    {s.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-white/70 text-xs font-bold">
                        <HiCheckCircle className="w-4 h-4 text-white/50 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                    Get a Quote <HiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Process Section ─── */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f605_1px,transparent_1px),linear-gradient(to_bottom,#3b82f605_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-20">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">How It Works</span>
            <h2 className="text-4xl font-black text-slate-900 mt-3 tracking-tighter uppercase">Our Process</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery', desc: 'We understand your goals, audience, and challenges.' },
              { step: '02', title: 'Design & Plan', desc: 'Architecture, wireframes, and tech stack selection.' },
              { step: '03', title: 'Build & Test', desc: 'Agile development with continuous testing and feedback.' },
              { step: '04', title: 'Launch & Support', desc: 'Deployment, training, and ongoing maintenance.' },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="text-6xl font-black text-slate-900/5 mb-4 tracking-tighter">{p.step}</div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center mx-auto mb-4">
                  <HiLightBulb className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-slate-900 font-black text-lg uppercase tracking-tight mb-2">{p.title}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="relative rounded-[3rem] overflow-hidden bg-gradient-to-tr from-blue-700 via-indigo-700 to-cyan-600 p-1"
          >
            <div className="bg-[#0e1225] rounded-[2.7rem] px-12 py-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-cyan-500/5" />
              <HiCurrencyDollar className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-4xl font-black text-white tracking-tight uppercase mb-4">
                Ready to Start?
              </h2>
              <p className="text-slate-400 text-lg mb-10 font-medium max-w-xl mx-auto">
                Get a free consultation and project estimate from our expert team. We build fast, beautiful, and scalable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/contact')}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-blue-500/30"
                >
                  Get Free Consultation
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="px-10 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all"
                >
                  Learn About Us
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Repair Request Modal */}
      <Modal 
        isOpen={isRepairModalOpen} 
        onClose={() => setIsRepairModalOpen(false)} 
        title="Initialize Repair Protocol"
      >
        <form onSubmit={handleRepairSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technician Identity / Name</label>
            <input 
              required
              type="text" 
              value={repairForm.name}
              onChange={e => setRepairForm({...repairForm, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Frequency / Phone</label>
            <input 
              required
              type="text" 
              value={repairForm.contact}
              onChange={e => setRepairForm({...repairForm, contact: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="09..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Device Type</label>
            <select 
              value={repairForm.deviceType}
              onChange={e => setRepairForm({...repairForm, deviceType: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold outline-none"
            >
              <option>Laptop</option>
              <option>Desktop</option>
              <option>Server / Server Rack</option>
              <option>Network Equipment</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Issue Description</label>
            <textarea 
              required
              rows="3"
              value={repairForm.issue}
              onChange={e => setRepairForm({...repairForm, issue: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
              placeholder="Describe the technical fault..."
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-2xl uppercase tracking-widest text-[11px] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? 'Transmitting...' : 'Submit Service Request'}
          </button>
        </form>
      </Modal>
      <Modal 
        isOpen={isServiceModalOpen} 
        onClose={() => setIsServiceModalOpen(false)} 
        title={`Ordering: ${selectedService?.title}`}
        maxWidth="max-w-2xl"
      >
        {selectedService && (
          <ServiceOrderForm 
            service={selectedService} 
            onClose={() => setIsServiceModalOpen(false)} 
          />
        )}
      </Modal>
    </div>
  );
};

export default ServicesPage;
