import React, { useState } from 'react';
import { 
  HiPlus, HiPencil, HiTrash, HiEye, HiPhotograph, HiUpload, 
  HiChip, HiFingerPrint, HiDatabase, HiGlobe
} from 'react-icons/hi';
import { blogService } from '../../../core/services/firestoreService';
import { auth } from '../../../core/firebase/firebase';
import { POST_CATEGORIES } from '../../../core/utils/constants';
import { formatDate } from '../../../core/utils/formatters';
import { toast } from 'react-toastify';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';

const initialForm = {
  title: '', content: '', coverImage: '', category: 'article', tags: '', author: '', status: 'published',
};

const BlogPanel = ({ posts }) => {
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editId) {
        await blogService.update(editId, data);
        toast.success('Post updated successfully!');
      } else {
        await blogService.create({ 
          ...data, 
          authorName: auth.currentUser?.displayName || 'Admin', 
          author: auth.currentUser?.uid,
          createdAt: new Date()
        });
        toast.success('Post published successfully!');
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

  const editPost = (p) => {
    setForm({ 
      title: p.title, 
      content: p.content, 
      coverImage: p.coverImage || '', 
      category: p.category || 'article', 
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''), 
      author: p.authorName || '', 
      status: p.status || 'published' 
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const deletePost = async (id) => {
    if (!window.confirm('PERMANENTLY PURGE CONTENT FROM REGISTRY?')) return;
    try { await blogService.delete(id); toast.success('Content purged'); } catch { toast.error('Purge failed'); }
  };

  const gradients = [
    'from-blue-600 to-indigo-800', 
    'from-slate-800 to-slate-950', 
    'from-indigo-700 to-purple-900',
    'from-blue-500 to-cyan-600'
  ];

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h3 className="text-4xl font-black text-blue-900 dark:text-white tracking-tighter uppercase underline decoration-blue-600 decoration-4 underline-offset-8">Content Matrix</h3>
          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-3">{posts.length} Global Intelligence Briefings</p>
        </div>
        <button 
          onClick={() => { setForm(initialForm); setEditId(null); setShowForm(true); }} 
          className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-[2rem] shadow-2xl shadow-blue-900/40 hover:-translate-y-1 active:scale-95 transition-all font-black tracking-widest text-[11px] uppercase "
        >
          <HiPlus className="w-6 h-6"/> Initialize Transmission
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {posts.map(post => (
          <div key={post.id} className="p-6 bg-white dark:bg-black rounded-[2rem] border border-blue-50 dark:border-blue-900/30 shadow-xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-black uppercase shadow-lg">
                <HiGlobe />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-blue-400 uppercase tracking-tight truncate">{post.title}</p>
                <Badge variant="primary" className="!px-3 !py-0.5 text-[8px] uppercase tracking-widest mt-1">
                   {post.category}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-blue-900/20">
               <span className="text-[9px] font-black text-slate-400 dark:text-blue-300/40 uppercase tracking-widest">
                 {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'RECENT'}
               </span>
               <div className="flex gap-2">
                  <button onClick={() => editPost(post)} className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deletePost(post.id)} className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl">
                    <HiTrash className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table: Advanced Scrollable Layout */}
      <div className="hidden md:block bg-white dark:bg-black rounded-[3.5rem] border-4 border-blue-600 dark:border-blue-900 shadow-2xl shadow-blue-900/10 overflow-hidden transition-all relative">
        <div className="overflow-auto max-h-[70vh] custom-scrollbar border-b-2 border-blue-50 dark:border-blue-900/30">
          <table className="w-full border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-20 shadow-xl">
              <tr className="bg-blue-600 dark:bg-blue-700 border-b-4 border-blue-700 dark:border-blue-900">
                <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black">Content Node</th>
                <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black">Category</th>
                <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black">Deployed</th>
                <th className="p-8 text-right text-[12px] font-black uppercase tracking-[0.3em] text-black">Commands</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-blue-50 dark:divide-blue-900/30">
              {posts.map(post => (
                <tr 
                  key={post.id} 
                  className="transition-all hover:bg-blue-50/40 dark:hover:bg-blue-900/20 group cursor-pointer relative"
                  onClick={() => editPost(post)}
                  title="Click to Modify Content Module"
                >
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-all duration-500">
                          <HiGlobe className="w-8 h-8" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 dark:text-emerald-400 uppercase tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">{post.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-emerald-500/30 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                             <HiFingerPrint className="w-3.5 h-3.5" /> Deployed by {post.authorName || 'Admin'}
                          </p>
                       </div>
                    </div>
                  </td>
                  <td className="p-8">
                     <Badge variant="info" className="!px-7 !py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl rounded-2xl">
                        {post.category}
                     </Badge>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-black text-slate-700 dark:text-emerald-400/60 tracking-tighter tabular-nums flex items-center gap-2">
                         <HiChip className="w-4 h-4 text-blue-500" /> {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'RECENT'}
                      </p>
                      <p className="text-[9px] font-black text-slate-300 dark:text-emerald-500/10 uppercase tracking-widest">{post.id.slice(0,12)}</p>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <button 
                        onClick={(e) => { e.stopPropagation(); editPost(post); }} 
                        className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl shadow-xl hover-blue-gradient"
                        title="Override Module"
                      >
                        <HiPencil className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deletePost(post.id); }} 
                        className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-500/20 hover-blue-gradient"
                        title="Purge Module"
                      >
                        <HiTrash className="w-6 h-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {posts.length === 0 && (
        <div className="text-center py-40 bg-white dark:bg-black rounded-[4rem] border border-blue-100 dark:border-blue-900/20 shadow-2xl shadow-blue-900/5">
           <HiDatabase className="w-20 h-20 text-blue-100 dark:text-white/5 mx-auto mb-8 animate-bounce" />
           <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase ">Neural Network Empty</p>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Comms Array Dormant. Initialize Payload.</p>
        </div>
      )}

      {/* Editor Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Module Override' : 'Initialize Payload'} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white dark:bg-[#0e1225]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InputGroup label="Headline Title" name="title" value={form.title} onChange={v => setForm({...form, title: v})} placeholder="ENGAGING PROTOCOL TITLE" />
            <SelectGroup label="Intelligence Category" value={form.category} onChange={v => setForm({...form, category: v})} options={POST_CATEGORIES.map(c => ({ v: c, l: c.toUpperCase() }))} />
            <InputGroup label="Payload Status" name="status" value={form.status.toUpperCase()} disabled />
            <InputGroup label="Identity Image (URL)" name="coverImage" value={form.coverImage} onChange={v => setForm({...form, coverImage: v})} placeholder="HTTPS://MATRIX.STORAGE/NODE.PNG" />
          </div>

          <div>
             <label className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-4 block">Central Content Payload</label>
             <textarea 
               name="content"
               value={form.content}
               onChange={e => setForm({...form, content: e.target.value})}
               className="w-full bg-slate-50 dark:bg-black p-8 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-600 transition-all min-h-[300px]"
               placeholder="START TRANSMISSION..."
             />
          </div>

          <InputGroup label="Meta Tags (Separated by comma)" name="tags" value={form.tags} onChange={v => setForm({...form, tags: v})} placeholder="TECH, AI, DIGITAL" />

          <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all text-xs">
            {loading ? 'Initializing Stream...' : (editId ? 'Execute Override' : 'Finalize Broadcast')}
          </button>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Intelligence Preview" maxWidth="max-w-4xl">
         <div className="bg-[#0e1225] text-white rounded-[3rem] overflow-hidden">
            {form.coverImage && (
              <div className="h-96 relative">
                 <img src={form.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0e1225] to-transparent" />
              </div>
            )}
            <div className="p-12 relative z-10 -mt-20">
               <Badge className="mb-6 px-6 py-2 bg-blue-600 text-white font-black uppercase tracking-widest">{form.category}</Badge>
               <h1 className="text-5xl font-black uppercase tracking-tighter mb-8 leading-none">{form.title}</h1>
               <div className="prose prose-invert max-w-none text-blue-100/70 font-bold whitespace-pre-wrap leading-relaxed text-lg">
                  {form.content}
               </div>
            </div>
         </div>
      </Modal>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, disabled, placeholder }) => (
  <div>
     <label className="text-[10px] font-black uppercase text-blue-600/50 tracking-[0.2em] mb-3 block">{label}</label>
     <input 
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl border-2 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-black placeholder:text-slate-300 outline-none focus:border-blue-600 transition-all text-sm uppercase"
        value={value}
        onChange={e => onChange?.(e.target.value)}
     />
  </div>
);

const SelectGroup = ({ label, value, onChange, options }) => (
  <div>
     <label className="text-[10px] font-black uppercase text-blue-600/50 tracking-[0.2em] mb-3 block">{label}</label>
     <select 
       className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl border-2 border-slate-100 dark:border-white/5 font-black text-sm outline-none focus:border-blue-600 text-slate-900 dark:text-white uppercase"
       value={value}
       onChange={e => onChange(e.target.value)}
     >
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
     </select>
  </div>
);

export default BlogPanel;
