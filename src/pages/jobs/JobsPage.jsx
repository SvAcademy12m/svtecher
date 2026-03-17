import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiBriefcase, HiSearch, HiLocationMarker } from 'react-icons/hi';
import { jobService } from '../../core/services/firestoreService';
import JobCard from '../../components/cards/JobCard';
import ApplicationModal from '../../components/ui/ApplicationModal';
import Spinner from '../../components/ui/Spinner';

const FILTERS = [
  { id: 'all', label: 'All Jobs' },
  { id: 'full-time', label: 'Full-Time' },
  { id: 'part-time', label: 'Part-Time' },
  { id: 'remote', label: 'Remote' },
  { id: 'contract', label: 'Contract' },
  { id: 'internship', label: 'Internship' },
];

const FILTER_GRADIENTS = {
  'full-time': 'from-blue-600 to-indigo-700',
  'part-time': 'from-cyan-500 to-blue-600',
  'remote': 'from-emerald-500 to-teal-600',
  'contract': 'from-amber-500 to-orange-600',
  'internship': 'from-purple-600 to-pink-700',
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = jobService.subscribe((data) => {
      setJobs(data.filter(j => j.status === 'open'));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = jobs
    .filter(j => filter === 'all' || j.type === filter)
    .filter(j =>
      !search ||
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase()) ||
      j.description?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return <Spinner fullScreen />;

  return (
    <div className="min-h-screen overflow-hidden bg-[#0e1225]">
      {/* ─── Hero ─── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-emerald-600/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-600/8 blur-[80px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <HiBriefcase className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-300 uppercase tracking-[0.3em]">Careers</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-tight mb-6">
              Open <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Positions</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Find your next tech career opportunity. We connect top talent with Ethiopia's best companies and startups.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <HiSearch className="absolute w-5 h-5 text-slate-500" style={{ left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, company, or skill..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:bg-white/8 outline-none transition-all font-medium"
                style={{ paddingLeft: '3.2rem', paddingRight: '1.5rem' }}
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
                    ? `bg-gradient-to-r ${FILTER_GRADIENTS[f.id] || 'from-emerald-500 to-teal-600'} text-white shadow-lg scale-105`
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
              <HiBriefcase className="w-16 h-16 text-slate-700 mx-auto mb-6" />
              <p className="text-slate-500 font-black text-lg uppercase tracking-widest">
                {search ? 'No jobs match your search.' : 'No open positions at the moment.'}
              </p>
              <p className="text-slate-600 text-sm mt-2">New opportunities are posted regularly — check back soon!</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  {filtered.length} position{filtered.length !== 1 ? 's' : ''} found
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                  <HiLocationMarker className="w-4 h-4" /> Ethiopia & Remote
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {filtered.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.5 }}
                  >
                    <JobCard job={job} showActions onApply={() => setSelectedJob(job)} />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <ApplicationModal 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
        job={selectedJob} 
      />
    </div>
  );
};

export default JobsPage;
