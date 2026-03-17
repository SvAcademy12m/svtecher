import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiCode, HiDesktopComputer, HiAcademicCap, HiShieldCheck, HiChartBar,
  HiGlobe, HiArrowRight, HiCheckCircle, HiLightBulb, HiCurrencyDollar
} from 'react-icons/hi';
import { FaRobot, FaCalculator } from 'react-icons/fa';

const services = [
  {
    icon: HiCode,
    title: 'Web Development',
    desc: 'Custom websites, web applications, e-commerce platforms, and CMS solutions built with React, Next.js, and Firebase.',
    gradient: 'from-blue-600 to-indigo-700',
    shadow: 'shadow-blue-500/20',
    features: ['React / Next.js', 'Firebase & Node.js', 'E-commerce & CMS'],
    badge: 'Most Popular',
  },
  {
    icon: HiDesktopComputer,
    title: 'Mobile Apps',
    desc: 'Native and cross-platform mobile apps for iOS and Android with seamless, intuitive user experiences.',
    gradient: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/20',
    features: ['React Native', 'iOS & Android', 'Push Notifications'],
    badge: null,
  },
  {
    icon: FaCalculator,
    title: 'Accounting Software',
    desc: 'Ready-to-deploy accounting and business management systems built for Ethiopian businesses and enterprises.',
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
    features: ['Invoicing & Reports', 'Payroll Management', 'Multi-currency (ETB/USD)'],
    badge: 'Featured',
  },
  {
    icon: HiAcademicCap,
    title: 'Tech Training',
    desc: 'Hands-on training in programming, design, networking, and cybersecurity with industry-certified instructors.',
    gradient: 'from-purple-600 to-pink-600',
    shadow: 'shadow-purple-500/20',
    features: ['Coding Bootcamps', 'Design & UI/UX', 'Certification Ready'],
    badge: null,
  },
  {
    icon: HiShieldCheck,
    title: 'Cybersecurity',
    desc: 'Network security audits, penetration testing, vulnerability assessments, and compliance consulting.',
    gradient: 'from-red-600 to-rose-700',
    shadow: 'shadow-red-500/20',
    features: ['Pen Testing', 'Network Audit', 'Compliance Advisory'],
    badge: null,
  },
  {
    icon: FaRobot,
    title: 'AI & Automation',
    desc: 'AI-powered automation solutions, chatbots, data analytics, and machine learning integration for your business.',
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/20',
    features: ['AI Chatbots', 'Data Analytics', 'Workflow Automation'],
    badge: 'New',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
};

const ServicesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-white">
      {/* ─── Hero ─── */}
      <section className="relative pt-36 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/50 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div {...fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-black text-cyan-300 uppercase tracking-[0.3em]">Premium Services</span>
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight uppercase mb-8">
            What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Build</span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            From custom web & mobile development to accounting software, training programs, and AI automation — we deliver technology that drives real results.
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
                onClick={() => navigate('/contact')}
              >
                {/* Noise Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                
                {/* Glow Orb */}
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition-transform duration-700" />

                <div className="relative p-8">
                  {/* Badge */}
                  {s.badge && (
                    <span className="absolute top-6 right-6 text-[9px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">
                      {s.badge}
                    </span>
                  )}

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-8 group-hover:bg-white/30 transition-colors">
                    <s.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">
                    {s.title}
                  </h3>
                  <p className="text-blue-100/80 text-sm leading-relaxed mb-8 font-black uppercase italic">
                    "{s.desc}"
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
    </div>
  );
};

export default ServicesPage;
