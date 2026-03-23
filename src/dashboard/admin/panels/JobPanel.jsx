import React, { useState } from 'react';
import { 
  HiPlus, HiPencil, HiTrash, HiCheckCircle, HiBriefcase, HiLocationMarker, 
  HiCurrencyDollar, HiIdentification, HiUsers, HiLightningBolt
} from 'react-icons/hi';
import { jobService } from '../../../core/services/firestoreService';
import { auth, db } from '../../../core/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { JOB_TYPES, JOB_STATUSES } from '../../../core/utils/constants';
import { toast } from 'react-toastify';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import { useLanguage } from '../../../contexts/LanguageContext';

const initialForm = {
  title: '', company: '', description: '', location: '', salary: '',
  requirements: '', deadline: '', type: 'full-time', status: 'open', isVerified: false,
};

const JobPanel = ({ jobs, applications }) => {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await jobService.update(editId, form);
        toast.success('Occupational record updated');
      } else {
        await jobService.create({ 
          ...form, 
          createdBy: auth.currentUser?.uid,
          createdAt: new Date()
        });
        toast.success('New occupational node deployed');
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

  const editJob = (j) => {
    setForm({ 
      title: j.title, 
      company: j.company || '', 
      description: j.description, 
      location: j.location, 
      salary: j.salary || '', 
      requirements: j.requirements || '', 
      deadline: j.deadline || '', 
      type: j.type || 'full-time', 
      status: j.status || 'open', 
      isVerified: !!j.isVerified 
    });
    setEditId(j.id);
    setShowForm(true);
  };

  const deleteJob = async (id) => {
    if (!window.confirm('PERMANENTLY PURGE OCCUPATIONAL RECORD?')) return;
    try { await jobService.delete(id); toast.success('Record purged'); } catch { toast.error('Purge failed'); }
  };

  const toggleVerify = async (j) => {
    try {
      await updateDoc(doc(db, 'jobs', j.id), { isVerified: !j.isVerified });
      toast.success(`Identity verification ${!j.isVerified ? 'authorized' : 'revoked'}`);
    } catch {
      toast.error('Verification toggle failed');
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h3 className="text-4xl font-black text-blue-900 dark:text-white tracking-tighter uppercase  underline decoration-blue-600 decoration-4 underline-offset-8">Job Matrix</h3>
          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-3">{jobs.length} Active Occupational Nodes</p>
        </div>
        <button 
          onClick={() => { setForm(initialForm); setEditId(null); setShowForm(true); }} 
          className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-[2rem] shadow-2xl shadow-blue-900/40 hover:-translate-y-1 active:scale-95 transition-all font-black tracking-widest text-[11px] uppercase "
        >
          <HiPlus className="w-6 h-6"/> Initialize Job Node
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {jobs.map(j => {
          const appCount = applications.filter(a => a.jobId === j.id).length;
          return (
            <div key={j.id} className="p-6 bg-white dark:bg-black rounded-[2rem] border border-blue-50 dark:border-blue-900/30 shadow-xl relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-black uppercase shadow-lg">
                  <HiBriefcase />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-blue-400 uppercase tracking-tight truncate">{j.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-blue-300/40 uppercase tracking-widest">{j.company || 'Enterprise'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-blue-900/20">
                 <div className="flex items-center gap-2">
                    <HiUsers className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{appCount} Targets</span>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => toggleVerify(j)} className={`p-3 rounded-xl ${j.isVerified ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-blue-900/20 text-slate-400'}`}>
                      <HiLightningBolt className="w-4 h-4" />
                    </button>
                    <button onClick={() => editJob(j)} className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                      <HiPencil className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table: Advanced Scrollable Layout */}
      <div className="hidden md:block bg-white dark:bg-black rounded-[3.5rem] border-4 border-blue-600 dark:border-blue-900 shadow-2xl shadow-blue-900/10 overflow-hidden transition-all relative">
        <div className="overflow-auto max-h-[70vh] custom-scrollbar border-b-2 border-blue-50 dark:border-blue-900/30">
          <table className="w-full border-collapse min-w-[1400px]">
            <thead className="sticky top-0 z-20 shadow-xl">
              <tr className="bg-blue-600 dark:bg-blue-700 border-b-4 border-blue-700 dark:border-blue-900">
                <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black ">Occupational Identity</th>
                <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black ">Deployment Type</th>
                <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black ">Review Status</th>
                <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black ">Intake Log</th>
                <th className="p-8 text-right text-[12px] font-black uppercase tracking-[0.3em] text-black ">Commands</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-blue-50 dark:divide-blue-900/30">
              {jobs.map(j => {
                const appCount = applications.filter(a => a.jobId === j.id).length;
                return (
                  <tr 
                    key={j.id} 
                    className="transition-all hover:bg-blue-50/40 dark:hover:bg-blue-900/20 group cursor-pointer relative"
                    onClick={() => editJob(j)}
                    title="Click to Modify Occupational Node"
                  >
                    <td className="p-8">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white shadow-xl group-hover:rotate-6 transition-all duration-500">
                             <HiBriefcase className="w-full h-full" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                               <p className="text-sm font-black text-slate-900 dark:text-emerald-400 uppercase tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">{j.title}</p>
                               {j.isVerified && <HiCheckCircle className="text-blue-600 w-5 h-5 shadow-lg" />}
                            </div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-emerald-500/30 uppercase tracking-widest">{j.company || 'Enterprise Node'} · {j.location || 'Distributed'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-8">
                       <Badge variant="info" className="!px-7 !py-3 !rounded-2xl !text-[10px] !font-black !tracking-widest shadow-xl uppercase ">
                          {j.type}
                       </Badge>
                    </td>
                    <td className="p-8">
                       <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center gap-2 text-[10px] font-black tracking-widest rounded-2xl px-5 py-2.5 border-2 shadow-lg transition-all ${
                            j.status === 'open' 
                              ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30 shadow-emerald-500/10' 
                              : 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30 shadow-rose-500/10'
                          }`}>
                            <span className={`w-2.5 h-2.5 rounded-full shadow-lg ${j.status === 'open' ? 'bg-emerald-500 animate-pulse shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'}`} />
                            {j.status === 'open' ? 'RECRUITING' : 'SUSPENDED'}
                          </span>
                       </div>
                    </td>
                    <td className="p-8">
                       <div className="flex items-center gap-5">
                          <div className="bg-slate-50 dark:bg-blue-900/20 px-6 py-3 rounded-2xl border border-slate-100 dark:border-blue-900/20 flex items-center gap-3 shadow-inner">
                             <HiUsers className="w-5 h-5 text-blue-600" />
                             <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">{appCount}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 dark:text-emerald-500/40 uppercase tracking-widest leading-none">Global<br/>Candidates</span>
                       </div>
                    </td>
                    <td className="p-8 text-right">
                       <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                         <button 
                           onClick={(e) => { e.stopPropagation(); toggleVerify(j); }} 
                           title={j.isVerified ? 'Revoke Shield' : 'Apply Shield'} 
                           className={`p-4 rounded-2xl shadow-xl transition-all hover-blue-gradient ${j.isVerified ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'}`}
                         >
                            {j.isVerified ? <HiLightningBolt className="w-6 h-6" /> : <HiCheckCircle className="w-6 h-6" />}
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); editJob(j); }} 
                           className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl shadow-xl hover-blue-gradient"
                           title="Override Node"
                         >
                            <HiPencil className="w-6 h-6" />
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); deleteJob(j.id); }} 
                           className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-600/20 hover-blue-gradient"
                           title="Purge Node"
                         >
                            <HiTrash className="w-6 h-6" />
                         </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {jobs.length === 0 && (
           <div className="text-center py-40 border-t-4 border-blue-600 dark:border-blue-900">
              <HiDatabase className="w-20 h-20 text-blue-600 dark:text-blue-400/20 mx-auto mb-8 animate-bounce" />
              <p className="text-2xl font-black text-slate-900 dark:text-blue-400 tracking-tighter uppercase ">Registry Dormant</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Initialize occupational stream to proceed.</p>
           </div>
        )}
      </div>

      {/* Editor Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Override Job Node' : 'Initialize Job Node'} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white dark:bg-[#0e1225]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <FormInput label="Occupational Title" name="title" value={form.title} onChange={v => setForm({...form, title: v})} placeholder="SENIOR SYSTEMS ARCHITECT" />
             <FormInput label="Enterprise Identity" name="company" value={form.company} onChange={v => setForm({...form, company: v})} placeholder="GLOBAL SOLUTIONS INC" />
             <FormInput label="Deployment Location" name="location" value={form.location} onChange={v => setForm({...form, location: v})} placeholder="ADIS ABABA / HYBRID" />
             <FormInput label="Fiscal Setpoint (Range)" name="salary" value={form.salary} onChange={v => setForm({...form, salary: v})} placeholder="50K - 80K ETB" />
          </div>

          <div>
             <label className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-4 block">Operation Parameters (Description)</label>
             <textarea 
               name="description"
               value={form.description}
               onChange={e => setForm({...form, description: e.target.value})}
               className="w-full bg-slate-50 dark:bg-black p-8 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-600 transition-all min-h-[150px]"
               placeholder="DEFINE MISSION PARAMETERS..."
             />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <FormSelect label="Engagement Type" name="type" value={form.type} onChange={v => setForm({...form, type: v})} options={JOB_TYPES.map(t => ({ v: t, l: t.toUpperCase() }))} />
             <FormSelect label="Initial Status" name="status" value={form.status} onChange={v => setForm({...form, status: v})} options={JOB_STATUSES.map(s => ({ v: s, l: s.toUpperCase() }))} />
          </div>

          <div className="flex items-center gap-4 p-8 bg-blue-50/50 dark:bg-white/5 rounded-[2.5rem] border border-blue-100 dark:border-white/5">
             <input 
               type="checkbox"
               checked={form.isVerified}
               onChange={e => setForm({...form, isVerified: e.target.checked})}
               className="w-8 h-8 rounded-2xl border-2 border-blue-300 text-blue-600 focus:ring-blue-500"
             />
             <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-blue-900 dark:text-white">Apply SC-Identity Shield</p>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1 opacity-60">Authorize official SVTECH verification badge for this node.</p>
             </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all  text-xs">
            {loading ? 'Initializing Stream...' : (editId ? 'Commit Override' : 'Finalize Deployment')}
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

export default JobPanel;
