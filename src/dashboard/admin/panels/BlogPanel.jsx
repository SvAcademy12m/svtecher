import React, { useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiEye, HiPhotograph, HiUpload } from 'react-icons/hi';
import { blogService } from '../../../core/services/firestoreService';
import { auth } from '../../../core/firebase/firebase';
import { POST_CATEGORIES } from '../../../core/utils/constants';
import { formatDate } from '../../../core/utils/formatters';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
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
        await blogService.create({ ...data, authorName: auth.currentUser?.displayName || 'Admin', author: auth.currentUser?.uid });
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
    setForm({ title: p.title, content: p.content, coverImage: p.coverImage || '', category: p.category || 'article', tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''), author: p.authorName || '', status: p.status || 'published' });
    setEditId(p.id);
    setShowForm(true);
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try { await blogService.delete(id); toast.success('Post deleted'); } catch { toast.error('Failed'); }
  };

  const togglePublish = async (p) => {
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    await blogService.update(p.id, { status: newStatus });
    toast.success(`Post ${newStatus}`);
  };

  const previewPost = (p) => {
    setForm({ ...p, tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '') });
    setShowPreview(true);
  };

  // Generate a random gradient for empty states
  const gradients = [
    'from-rose-400 to-red-500', 'from-blue-400 to-indigo-500', 
    'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500',
    'from-purple-400 to-pink-500', 'from-cyan-400 to-blue-500'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
           <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight">Content Management</h3>
           <p className="text-sm font-black text-blue-600/50 dark:text-indigo-400/50 uppercase tracking-widest mt-1">Editorial Control & Publication</p>
        </div>
        <button onClick={() => { setForm(initialForm); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 transition-all font-black uppercase tracking-widest text-xs">
          <HiPlus className="w-5 h-5"/> New Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((p, idx) => (
          <div key={p.id} className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-50 dark:border-white/5 overflow-hidden shadow-2xl shadow-blue-900/10 hover:shadow-blue-500/20 transition-all duration-500 group flex flex-col relative">
            {/* Image Header */}
            <div className={`h-52 relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradients[idx % gradients.length]}`}>
              {p.coverImage ? (
                <img src={p.coverImage} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.title} />
              ) : (
                <HiPhotograph className="w-16 h-16 text-white/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-60" />
              <div className="absolute top-6 right-6 flex gap-2">
                <Badge variant={p.status === 'published' ? 'success' : 'warning'} className="!px-4 !py-1.5 !rounded-xl !text-[9px] !font-black !uppercase !tracking-widest shadow-2xl backdrop-blur-xl bg-white/10 text-white border-white/20">
                  {p.status || 'published'}
                </Badge>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-600 dark:text-indigo-400/60">{p.category}</span>
              </div>
              <h4 className="font-black text-xl text-blue-900 dark:text-white line-clamp-2 mb-3 leading-tight group-hover:text-blue-500 transition-colors uppercase tracking-tight">{p.title}</h4>
              <p className="text-sm font-medium text-blue-900/50 dark:text-slate-400/50 line-clamp-3 mb-8 flex-1 leading-relaxed">{p.content}</p>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-blue-50 dark:border-white/5">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase text-blue-200 dark:text-white/10 tracking-widest">Post Date</span>
                   <span className="text-[11px] font-black text-blue-900/40 dark:text-indigo-200/40 uppercase mt-0.5">{formatDate(p.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => previewPost(p)} className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-white/5 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:rotate-12" title="Inspect">
                    <HiEye className="w-5 h-5" />
                  </button>
                  <button onClick={() => editPost(p)} className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-white/5 flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg hover:rotate-12">
                    <HiPencil className="w-5 h-5" />
                  </button>
                  <button onClick={() => deletePost(p.id)} className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-white/5 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:rotate-12">
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-32 bg-white dark:bg-[#151a30] rounded-[2.5rem] border-2 border-dashed border-blue-100 dark:border-white/5 transition-all">
          <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
             <HiPhotograph className="w-12 h-12 text-blue-500 animate-pulse" />
          </div>
          <h4 className="text-2xl font-black text-blue-900 dark:text-white uppercase tracking-widest">Registry Empty</h4>
          <p className="text-sm font-black text-blue-600/40 dark:text-indigo-400/40 mt-2 max-w-sm mx-auto uppercase tracking-tighter">Your content ecosystem is currently dormant. Initiate your first publication to begin engagement.</p>
        </div>
      )}

      {/* Blue / White Editor Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Post' : 'Create Content'} maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 bg-[#0e1225] rounded-2xl shadow-inner space-y-5 border border-white/10">
            <div>
              <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Headline Title</label>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full bg-slate-900/50 text-white placeholder:text-slate-500 border border-white/10 p-4 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold" placeholder="Write an engaging title..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="w-full bg-slate-900/50 text-white border border-white/10 p-3.5 rounded-xl outline-none focus:border-blue-500 font-medium">
                  {POST_CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Visibility Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full bg-slate-900/50 text-white border border-white/10 p-3.5 rounded-xl outline-none focus:border-blue-500 font-medium">
                  <option value="published">PUBLISHED</option>
                  <option value="draft">DRAFT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2"><HiUpload/> Cover Image URL / Upload</label>
              <input name="coverImage" value={form.coverImage} onChange={handleChange} className="w-full bg-slate-900/50 text-white placeholder:text-slate-500 border border-white/10 p-4 rounded-xl focus:border-blue-500 font-medium" placeholder="https://example.com/image.png" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Article Body</label>
              <textarea name="content" value={form.content} onChange={handleChange} required className="w-full bg-slate-900/50 text-white placeholder:text-slate-500 border border-white/10 p-4 rounded-xl focus:border-blue-500 font-medium whitespace-pre-line resize-y min-h-[200px]" placeholder="Start typing your rich content..." />
            </div>

            <div>
              <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Hash Tags (Comma Separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} className="w-full bg-slate-900/50 text-white placeholder:text-slate-500 border border-white/10 p-4 rounded-xl focus:border-blue-500 font-medium" placeholder="tech, news, webdev..." />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black rounded-xl hover:shadow-lg hover:shadow-cyan-500/40 transition-all uppercase tracking-widest text-sm">
            {loading ? 'Processing...' : (editId ? 'Update Contents' : 'Publish to Live')}
          </button>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Content Preview" maxWidth="max-w-4xl">
        <div className="bg-white rounded-2xl overflow-hidden shadow-inner border border-slate-100">
           {form.coverImage && (
             <div className="h-64 sm:h-80 w-full relative">
               <img src={form.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
               <div className="absolute bottom-6 left-6 right-6">
                 <Badge variant="primary" className="mb-3 backdrop-blur-md bg-white/20 text-white border-white/30">{form.category}</Badge>
                 <h1 className="text-3xl sm:text-4xl font-black text-white">{form.title}</h1>
               </div>
             </div>
           )}
           <div className={`p-8 sm:p-12 ${!form.coverImage ? 'pt-8' : 'pt-6'}`}>
             {!form.coverImage && (
                <>
                  <Badge variant="primary" className="mb-4">{form.category}</Badge>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-8">{form.title}</h1>
                </>
             )}
             <div className="prose prose-slate max-w-none font-medium whitespace-pre-wrap">
               {form.content}
             </div>
             
             {form.tags && (
                <div className="mt-10 flex flex-wrap gap-2 pt-6 border-t border-slate-100">
                  {form.tags.split(',').map(t => t.trim() ? (
                    <span key={t} className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg uppercase tracking-wider">#{t}</span>
                  ) : null)}
                </div>
             )}
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default BlogPanel;
