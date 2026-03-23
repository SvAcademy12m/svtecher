import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { HiPlus, HiPencil, HiTrash, HiGlobe, HiDeviceMobile, HiExternalLink } from 'react-icons/hi';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { toast } from 'react-toastify';

const initialForm = {
  name: '', description: '', type: 'website', url: '', price: '',
  clientName: '', clientEmail: '', status: 'active', tech: '', thumbnail: '',
};

const WebAppPanel = () => {
  const { t } = useLanguage();
  const { formatPrice, formatDualPrice } = useCurrency();
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'web_apps'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, price: Number(form.price) || 0 };
      if (editId) {
        await updateDoc(doc(db, 'web_apps', editId), { ...data, updatedAt: serverTimestamp() });
        toast.success('Updated successfully');
      } else {
        await addDoc(collection(db, 'web_apps'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success('Added successfully');
      }
      setForm(initialForm);
      setEditId(null);
      setShowForm(false);
    } catch {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || '', description: item.description || '', type: item.type || 'website',
      url: item.url || '', price: item.price || '', clientName: item.clientName || '',
      clientEmail: item.clientEmail || '', status: item.status || 'active',
      tech: item.tech || '', thumbnail: item.thumbnail || '',
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await deleteDoc(doc(db, 'web_apps', id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  const typeIcon = (type) => type === 'mobile_app' ? <HiDeviceMobile className="w-5 h-5" /> : <HiGlobe className="w-5 h-5" />;
  const statusColor = { active: 'success', draft: 'warning', archived: 'default', sold: 'primary' };

  const totalValue = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight">{t('webApps')}</h3>
          <p className="text-sm font-black text-blue-600 dark:text-white tracking-widest mt-1">Manage Websites, Web Apps, Mobile Apps & Digital Products</p>
        </div>
        <Button icon={HiPlus} onClick={() => { setForm(initialForm); setEditId(null); setShowForm(true); }}>
          Add Product
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#151a30] rounded-2xl border border-slate-100 dark:border-white/5 p-5">
          <p className="text-[10px] font-black text-slate-400 dark:text-white/40 tracking-wider">Total Products</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{items.length}</p>
        </div>
        <div className="bg-white dark:bg-[#151a30] rounded-2xl border border-slate-100 dark:border-white/5 p-5">
          <p className="text-[10px] font-black text-slate-400 dark:text-white/40 tracking-wider">Websites Matrix</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{items.filter(i => i.type === 'website').length}</p>
        </div>
        <div className="bg-white dark:bg-[#151a30] rounded-2xl border border-slate-100 dark:border-white/5 p-5">
          <p className="text-[10px] font-black text-slate-400 dark:text-white/40 tracking-wider">Application Nodes</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{items.filter(i => i.type === 'mobile_app' || i.type === 'web_app').length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-5 text-white">
          <p className="text-[10px] font-black text-blue-100 tracking-wider">Portfolio Net Worth</p>
          <p className="text-2xl font-black mt-1">{formatPrice(totalValue)}</p>
          <p className="text-[10px] text-blue-50 font-black mt-0.5">{formatDualPrice(totalValue).usd}</p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
            {/* Thumbnail */}
            <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative overflow-hidden">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  {typeIcon(item.type)}
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{item.type?.replace('_', ' ')}</p>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={statusColor[item.status] || 'default'}>{item.status}</Badge>
              </div>
            </div>

            <div className="p-4">
              <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>

              {item.clientName && <p className="text-[10px] text-slate-400 mt-2">Client: {item.clientName}</p>}
              {item.tech && <p className="text-[10px] text-blue-500 mt-1">{item.tech}</p>}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <div>
                  <p className="text-sm font-bold text-slate-900">{formatPrice(item.price)}</p>
                  <p className="text-[10px] text-slate-400">{formatDualPrice(item.price).usd}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50">
                      <HiExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && <div className="text-center py-16 text-sm text-slate-400">No products added yet</div>}

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Product' : 'Add Product'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="Product name" />
          <textarea name="description" value={form.description} onChange={handleChange} className="input-field resize-none" rows={3} placeholder="Description" />
          <div className="grid grid-cols-2 gap-4">
            <select name="type" value={form.type} onChange={handleChange} className="input-field">
              <option value="website">Website</option>
              <option value="web_app">Web Application</option>
              <option value="mobile_app">Mobile App</option>
              <option value="digital_product">Digital Product</option>
              <option value="template">Template / Theme</option>
              <option value="saas">SaaS Product</option>
            </select>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="price" type="number" value={form.price} onChange={handleChange} className="input-field" placeholder="Price (ETB)" />
            <input name="url" value={form.url} onChange={handleChange} className="input-field" placeholder="Live URL" />
          </div>
          <input name="tech" value={form.tech} onChange={handleChange} className="input-field" placeholder="Tech stack (React, Node, etc.)" />
          <div className="grid grid-cols-2 gap-4">
            <input name="clientName" value={form.clientName} onChange={handleChange} className="input-field" placeholder="Client name" />
            <input name="clientEmail" value={form.clientEmail} onChange={handleChange} className="input-field" placeholder="Client email" />
          </div>
          <input name="thumbnail" value={form.thumbnail} onChange={handleChange} className="input-field" placeholder="Thumbnail URL" />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            {editId ? 'Update' : 'Add Product'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default WebAppPanel;
