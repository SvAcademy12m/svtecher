import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  HiArrowRight, HiAcademicCap, HiBriefcase, HiCode, HiDesktopComputer,
  HiLightBulb, HiChartBar, HiShieldCheck, HiGlobe, HiStar, HiMail,
  HiPhone, HiLocationMarker, HiCheckCircle, HiSupport, HiPlay, HiSearch,
  HiUsers, HiShoppingCart
} from 'react-icons/hi';
import { courseService, jobService, blogService, webAppService, userService } from '../../core/services/firestoreService';
import { CONTACT_INFO } from '../../core/utils/constants';
import CourseCard from '../../components/cards/CourseCard';
import JobCard from '../../components/cards/JobCard';
import ProductCard from '../../components/cards/ProductCard';
import StatCard from '../../components/ui/StatCard';
import GlobalSearch from '../../components/ui/GlobalSearch';
import { useAuth } from '../../contexts/AuthContext';

// Animations
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.4 } }
};

const services = [
  { icon: HiCode, title: 'Web Development', desc: 'Modern, responsive websites and web applications built with React, Node, and Firebase.', color: 'from-blue-500 to-indigo-500' },
  { icon: HiDesktopComputer, title: 'App Development', desc: 'Native and cross-platform mobile applications for iOS and Android built on cutting-edge stacks.', color: 'from-cyan-500 to-blue-500' },
  { icon: HiAcademicCap, title: 'Tech Training', desc: 'Professional training programs in software development, design, and IT infrastructure.', color: 'from-purple-500 to-pink-500' },
  { icon: HiShieldCheck, title: 'Cybersecurity', desc: 'Network security assessments, penetration testing, and modern compliance consulting.', color: 'from-emerald-500 to-teal-500' },
  { icon: HiChartBar, title: 'Data Analytics', desc: 'Business intelligence, data visualization architectures, and insights-driven consulting.', color: 'from-amber-500 to-orange-500' },
  { icon: HiGlobe, title: 'IT Consulting', desc: 'Strategic technology planning, cloud infrastructure, and enterprise digital transformation.', color: 'from-rose-500 to-red-500' },
];

const testimonials = [
  { name: 'Serkalem Sisay', role: 'CEO, SamiVIP', text: 'SVTech transformed our business with incredible custom web solutions. A true game-changer in the tech landscape!', avatar: 'S' },
  { name: 'Biniyam Molla', role: 'CTO, DevSolutions', text: 'Their expertise in scalable full-stack development propelled us to the next level. Highly recommended!', avatar: 'B' },
  { name: 'Hana Teshome', role: 'Graduate Student', text: 'The advanced training programs at SVTech helped me land my first senior tech role within just 3 months.', avatar: 'H' },
];

const stats = [
  { value: '2,500+', label: 'Active Students', id: 'students' },
  { value: '500+', label: 'Projects Delivered', id: 'projects' },
  { value: '98%', label: 'Satisfaction Rate', id: 'satisfaction' },
  { value: '120+', label: 'Software Buyers', id: 'buyers' },
];

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [counts, setCounts] = useState({ students: '2,500', projects: '500', buyers: '120', satisfaction: '98' });
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    const unsubs = [];
    unsubs.push(courseService.subscribe((data) => setCourses(data.slice(0, 3))));
    unsubs.push(jobService.subscribe((data) => setJobs(data.filter(j => j.status === 'open').slice(0, 3))));
    unsubs.push(webAppService.getActive((data) => setProducts(data.slice(0, 3))));

    const fetchCounts = async () => {
      try {
        const studentCount = await userService.getCountByRole('student');
        const buyerCount = await userService.getCountByRole('customer');
        const finderCount = await userService.getCountByRole('jobFinder');
        const providerCount = await userService.getCountByRole('seller');
        const allApps = await webAppService.getAll();
        
        setCounts({
          students: studentCount > 0 ? studentCount.toLocaleString() : '2,500',
          buyers: buyerCount > 0 ? buyerCount.toLocaleString() : '120',
          finders: finderCount > 0 ? finderCount.toLocaleString() : '850',
          providers: providerCount > 0 ? providerCount.toLocaleString() : '150',
          projects: allApps.length > 0 ? allApps.length.toLocaleString() : '500',
          satisfaction: '98'
        });
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };
    fetchCounts();

    return () => unsubs.forEach(u => u());
  }, []);

  const dynamicStats = stats.map(s => {
    if (s.id === 'students') return { ...s, value: counts.students + '+' };
    if (s.id === 'projects') return { ...s, value: counts.projects + '+' };
    if (s.id === 'buyers') return { ...s, value: counts.buyers + '+' };
    return s;
  });

  const copyRefLink = () => {
    navigator.clipboard.writeText(`svtech.et/ref/${userData?.name?.replace(/\s+/g, '').toLowerCase() || 'user'}`);
    alert('Referral link copied to clipboard!');
  };

  return (
    <>
    <div className="overflow-hidden bg-white">
      {/* ─── HERO SECTION ──────────────────────────────── */}
      <section className="relative min-h-[100vh] flex items-center justify-center pt-20 pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-100/50 blur-[120px]" />
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-cyan-100/50 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Accelerate Your Tech Journey</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[1.05] max-w-5xl">
            Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">Technology</span>
            <br />Shape the Future.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-8 text-lg sm:text-xl text-slate-600 max-w-2xl font-bold leading-relaxed">
            SVTech is your premium portal for high-level software engineering courses, direct IT placements, and world-class digital consulting.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mt-10 flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/register')} className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-white bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95">
              <span className="relative z-10 flex items-center gap-2 uppercase tracking-widest text-xs">Get Started Free <HiArrowRight className="group-hover:translate-x-1 transition-transform" /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button onClick={() => setSearchOpen(true)} className="inline-flex items-center justify-center gap-3 px-8 py-4 font-black text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 shadow-lg shadow-slate-100 transition-all hover:scale-105 active:scale-95">
              <HiSearch className="w-5 h-5 text-blue-600" /> 
              <span className="uppercase tracking-widest text-xs">Search Gateway</span>
              <kbd className="hidden sm:block px-2 py-1 bg-slate-100 rounded-lg text-[10px] text-slate-400 font-black">⌘ K</kbd>
            </button>
          </motion.div>
        </div>

        <motion.div style={{ y }} className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[800px] h-[400px] bg-white rounded-t-[40px] border border-slate-100 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] overflow-hidden hidden md:block">
          <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          <div className="p-8 grid grid-cols-3 gap-6 opacity-20">
            <div className="h-32 bg-slate-100 rounded-2xl border border-slate-200"></div>
            <div className="h-32 bg-slate-100 rounded-2xl border border-slate-200"></div>
            <div className="h-32 bg-slate-100 rounded-2xl border border-slate-200"></div>
            <div className="col-span-2 h-48 bg-slate-100 rounded-2xl border border-slate-200"></div>
            <div className="h-48 bg-slate-100 rounded-2xl border border-slate-200"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </motion.div>
      </section>

      {/* ─── VIBRANT STATS SECTION ──────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden z-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f608_1px,transparent_1px),linear-gradient(to_bottom,#3b82f608_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Our Impact</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tighter">
              Powering Ethiopia's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Digital Future</span>
            </h2>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <motion.div variants={popIn}>
              <StatCard title="Active Students" value={`${counts.students}+`} icon={HiUsers} variant="light" badge="Learning" />
            </motion.div>
            <motion.div variants={popIn}>
              <StatCard title="Software Buyers" value={`${counts.buyers}+`} icon={HiShoppingCart} variant="light" badge="Premium" />
            </motion.div>
            <motion.div variants={popIn}>
              <StatCard title="Job Providers" value={`${counts.providers}+`} icon={HiBriefcase} variant="light" badge="Verified" />
            </motion.div>
            <motion.div variants={popIn}>
              <StatCard title="Tech Finders" value={`${counts.finders}+`} icon={HiGlobe} variant="light" badge="Active" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── REFERRAL & DOWNLOAD SECTION ──────────────────── */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Referral */}
            <motion.div {...fadeUp} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <HiUsers className="w-32 h-32 text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Growth Program</span>
              <h3 className="text-3xl font-black text-slate-900 mt-4 mb-6 tracking-tighter uppercase">
                Refer & <span className="text-blue-600">Earn Rewards</span>
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Share the SVTECH vision with your network. Invite friends to join our courses or marketplace and earn premium credits and exclusive access.
              </p>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                <code className="flex-1 text-sm font-black text-blue-700 truncate">svtech.et/ref/{userData?.name?.replace(/\s+/g, '').toLowerCase() || 'user'}</code>
                <button 
                  onClick={copyRefLink}
                  className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-700 transition-all active:scale-95"
                >
                  Copy Link
                </button>
              </div>
              <button onClick={() => navigate('/register')} className="w-full py-4 bg-gradient-to-r from-blue-700 to-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                Join Referral Network
              </button>
            </motion.div>

            {/* Download */}
            <motion.div {...fadeUp} className="bg-gradient-to-br from-blue-700 to-indigo-900 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
              <div className="relative z-10">
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.4em]">Mobile Experience</span>
                <h3 className="text-3xl font-black text-white mt-4 mb-6 tracking-tighter uppercase">
                  Download <span className="text-cyan-300">SVTech App</span>
                </h3>
                <p className="text-blue-100/80 font-medium leading-relaxed mb-10">
                  Access your courses, apply for jobs, and manage your digital assets on the go. Available for all your devices.
                </p>
                <div className="flex flex-wrap gap-4">
                   <button className="flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-xl hover:bg-blue-50 transition-all group/btn">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                        <HiDesktopComputer className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] font-black uppercase text-slate-400 leading-none">Download for</p>
                        <p className="text-sm font-black">Desktop</p>
                      </div>
                   </button>
                   <button className="flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all">
                      <HiArrowRight className="w-5 h-5" />
                      <div className="text-left">
                        <p className="text-[8px] font-black uppercase text-blue-200 leading-none">Coming soon to</p>
                        <p className="text-sm font-black">Mobile App</p>
                      </div>
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DIGITAL MARKETPLACE ──────────────────── */}
      {products.length > 0 && (
        <section className="py-32 relative bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                <div className="max-w-2xl">
                   <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                      Premium <span className="text-blue-600">Marketplace</span>
                   </h2>
                   <p className="mt-6 text-lg text-slate-500 font-medium leading-relaxed">
                      Acquire battle-tested <span className="text-slate-900 font-black">Accounting Softwares</span>, enterprise source codes, and ready-to-deploy digital assets to transform your business operations.
                   </p>
                </div>
                <button onClick={() => navigate('/services')} className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
                   Enter Marketplace
                </button>
             </motion.div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(product => (
                   <ProductCard key={product.id} product={product} />
                ))}
             </div>
          </div>
        </section>
      )}

      {/* ─── SERVICES ─────────────────────────── */}
      <section className="py-32 relative bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              A Complete <span className="text-blue-600">Ecosystem</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500 font-medium">
              SVTech bridges the gap between learning and doing. Get trained by industry veterans and instantly apply your skills on real-world projects.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="group relative p-8 rounded-3xl bg-white border border-slate-200 hover:border-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all overflow-hidden">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${service.color}`} />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg bg-gradient-to-br ${service.color}`}>
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                  {service.title}
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED COURSES ──────────────────── */}
      {courses.length > 0 && (
        <section className="py-24 bg-slate-900 border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <span className="text-indigo-400 font-bold tracking-widest text-sm uppercase">Curriculum</span>
                <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 leading-tight uppercase tracking-tight">Elite Tech Courses</h2>
                <p className="text-slate-400 mt-4 text-lg">Master in-demand skills with our comprehensive, project-based curriculums.</p>
              </div>
              <button onClick={() => navigate('/courses')} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors flex-shrink-0 uppercase text-xs tracking-widest border border-white/10">
                View Catalog <HiArrowRight />
              </button>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map(course => <div key={course.id} className="transform hover:-translate-y-2 transition-transform duration-300"><CourseCard course={course} /></div>)}
            </div>
          </div>
        </section>
      )}

      {/* ─── TESTIMONIALS ─────────────────────── */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">
              Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Visionaries</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all">
                <div>
                  <div className="flex gap-1 mb-6">{[...Array(5)].map((_, j) => <HiStar key={j} className="w-5 h-5 text-amber-400" />)}</div>
                  <p className="text-slate-600 text-lg leading-relaxed font-black uppercase italic">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-4 mt-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-md">{t.avatar}</div>
                  <div><p className="font-bold text-slate-900">{t.name}</p><p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t.role}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0e1225]" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 object-cover" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center bg-[#151a33]/50 backdrop-blur-xl p-16 rounded-[40px] border border-white/10 shadow-2xl">
          <motion.div {...fadeUp} className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-cyan-500/50 transform rotate-12"><HiDesktopComputer className="w-10 h-10 text-white -rotate-12" /></motion.div>
          <motion.h2 {...fadeUp} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight uppercase">Ready to Build <br/> The Future?</motion.h2>
          <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-blue-200 text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">Join the elite network of developers, designers, and innovators at SVTech. Register today and instantly access premium tools and courses.</motion.p>
          <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/register')} className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:scale-105 hover:bg-blue-50 transition-all shadow-xl">Create Free Account</button>
            <button onClick={() => navigate('/contact')} className="px-10 py-5 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 backdrop-blur-md transition-all">Talk to Sales</button>
          </motion.div>
        </div>
      </section>
    </div>
    <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default HomePage;
