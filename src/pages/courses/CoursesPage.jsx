import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiSearch } from 'react-icons/hi';
import { courseService } from '../../core/services/firestoreService';
import { fadeUp } from '../../core/utils/animations';
import CourseCard from '../../components/cards/CourseCard';
import Spinner from '../../components/ui/Spinner';

const FILTERS = [
  { id: 'all', label: 'All Courses' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const FILTER_GRADIENTS = {
  beginner: 'from-emerald-500 to-teal-600',
  intermediate: 'from-blue-600 to-indigo-700',
  advanced: 'from-purple-600 to-pink-700',
};


const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = courseService.subscribe((data) => {
      setCourses(data.filter(c => c.status !== 'unpublished'));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = courses
    .filter(c => filter === 'all' || c.level === filter)
    .filter(c =>
      !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return <Spinner fullScreen />;

  return (
    <div className="min-h-screen overflow-hidden bg-[#0e1225]">
      {/* ─── Hero ─── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <HiAcademicCap className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-black text-blue-300 uppercase tracking-[0.3em]">Curriculum</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-tight mb-6">
              Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Courses</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Master in-demand skills with our professional, industry-backed training programs. From beginner to expert.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <HiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-13 pr-6 py-4 text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/8 outline-none transition-all font-medium"
                style={{ paddingLeft: '3.2rem' }}
              />
            </div>
          </motion.div>

          {/* Filter Chips */}
          <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="flex flex-wrap justify-center gap-3">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f.id
                    ? `bg-gradient-to-r ${FILTER_GRADIENTS[f.id] || 'from-blue-600 to-cyan-500'} text-white shadow-lg scale-105`
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Grid ─── */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <motion.div {...fadeUp} className="text-center py-24">
              <HiAcademicCap className="w-16 h-16 text-slate-700 mx-auto mb-6" />
              <p className="text-slate-500 font-black text-lg uppercase tracking-widest">
                {search ? 'No courses match your search.' : 'No courses available yet.'}
              </p>
              <p className="text-slate-600 text-sm mt-2">Check back soon — new courses are added regularly.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filtered.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                >
                  <CourseCard course={course} showActions />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;
