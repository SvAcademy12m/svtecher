import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiAcademicCap, HiUserGroup, HiBriefcase, HiCode, HiShieldCheck, HiLightBulb, HiArrowRight, HiGlobe, HiShoppingCart, HiNewspaper } from 'react-icons/hi';
import { fadeUp } from '../../core/utils/animations';
import { aboutService, userService, courseService, jobService, blogService } from '../../core/services/firestoreService';
import { ROLES } from '../../core/utils/constants';

const TEAM_VALUES = [
  { icon: HiCode, title: 'Technical Excellence', desc: 'We build with the best tools and follow industry standards.' },
  { icon: HiLightBulb, title: 'Innovation First', desc: 'We constantly explore and adopt emerging technologies.' },
  { icon: HiShieldCheck, title: 'Trust & Integrity', desc: 'Transparent communication and ethical business practices.' },
];

const AboutPage = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    courses: 0,
    jobs: 0,
    posts: 0,
    trainers: 0,
    buyers: 0,
  });

  useEffect(() => {
    const unsubs = [];

    // Subscribe to about content (admin-editable)
    unsubs.push(aboutService.subscribe(setContent));

    // Subscribe to real-time user counts
    unsubs.push(userService.subscribe((users) => {
      setStats(prev => ({
        ...prev,
        totalUsers: users.length,
        students: users.filter(u => u.role === ROLES.STUDENT).length,
        trainers: users.filter(u => u.role === ROLES.TRAINER).length,
        buyers: users.filter(u => u.role === ROLES.CUSTOMER || u.role === ROLES.SELLER).length,
      }));
    }));

    // Subscribe to real-time course count
    unsubs.push(courseService.subscribe((courses) => {
      setStats(prev => ({ ...prev, courses: courses.filter(c => c.status !== 'unpublished').length }));
    }));

    // Subscribe to real-time job count
    unsubs.push(jobService.subscribe((jobs) => {
      setStats(prev => ({ ...prev, jobs: jobs.filter(j => j.status === 'open').length }));
    }));

    // Subscribe to real-time blog count
    unsubs.push(blogService.subscribe((posts) => {
      setStats(prev => ({ ...prev, posts: posts.filter(p => p.status === 'published').length }));
    }));

    return () => unsubs.forEach(u => typeof u === 'function' && u());
  }, []);

  const story = content?.story || "SVTech was founded with a singular vision: to make world-class technology education and consulting accessible to every Ethiopian professional and business.";
  const mission = content?.mission || "We provide professional training programs, full-stack software development, accounting systems, and strategic IT consulting that helps our clients achieve extraordinary results in the digital world.";

  const LIVE_STATS = [
    { icon: HiUserGroup, label: 'Total Users', value: stats.totalUsers.toLocaleString() + '+', gradient: 'from-blue-700 to-indigo-900' },
    { icon: HiAcademicCap, label: 'Students Enrolled', value: stats.students.toLocaleString() + '+', gradient: 'from-cyan-600 to-blue-700' },
    { icon: HiNewspaper, label: 'Live Courses', value: stats.courses.toLocaleString(), gradient: 'from-purple-600 to-indigo-700' },
    { icon: HiBriefcase, label: 'Open Jobs', value: stats.jobs.toLocaleString(), gradient: 'from-emerald-600 to-teal-700' },
    { icon: HiShoppingCart, label: 'Buyers & Sellers', value: stats.buyers.toLocaleString() + '+', gradient: 'from-amber-500 to-orange-600' },
    { icon: HiGlobe, label: 'Blog Posts', value: stats.posts.toLocaleString(), gradient: 'from-rose-500 to-pink-600' },
  ];

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
              <span className="text-xs font-black text-blue-700 uppercase tracking-[0.3em]">{content?.badge || 'Our Identity'}</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-tight mb-6 italic">
              {content?.title || "The "} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">{content?.accent || 'SVTECH'}</span> Edge
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto font-bold leading-relaxed uppercase tracking-tight">
              {content?.heroText || "Empowering Ethiopia's Digital Revolution Since 2020. SVTECH Digital Technology Is A High-Performance Ecosystem For Training, Development, And Strategic Consulting."}
            </p>
          </motion.div>

          {/* ─── LIVE STATS from Firebase ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-24">
            {LIVE_STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className={`relative rounded-[2rem] overflow-hidden shadow-2xl text-white bg-gradient-to-br ${stat.gradient} group`}
              >
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="relative p-6">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black tracking-tighter leading-none mb-2">{stat.value}</p>
                  <p className="text-white/60 font-black text-[10px] uppercase tracking-widest">{stat.label}</p>
                </div>
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
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">{content?.storyLabel || 'Our Story'}</span>
              <h2 className="text-4xl font-black text-slate-900 mt-4 mb-6 tracking-tighter uppercase leading-tight">
                {content?.storyTitle || "Building Tomorrow's"} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">{content?.storyAccent || 'Tech Leaders'}</span>
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-5">
                {story}
              </p>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                {mission}
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

          {/* ─── QUICK LIVE BREAKDOWN ─── */}
          <motion.div
            {...fadeUp}
            className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl mb-24 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full -mr-40 -mt-40 blur-[100px]" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Platform At A Glance</h3>
              <p className="text-blue-200/60 text-xs font-black uppercase tracking-widest mb-8">Real-Time Intelligence From Our Ecosystem</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-all">
                  <p className="text-3xl font-black tracking-tighter text-cyan-400">{stats.totalUsers}</p>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Registered Users</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-all">
                  <p className="text-3xl font-black tracking-tighter text-blue-400">{stats.students}</p>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Active Students</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-all">
                  <p className="text-3xl font-black tracking-tighter text-purple-400">{stats.courses}</p>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Courses Live</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-all">
                  <p className="text-3xl font-black tracking-tighter text-emerald-400">{stats.trainers}</p>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Expert Trainers</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            {...fadeUp}
            className="text-center bg-blue-50/50 border border-blue-100 rounded-[2.5rem] p-12 shadow-sm"
          >
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">
              Join Ethiopia's Premier Tech Ecosystem
            </h2>
            <p className="text-slate-600 font-bold mb-8 max-w-lg mx-auto">
              Whether You're A Student, Job Seeker, Or Business Owner — SVTech Has A Solution Designed For You.
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
