import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiStar, HiAcademicCap, HiUserGroup, HiGlobe,
  HiCode, HiShieldCheck, HiLightBulb, HiArrowRight
} from 'react-icons/hi';
import StatCard from '../../components/ui/StatCard';

const STAT_CARDS = [
  { icon: HiStar, label: 'Rating', value: '5-Star', badge: 'Verified' },
  { icon: HiAcademicCap, label: 'Programs', value: '50+', badge: 'Premium' },
  { icon: HiUserGroup, label: 'Students', value: '2,500+', badge: 'Growth' },
  { icon: HiGlobe, label: 'Reach', value: 'Nationwide', badge: 'Impact' },
];

const TEAM_VALUES = [
  { icon: HiCode, title: 'Technical Excellence', desc: 'We build with the best tools and follow industry standards.' },
  { icon: HiLightBulb, title: 'Innovation First', desc: 'We constantly explore and adopt emerging technologies.' },
  { icon: HiShieldCheck, title: 'Trust & Integrity', desc: 'Transparent communication and ethical business practices.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-white">
      {/* ─── Hero ─── */}
      <section className="relative pt-36 pb-24 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f605_1px,transparent_1px),linear-gradient(to_bottom,#3b82f605_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-10 right-10 w-[600px] h-[600px] bg-blue-100/30 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-black text-blue-700 uppercase tracking-[0.3em]">Our Identity</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-tight mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">SVTech</span>
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto font-bold leading-relaxed">
              Empowering Ethiopia's tech future since 2020. We are a technology training, software development, and digital consulting company.
            </p>
          </motion.div>

          {/* Vibrant Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-24">
            {STAT_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <StatCard 
                  title={card.label} 
                  value={card.value} 
                  icon={card.icon} 
                  badge={card.badge} 
                  variant="light"
                />
              </motion.div>
            ))}
          </div>

          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Our Story</span>
              <h2 className="text-4xl font-black text-slate-900 mt-4 mb-6 tracking-tighter uppercase leading-tight">
                Building Tomorrow's <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Tech Leaders</span>
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-5">
                SVTech was founded with a singular vision: to make world-class technology education and consulting accessible to every Ethiopian professional and business.
              </p>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                We provide professional training programs, full-stack software development, accounting systems, and strategic IT consulting that helps our clients achieve extraordinary results in the digital world.
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-700 to-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                Work With Us <HiArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-5"
            >
              {TEAM_VALUES.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-5 p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100/50 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                    <v.icon className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-black uppercase tracking-tight mb-2">{v.title}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{v.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            {...fadeUp}
            className="text-center bg-blue-50/50 border border-blue-100 rounded-[2.5rem] p-12 shadow-sm"
          >
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">
              Join Ethiopia's Premier Tech Ecosystem
            </h2>
            <p className="text-slate-600 font-bold mb-8 max-w-lg mx-auto">
              Whether you're a student, job seeker, or business owner — SVTech has a solution designed for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate('/register')} className="px-8 py-4 bg-gradient-to-r from-blue-700 to-indigo-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-500/20">
                Get Started Free
              </button>
              <button onClick={() => navigate('/services')} className="px-8 py-4 bg-white border border-blue-100 text-blue-700 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-blue-50 transition-all">
                View Services
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
