import React, { useState } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { jobService } from '../../../core/services/firestoreService';
import { auth } from '../../../core/firebase/firebase';
import { JOB_TYPES, JOB_STATUSES } from '../../../core/utils/constants';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';

const initialForm = {
  title: '', company: '', description: '', location: '', salary: '',
  requirements: '', deadline: '', type: 'full-time', status: 'open',
};

const JobPanel = ({ jobs, applications }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await jobService.update(editId, form);
        toast.success('Job updated');
      } else {
        await jobService.create({ ...form, createdBy: auth.currentUser?.uid });
        toast.success('Job posted');
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
    setForm({ title: j.title, company: j.company || '', description: j.description, location: j.location, salary: j.salary || '', requirements: j.requirements || '', deadline: j.deadline || '', type: j.type || 'full-time', status: j.status || 'open' });
    setEditId(j.id);
    setShowForm(true);
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try { await jobService.delete(id); toast.success('Job deleted'); } catch { toast.error('Failed'); }
  };

  const statusColors = { open: 'success', closed: 'danger', paused: 'warning' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
           <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight uppercase">{t('job_management') || 'Job Management'}</h3>
           <p className="text-sm font-black text-blue-600/50 dark:text-indigo-400/50 uppercase tracking-widest mt-1">Labor Market Orchestration</p>
        </div>
        <button onClick={() => { setForm(initialForm); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-widest text-xs">
          <HiPlus className="w-5 h-5"/> {t('postJob')}
        </button>
      </div>

      <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-blue-900/10 transition-all">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900 dark:bg-[#0e1225]">
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Position Title</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Employment Type</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Geographical Scope</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Availability</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Engagement</th>
                <th className="text-right p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-white/5">
              {jobs.map(j => (
                <tr key={j.id} className="transition-all group hover:bg-blue-50/50 dark:hover:bg-white/[0.02]">
                  <td className="p-6 align-middle">
                    <div className="flex flex-col">
                      <p className="text-sm font-black text-blue-900 dark:text-white tracking-tight uppercase">{j.title}</p>
                      <p className="text-[10px] font-black text-blue-600/40 dark:text-indigo-400/40 uppercase tracking-widest mt-1">{j.company}</p>
                    </div>
                  </td>
                  <td className="p-6 align-middle">
                     <Badge variant="info" className="!px-4 !py-1.5 !rounded-xl !text-[9px] !font-black !uppercase !tracking-widest shadow-lg">{j.type}</Badge>
                  </td>
                  <td className="p-6 align-middle">
                     <span className="text-xs font-black text-blue-900/60 dark:text-indigo-200/40 uppercase tracking-wider">{j.location}</span>
                  </td>
                  <td className="p-6 align-middle">
                     <Badge variant={statusColors[j.status] || 'default'} className="!px-4 !py-1.5 !rounded-xl !text-[9px] !font-black !uppercase !tracking-widest shadow-lg">{j.status}</Badge>
                  </td>
                  <td className="p-6 align-middle">
                    <div className="flex items-center gap-2">
                       <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black border border-blue-500/20">
                          {applications.filter(a => a.jobId === j.id).length}
                       </span>
                       <span className="text-[10px] font-black text-blue-200 dark:text-white/10 uppercase tracking-widest">SUBMISSIONS</span>
                    </div>
                  </td>
                  <td className="p-6 align-middle">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => editJob(j)} className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-white/5 flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg hover:rotate-12"><HiPencil className="w-5 h-5" /></button>
                      <button onClick={() => deleteJob(j.id)} className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-white/5 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:rotate-12"><HiTrash className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {jobs.length === 0 && <div className="text-center py-24 text-[11px] font-black text-blue-200 dark:text-white/10 uppercase tracking-[0.3em]">No Occupational Listings Cataloged</div>}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Job' : 'Post New Job'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="Job title" />
          <input name="company" value={form.company} onChange={handleChange} className="input-field" placeholder="Company name" />
          <textarea name="description" value={form.description} onChange={handleChange} required className="input-field resize-none" rows={3} placeholder="Job description" />
          <div className="grid grid-cols-2 gap-4">
            <input name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="Location" />
            <input name="salary" value={form.salary} onChange={handleChange} className="input-field" placeholder="Salary range" />
          </div>
          <textarea name="requirements" value={form.requirements} onChange={handleChange} className="input-field resize-none" rows={2} placeholder="Requirements" />
          <div className="grid grid-cols-3 gap-4">
            <select name="type" value={form.type} onChange={handleChange} className="input-field">
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              {JOB_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input name="deadline" value={form.deadline} onChange={handleChange} className="input-field" placeholder="Deadline" />
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            {editId ? 'Update Job' : 'Post Job'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default JobPanel;
