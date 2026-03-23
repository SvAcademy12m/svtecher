import React, { useState } from 'react';
import { 
  HiPlus, HiPencil, HiTrash, HiAcademicCap, HiCheckCircle, HiClock, 
  HiCurrencyDollar, HiCube, HiDatabase, HiCollection, HiThumbUp, HiThumbDown
} from 'react-icons/hi';
import { courseService } from '../../../core/services/firestoreService';
import { auth, db } from '../../../core/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { COURSE_LEVELS, COURSE_CATEGORIES } from '../../../core/utils/constants';
import { formatDateTime } from '../../../core/utils/formatters';
import { toast } from 'react-toastify';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';

const initialForm = {
  title: '', description: '', price: '', duration: '', level: 'beginner',
  instructor: '', category: 'accounting', thumbnail: '', videoUrl: '', materials: '', status: 'published', isVerified: false,
};

const CoursePanel = ({ courses }) => {
  const { t } = useLanguage();
  const { formatDualPrice } = useCurrency();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, price: Number(form.price) };
      if (editId) {
        await courseService.update(editId, data);
        toast.success('Course module synchronized');
      } else {
        await courseService.create({ 
          ...data, 
          createdBy: auth.currentUser?.uid,
          createdAt: new Date()
        });
        toast.success('New learning node deployed');
      }
      setForm(initialForm);
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editCourse = (c) => {
    setForm({ 
      title: c.title, description: c.description, price: c.price || '', 
      duration: c.duration || '', level: c.level || 'beginner', 
      instructor: c.instructor || '', category: c.category || 'accounting', 
      thumbnail: c.thumbnail || '', videoUrl: c.videoUrl || '', 
      materials: c.materials || '', status: c.status || 'published', 
      isVerified: !!c.isVerified 
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('PERMANENTLY PURGE COURSE FROM REPOSITORY?')) return;
    try { 
      await courseService.delete(id); 
      toast.success('Module purged'); 
    } catch { 
      toast.error('Purge operation failed'); 
    }
  };

  const toggleVerify = async (c) => {
    try {
      await updateDoc(doc(db, 'courses', c.id), { isVerified: !c.isVerified });
      toast.success(`Module verification ${!c.isVerified ? 'authorized' : 'revoked'}`);
    } catch {
      toast.error('Verification toggle failed');
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h3 className="text-4xl font-black text-blue-900 dark:text-white tracking-tighter uppercase  underline decoration-blue-600 decoration-4 underline-offset-8">Academy Modules</h3>
          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-3">{courses.length} Certified Educational Nodes</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
           <button 
             onClick={async () => {
               if (!window.confirm("Deploy the 6 standard SVTech course modules (Peachtree, AutoCAD, Maintenance etc.)?")) return;
               const standardCourses = [
                 { title: 'Peachtree (FRS) Accounting', category: 'accounting', price: 2500, instructor: 'Samuel Tegegn', level: 'advanced' },
                 { title: 'QuickBooks Mastery', category: 'accounting', price: 2000, instructor: 'Samuel Tegegn', level: 'intermediate' },
                 { title: 'Computer Maintenance & Networking', category: 'maintenance', price: 3000, instructor: 'Tech Team', level: 'beginner' },
                 { title: 'TV Maintenance & Electronics', category: 'maintenance', price: 2800, instructor: 'Tech Team', level: 'beginner' },
                 { title: 'Professional Graphics Design', category: 'creative', price: 1500, instructor: 'Creative Lead', level: 'intermediate' },
                 { title: 'Video Editing & Production', category: 'creative', price: 1800, instructor: 'Creative Lead', level: 'intermediate' }
               ];
               for (const c of standardCourses) {
                 await courseService.create({ ...initialForm, ...c, createdBy: auth.currentUser?.uid, createdAt: new Date() });
               }
               toast.success('Standard Catalog Deployed Successfully');
             }}
             className="flex items-center gap-3 px-6 py-4 bg-emerald-600/10 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all shadow-xl"
           >
             Deploy Standard Catalog
           </button>
           <button 
             onClick={() => { setForm(initialForm); setEditId(null); setShowForm(true); }} 
             className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-[2rem] shadow-2xl shadow-blue-900/40 hover:-translate-y-1 active:scale-95 transition-all font-black tracking-widest text-[11px] uppercase "
           >
             <HiPlus className="w-6 h-6"/> Deploy Learning Module
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {courses.map(c => (
          <div key={c.id} className="group bg-white dark:bg-[#0e1225] rounded-[3.5rem] border border-blue-50 dark:border-white/5 overflow-hidden shadow-2xl shadow-blue-900/5 hover:-translate-y-3 transition-all duration-500 flex flex-col relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <HiAcademicCap className="w-40 h-40 scale-150 rotate-12" />
            </div>

            <div className="p-10 flex-1 flex flex-col relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                     <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                     <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase ">{c.category} Â· {c.level}</span>
                  </div>
                  <h4 className="font-black text-3xl text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors tracking-tighter uppercase  mb-6">{c.title}</h4>
                   
                  <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-[2rem] border border-blue-100 dark:border-white/5 shadow-inner">
                     <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Module Value</p>
                     <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
                        {formatDualPrice(c.price).etb}
                     </p>
                     <p className="text-[10px] font-black text-blue-600/40 uppercase tracking-widest mt-2">{formatDualPrice(c.price).usd}</p>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-white/5 rounded-xl border border-emerald-100 dark:border-white/5">
                        <HiThumbUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 transition-all">{c.likesCount || 0}</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-white/5 rounded-xl border border-rose-100 dark:border-white/5">
                        <HiThumbDown className="w-4 h-4 text-rose-500" />
                        <span className="text-[11px] font-black text-rose-600 dark:text-rose-400">{c.dislikesCount || 0}</span>
                     </div>
                  </div>

                </div>
                
                <div className="flex flex-col items-end gap-3 ml-4">
                   <Badge variant={c.status === 'published' ? 'success' : 'warning'} className="!px-5 !py-2 text-[9px] font-black uppercase tracking-widest shadow-xl">
                    {c.status}
                  </Badge>
                  {c.isVerified && (
                     <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-[9px] font-black tracking-widest shadow-lg uppercase  border border-white/20">
                        Verified Access
                     </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-black/20 rounded-[2.5rem] border border-slate-100 dark:border-white/5 mb-10 flex-1">
                 <p className="text-xs font-black text-slate-400 leading-relaxed  line-clamp-3">"{c.description}"</p>
                 <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-200/50 dark:border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                         {(c.instructor?.[0] || 'I').toUpperCase()}
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Lead Tech</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white tracking-tighter ">{c.instructor || 'Academy Core'}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Time Range</p>
                       <p className="text-sm font-black text-blue-600 dark:text-indigo-400 tracking-tighter">{c.duration || 'Variable'}</p>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => editCourse(c)} className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-xl hover:-translate-y-1">
                   <HiPencil className="w-6 h-6" />
                </button>
                <button 
                   onClick={() => toggleVerify(c)}
                   className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1 ${
                     c.isVerified ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                   }`}
                >
                   {c.isVerified ? 'Revoke Shield' : 'Apply Shield'}
                </button>
                <button onClick={() => deleteCourse(c.id)} className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-xl hover:-translate-y-1">
                   <HiTrash className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-40 bg-white dark:bg-[#0e1225] rounded-[4rem] border border-blue-100 dark:border-white/10 shadow-2xl shadow-blue-900/5">
           <HiCollection className="w-20 h-20 text-blue-100 dark:text-white/5 mx-auto mb-8 animate-bounce" />
           <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase ">Repository Empty</p>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Module Database Neutral. Deploy Assets.</p>
        </div>
      )}

      {/* Editor Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Module Override' : 'Deploy Module'} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white dark:bg-[#0e1225]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <FormInput label="Module Title" name="title" value={form.title} onChange={v => setForm({...form, title: v})} placeholder="ADVANCED PEACHTREE MASTERCLASS" />
             <FormSelect label="Category" name="category" value={form.category} onChange={v => setForm({...form, category: v})} options={COURSE_CATEGORIES.map(c => ({ v: c, l: c.toUpperCase() }))} />
             <FormInput label="Duration Profile" name="duration" value={form.duration} onChange={v => setForm({...form, duration: v})} placeholder="8 WEEKS PROTOCOL" />
             <FormSelect label="Access Level" name="level" value={form.level} onChange={v => setForm({...form, level: v})} options={COURSE_LEVELS.map(l => ({ v: l, l: l.toUpperCase() }))} />
          </div>

          <div>
             <label className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-4 block">Syllabus Specification</label>
             <textarea 
               name="description"
               value={form.description}
               onChange={e => setForm({...form, description: e.target.value})}
               className="w-full bg-slate-50 dark:bg-black p-8 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-600 transition-all min-h-[200px]"
               placeholder="START MODULE DESCRIPTION..."
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                <label className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-3 block">Fiscal Setpoint (ETB)</label>
                <div className="relative">
                   <HiCurrencyDollar className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6" />
                   <input 
                     name="price"
                     type="number"
                     value={form.price}
                     onChange={e => setForm({...form, price: e.target.value})}
                     className="w-full bg-emerald-50 dark:bg-black/40 pl-16 pr-8 py-6 rounded-3xl border-2 border-emerald-100 dark:border-white/5 text-2xl font-black text-emerald-600 outline-none focus:border-emerald-500 transition-all"
                   />
                </div>
             </div>
             <FormInput label="Lead Tech Operator" name="instructor" value={form.instructor} onChange={v => setForm({...form, instructor: v})} placeholder="FULL IDENTITY" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-center gap-4 p-6 bg-blue-50/50 dark:bg-white/5 rounded-3xl border border-blue-100 dark:border-white/5">
               <input 
                 type="checkbox"
                 checked={form.isVerified}
                 onChange={e => setForm({...form, isVerified: e.target.checked})}
                 className="w-6 h-6 rounded-xl border-2 border-blue-300 text-blue-600 focus:ring-blue-500"
               />
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-900 dark:text-white">Apply SC-Identity Shield</span>
             </div>
             <FormSelect label="Stream Status" name="status" value={form.status} onChange={v => setForm({...form, status: v})} options={[{v:'published', l:'PUBLISHED'}, {v:'draft', l:'DRAFT'}]} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all  text-xs">
            {loading ? 'Initializing Stream...' : (editId ? 'Commit Override' : 'Finalize Module')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

const FormInput = ({ label, value, onChange, placeholder, disabled, name }) => (
  <div>
    <label className="text-[10px] font-black uppercase text-blue-600/50 tracking-[0.2em] mb-3 block">{label}</label>
    <input 
      name={name}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl border-2 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-black placeholder:text-slate-300 outline-none focus:border-blue-600 transition-all text-sm uppercase"
      value={value}
      onChange={e => onChange?.(e.target.value)}
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options, name }) => (
  <div>
    <label className="text-[10px] font-black uppercase text-blue-600/50 tracking-[0.2em] mb-3 block">{label}</label>
    <select 
      name={name}
      className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl border-2 border-slate-100 dark:border-white/5 font-black text-sm outline-none focus:border-blue-600 text-slate-900 dark:text-white uppercase"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

export default CoursePanel;
