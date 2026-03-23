import React, { useState } from 'react';
import { 
  HiSearch, HiPencil, HiTrash, HiDownload, HiOfficeBuilding, HiMail, 
  HiGlobe, HiLocationMarker, HiCheckCircle, HiXCircle, HiBriefcase, HiPhone
} from 'react-icons/hi';
import { useDebounce } from '../../../hooks';
import { useLanguage } from '../../../contexts/LanguageContext';
import { db } from '../../../core/firebase/firebase';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EmployersPanel = ({ users }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  const employers = users.filter(u => u.role === 'jobFinder' || u.role === 'trainer' || u.role === 'jobOwner'); 
  
  const filtered = employers.filter(u =>
    (u.name || u.email || '').toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleStatusChange = async (id, status) => {
    try {
      await updateDoc(doc(db, 'users', id), { status });
      toast.success(`Partner identity ${status === 'active' ? 'authorized' : 'restricted'}`);
    } catch {
      toast.error('Identity update failed');
    }
  };

  const deleteEmployer = async (id) => {
    if (!window.confirm('PERMANENTLY PURGE PARTNER IDENTITY?')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      toast.success('Identity purged from registry');
      setSelectedEmployer(null);
    } catch {
      toast.error('Purge operation failed');
    }
  };

  const exportData = (type) => {
    if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet(filtered.map(u => ({
        UID: u.id,
        Organization: u.name,
        Email: u.email,
        Location: u.location || 'Addis Ababa',
        Status: u.status || 'active',
        Joined: u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Partners");
      XLSX.writeFile(wb, "SVTECH_PARTNERS.xlsx");
    } else {
      const doc = new jsPDF();
      doc.text("SVTECH PARTNER MATRIX REPORT", 14, 15);
      doc.autoTable({
        head: [['Organization', 'Contact', 'Location', 'State']],
        body: filtered.map(u => [
          u.name?.toUpperCase() || 'ANONYMOUS',
          u.email,
          u.location || 'Addis Ababa',
          u.status?.toUpperCase() || 'ACTIVE'
        ]),
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] }
      });
      doc.save("SVTECH_PARTNERS.pdf");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h3 className="text-4xl font-black text-blue-900 dark:text-white tracking-tighter uppercase  underline decoration-blue-600 decoration-4 underline-offset-8">Employer Matrix</h3>
          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-3">{employers.length} Registered Enterprise Partners</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => exportData('pdf')} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5 group">
             <HiDownload className="w-5 h-5 group-hover:bounce" />
          </button>
          <button onClick={() => exportData('excel')} className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/5 group">
             <HiBriefcase className="w-5 h-5 group-hover:rotate-12" />
          </button>
        </div>
      </div>

      {/* Intelligence Control Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1">
          <HiSearch className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Enterprise Identities..."
            className="w-full pl-20 pr-8 py-6 rounded-[2.5rem] bg-white dark:bg-[#0e1225] border border-blue-100 dark:border-white/5 text-slate-900 dark:text-white font-black placeholder:text-slate-300 focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none shadow-2xl shadow-blue-900/5"
          />
        </div>
        <div className="flex bg-blue-600 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-blue-600/20 items-center gap-6">
           <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
              <HiOfficeBuilding className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-100 opacity-60">Verified Nodes</p>
              <p className="text-2xl font-black tabular-nums leading-none mt-1">{employers.length}</p>
           </div>
        </div>
      </div>

      {/* Desktop Table: Advanced Scrollable Layout */}
      <div className="bg-white dark:bg-black rounded-[3.5rem] border-4 border-blue-600 dark:border-blue-900 shadow-2xl shadow-blue-900/10 overflow-hidden transition-all relative">
        <div className="overflow-auto max-h-[70vh] custom-scrollbar border-b-2 border-blue-50 dark:border-blue-900/30">
          <table className="w-full border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-20 shadow-xl">
              <tr className="bg-blue-600 dark:bg-blue-700 border-b-4 border-blue-700 dark:border-blue-900">
                <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black">Identity Details</th>
                <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black">Contact Flow</th>
                <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black">Registry State</th>
                <th className="p-8 text-right text-[12px] font-black uppercase tracking-[0.3em] text-black">Commands</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-blue-50 dark:divide-blue-900/30">
              {filtered.map(item => (
                <tr 
                  key={item.id} 
                  className="transition-all hover:bg-blue-50/40 dark:hover:bg-blue-900/20 group cursor-pointer relative"
                  onClick={() => setSelectedEmployer(item)}
                  title="Click to Access Partner Identity Matrix"
                >
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-blue-600 to-indigo-800 p-4 shadow-xl group-hover:rotate-6 transition-all duration-500 text-white flex items-center justify-center font-black text-2xl uppercase">
                        {item.name?.[0] || 'O'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-emerald-400 uppercase tracking-tight leading-none mb-2 group-hover:text-blue-600 transition-colors">{item.name || 'Anonymous Partner'}</p>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-slate-400 dark:text-emerald-500/30 uppercase tracking-widest bg-slate-50 dark:bg-blue-900/20 px-3 py-1 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 shadow-inner">ID: {item.id.slice(0,8)}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-3">
                       <span className="text-[13px] font-black text-slate-700 dark:text-emerald-400/60 flex items-center gap-2 tracking-tight group-hover:text-blue-600"><HiMail className="w-4 h-4 text-blue-500" /> {item.email}</span>
                       <span className="text-[10px] font-black text-slate-400 dark:text-emerald-500/20 uppercase tracking-[0.2em] flex items-center gap-2"><HiLocationMarker className="w-4 h-4 text-rose-500" /> {item.location || 'Distributed'}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-3">
                       <Badge variant={item.status === 'suspended' ? 'danger' : item.status === 'pending' ? 'warning' : 'success'} className="!px-7 !py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl w-max rounded-2xl">
                          {item.status || 'Verified'}
                       </Badge>
                       {item.status === 'pending' && <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Awaiting Payload Sync</p>}
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      {item.status === 'pending' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(item.id, 'active'); }} 
                          className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover-blue-gradient"
                          title="Authorize Node"
                        >
                           <HiCheckCircle className="w-6 h-6" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedEmployer(item); }} 
                        className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl shadow-xl shadow-amber-500/20 hover-blue-gradient"
                        title="Override Details"
                      >
                        <HiPencil className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteEmployer(item.id); }} 
                        className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-600/20 hover-blue-gradient"
                        title="Purge Node"
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

      {/* Intelligence Modal */}
      <Modal isOpen={!!selectedEmployer} onClose={() => setSelectedEmployer(null)} title="Identity Profile Hub" maxWidth="max-w-3xl">
        {selectedEmployer && (
          <div className="p-10 space-y-8 bg-white dark:bg-[#0e1225]">
             <div className="p-10 rounded-[3rem] bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 text-white shadow-2xl text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
                    <HiOfficeBuilding className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                   <div className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-xl mx-auto mb-6 flex items-center justify-center text-4xl font-black border border-white/30 shadow-2xl">
                      {selectedEmployer.name?.[0]}
                   </div>
                   <h4 className="text-4xl font-black uppercase tracking-tighter mb-2 ">{selectedEmployer.name}</h4>
                   <div className="flex items-center justify-center gap-4 text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
                      <span>{selectedEmployer.email}</span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      <span>{selectedEmployer.location || 'ADIS ABABA'}</span>
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Governance State</p>
                   <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{selectedEmployer.status || 'Active Protocol'}</p>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Onboarding Log</p>
                   <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedEmployer.createdAt ? new Date(selectedEmployer.createdAt.seconds * 1000).toLocaleDateString() : 'Historical Entry'}</p>
                </div>
             </div>

             <div className="flex gap-4 pt-4">
                {selectedEmployer.status === 'pending' && (
                  <button onClick={() => handleStatusChange(selectedEmployer.id, 'active')} className="flex-1 py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all">Authorize Node</button>
                )}
                {selectedEmployer.status !== 'suspended' ? (
                   <button onClick={() => handleStatusChange(selectedEmployer.id, 'suspended')} className="flex-1 py-5 bg-amber-500 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all">Restrict Access</button>
                ) : (
                   <button onClick={() => handleStatusChange(selectedEmployer.id, 'active')} className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">Reactivate Node</button>
                )}
                <button onClick={() => deleteEmployer(selectedEmployer.id)} className="flex-1 py-5 bg-rose-500 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all">Purge Node</button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployersPanel;
