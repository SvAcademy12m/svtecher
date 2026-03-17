import React, { useState } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { courseService } from '../../../core/services/firestoreService';
import { auth } from '../../../core/firebase/firebase';
import { COURSE_LEVELS, COURSE_CATEGORIES } from '../../../core/utils/constants';
import { formatCurrency } from '../../../core/utils/formatters';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';

const initialForm = {
  title: '', description: '', price: '', duration: '', level: 'beginner',
  instructor: '', category: 'accounting', thumbnail: '', videoUrl: '', materials: '', status: 'published',
};

const CoursePanel = ({ courses }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, price: Number(form.price) };
      if (editId) {
        await courseService.update(editId, data);
        toast.success('Course updated');
      } else {
        await courseService.create({ ...data, createdBy: auth.currentUser?.uid });
        toast.success('Course created');
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
    setForm({ title: c.title, description: c.description, price: c.price || '', duration: c.duration || '', level: c.level || 'beginner', instructor: c.instructor || '', category: c.category || 'development', thumbnail: c.thumbnail || '', videoUrl: c.videoUrl || '', materials: c.materials || '', status: c.status || 'published' });
    setEditId(c.id);
    setShowForm(true);
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try { await courseService.delete(id); toast.success('Course deleted'); } catch { toast.error('Failed to delete'); }
  };

  const togglePublish = async (c) => {
    const newStatus = c.status === 'published' ? 'unpublished' : 'published';
    await courseService.update(c.id, { status: newStatus });
    toast.success(`Course ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
           <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight uppercase">{t('course_management') || 'Course Management'}</h3>
           <p className="text-sm font-black text-blue-600/50 dark:text-indigo-400/50 uppercase tracking-widest mt-1 uppercase">Curriculum & Educational Assets</p>
        </div>
        <button onClick={() => { setForm(initialForm); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-widest text-xs">
          <HiPlus className="w-5 h-5"/> {t('addCourse')}
        </button>
      </div>

      {/* Course list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {courses.map(c => (
          <div key={c.id} className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-blue-900/10 hover:shadow-blue-500/20 transition-all duration-500 group flex flex-col relative">
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                     <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                     <span className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-600 dark:text-indigo-400/60">{c.category} · {c.level}</span>
                  </div>
                  <h4 className="font-black text-2xl text-blue-900 dark:text-white leading-tight group-hover:text-blue-500 transition-colors uppercase tracking-tight">{c.title}</h4>
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-black/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-white/5">
                           <span className="text-[10px] font-black uppercase tracking-tighter">ETB</span>
                        </div>
                        <span className="text-lg font-black text-blue-900 dark:text-emerald-400">{formatCurrency(c.price)}</span>
                     </div>
                     <span className="w-1 h-1 rounded-full bg-blue-100 dark:bg-white/10" />
                     <span className="text-xs font-black text-blue-900/40 dark:text-indigo-200/40 uppercase tracking-widest">{c.duration} Curriculum</span>
                  </div>
                </div>
                <Badge variant={c.status === 'published' ? 'success' : 'warning'} className="!px-4 !py-1.5 !rounded-xl !text-[9px] !font-black !uppercase !tracking-widest shadow-lg">{c.status || 'published'}</Badge>
              </div>

              <div className="p-6 bg-blue-50/50 dark:bg-black/20 rounded-3xl border border-blue-100 dark:border-white/5 mb-8">
                 <p className="text-sm font-medium text-blue-900/60 dark:text-slate-400/60 line-clamp-2 leading-relaxed italic">"{c.description}"</p>
                 <div className="flex items-center gap-2 mt-4 pt-4 border-t border-blue-100/50 dark:border-white/5">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-black">{(c.instructor?.[0] || 'I')}</div>
                    <span className="text-[10px] font-black uppercase text-blue-900/40 dark:text-indigo-200/40 tracking-widest">Instructor: {c.instructor || 'Staff Academic'}</span>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => editCourse(c)} className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-white/5 flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg hover:rotate-12">
                   <HiPencil className="w-5 h-5" />
                </button>
                <div className="flex-1">
                   <button onClick={() => togglePublish(c)} className="w-full py-3 rounded-2xl bg-white dark:bg-white/5 border-2 border-blue-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-blue-900/60 dark:text-white/60 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all">
                    {c.status === 'published' ? 'UNPUBLISH FROM LIVE' : 'PUBLISH TO LIVE'}
                   </button>
                </div>
                <button onClick={() => deleteCourse(c.id)} className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-white/5 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:rotate-12">
                   <HiTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-32 bg-white dark:bg-[#151a30] rounded-[2.5rem] border-2 border-dashed border-blue-100 dark:border-white/5 transition-all">
          <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
             <HiPlus className="w-12 h-12 text-blue-500 animate-pulse" />
          </div>
          <h4 className="text-2xl font-black text-blue-900 dark:text-white uppercase tracking-widest">Curriculum Registry Empty</h4>
          <p className="text-sm font-black text-blue-600/40 dark:text-indigo-400/40 mt-2 max-w-sm mx-auto uppercase tracking-tighter">No educational modules have been cataloged. Initiate a new course record to begin.</p>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Course' : 'Add Course'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={form.title} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none" placeholder="e.g. Peachtree Accounting / QuickBooks Pro" />
          <textarea name="description" value={form.description} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none resize-y min-h-[100px]" placeholder="Full detailed course description..." />
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Course Price (ETB)</label>
               <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-base font-black p-3 rounded-xl focus:border-emerald-500 outline-none" placeholder="e.g. 5000" />
            </div>
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Training Duration</label>
               <input name="duration" value={form.duration} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none" placeholder="Duration (e.g. 8 weeks / 3 months)" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Experience Level</label>
               <select name="level" value={form.level} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none">
                 {COURSE_LEVELS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Course Category</label>
               <select name="category" value={form.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none">
                 {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                 <option value="accounting">Accounting Software (Peachtree/QuickBooks)</option>
                 <option value="computers">Computers & Basic IT</option>
                 <option value="hardware">Hardware & Maintenance</option>
               </select>
            </div>
          </div>
          <input name="instructor" value={form.instructor} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none" placeholder="Instructor name" />
          <input name="thumbnail" value={form.thumbnail} onChange={handleChange} className="input-field" placeholder="Thumbnail URL" />
          <input name="videoUrl" value={form.videoUrl} onChange={handleChange} className="input-field" placeholder="Video URL" />
          <input name="materials" value={form.materials} onChange={handleChange} className="input-field" placeholder="Materials URL" />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            {editId ? 'Update Course' : 'Create Course'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default CoursePanel;
