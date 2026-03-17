import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiAcademicCap, HiBriefcase, HiGlobe, HiX, HiArrowRight, HiStar, HiCode } from 'react-icons/hi';
import { courseService, jobService } from '../../core/services/firestoreService';

const QUICK_LINKS = [
  { label: 'Web Development Courses', icon: HiCode, to: '/courses', color: 'text-blue-400' },
  { label: 'Mobile App Development', icon: HiGlobe, to: '/services', color: 'text-cyan-400' },
  { label: 'Job Opportunities', icon: HiBriefcase, to: '/jobs', color: 'text-emerald-400' },
  { label: 'Premium Courses', icon: HiAcademicCap, to: '/courses', color: 'text-indigo-400' },
];

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubs = [];
    const combined = [];
    unsubs.push(
      courseService.subscribe(data => {
        const courseItems = data.map(c => ({ ...c, _type: 'course', _icon: HiAcademicCap, _path: '/courses', _color: 'from-blue-600 to-indigo-600' }));
        setAllItems(prev => [...prev.filter(i => i._type !== 'course'), ...courseItems]);
      })
    );
    unsubs.push(
      jobService.subscribe(data => {
        const jobItems = data.map(j => ({ ...j, _type: 'job', _icon: HiBriefcase, _path: '/jobs', _color: 'from-emerald-500 to-teal-500' }));
        setAllItems(prev => [...prev.filter(i => i._type !== 'job'), ...jobItems]);
      })
    );
    return () => unsubs.forEach(u => u && u());
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) setQuery('');
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = allItems.filter(item =>
      item.name?.toLowerCase().includes(q) ||
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    ).slice(0, 6);
    setResults(filtered);
  }, [query, allItems]);

  const handleSelect = (item) => {
    navigate(item._path);
    onClose();
  };

  const handleQuickLink = (to) => {
    navigate(to);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Search Input */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5">
              <HiSearch className="w-6 h-6 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search courses, jobs, services..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg font-medium"
              />
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <HiX size={16} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[55vh] overflow-y-auto">
              {query && results.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm font-medium">
                  No results for "<span className="text-white">{query}</span>"
                </div>
              )}

              {results.length > 0 && (
                <div className="p-4 space-y-1">
                  {results.map((item, i) => (
                    <motion.button
                      key={item.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-left group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item._color} flex items-center justify-center text-white flex-shrink-0`}>
                        <item._icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{item.name || item.title}</p>
                        <p className="text-slate-500 text-xs truncate mt-0.5">{item.description?.slice(0, 80)}...</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest bg-gradient-to-r ${item._color} bg-clip-text text-transparent`}>
                        {item._type}
                      </span>
                      <HiArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))}
                </div>
              )}

              {!query && (
                <div className="p-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Quick Links</p>
                  <div className="grid grid-cols-2 gap-3">
                    {QUICK_LINKS.map((link, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickLink(link.to)}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-left group"
                      >
                        <link.icon className={`w-5 h-5 ${link.color}`} />
                        <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors truncate">{link.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">SV Search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
