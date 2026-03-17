import React, { useState } from 'react';
import { HiSearch, HiPencil, HiTrash, HiDownload, HiOfficeBuilding, HiMail, HiGlobe, HiLocationMarker } from 'react-icons/hi';
import { useDebounce } from '../../../hooks';
import { useLanguage } from '../../../contexts/LanguageContext';
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

  // Filter for employers (using 'jobFinder' as placeholder if no explicit employer role, 
  // but let's assume we filter users who have posted jobs or specific role)
  // For this demo, let's filter by a role or just show all if role not specific
  const employers = users.filter(u => u.role === 'jobFinder' || u.role === 'trainer'); 
  
  const filtered = employers.filter(u =>
    (u.name || u.email || '').toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(u => ({
      ID: u.id,
      Company: u.name,
      Email: u.email,
      Location: u.location || 'Addis Ababa',
      Industry: 'Technology',
      Status: u.status || 'active',
      Joined: u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employers");
    XLSX.writeFile(wb, "Employers_Export.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Employer Directory Report", 14, 15);
    doc.autoTable({
      head: [['Identity', 'Contact', 'Location', 'Industry', 'Status']],
      body: filtered.map(u => [
        u.name || 'Anonymous',
        u.email,
        u.location || 'Addis Ababa',
        'Technology',
        u.status || 'active'
      ]),
      startY: 20,
    });
    doc.save("Employers_Report.pdf");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight uppercase">Employer Registry</h3>
          <p className="text-sm font-black text-blue-600/50 dark:text-indigo-400/50 uppercase tracking-widest mt-1">{employers.length} Verified Partners</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToPDF} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 text-rose-600 dark:text-rose-400 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-all border border-rose-500/10 shadow-xl group">
            <HiDownload className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/10 shadow-xl group">
            <HiDownload className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Search & Intelligence */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <HiSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search organizations or partners..."
            className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white dark:bg-[#151a30] border-2 border-blue-50 dark:border-white/5 text-blue-900 dark:text-white font-black placeholder:text-blue-200 focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none shadow-2xl shadow-blue-900/5"
          />
        </div>
        <div className="flex items-center gap-4 bg-blue-900 dark:bg-indigo-900 rounded-[2rem] px-8 text-white shadow-xl">
           <HiOfficeBuilding className="w-6 h-6 text-blue-300" />
           <div className="py-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">Total Partners</p>
              <p className="text-xl font-black">{employers.length}</p>
           </div>
        </div>
      </div>

      {/* Modern Responsive Table */}
      <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-50 dark:border-white/5 overflow-hidden shadow-2xl shadow-blue-900/10">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900 dark:bg-indigo-950">
                <th className="text-left p-7 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Organization Details</th>
                <th className="text-left p-7 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Global Contact</th>
                <th className="text-left p-7 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Primary Location</th>
                <th className="text-left p-7 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Registry Status</th>
                <th className="text-right p-7 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-white/5">
              {filtered.map(item => (
                <tr key={item.id} className="transition-all hover:bg-blue-50/50 dark:hover:bg-white/[0.02] group cursor-pointer" onClick={() => setSelectedEmployer(item)}>
                  <td className="p-7">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-[2px] shadow-lg shadow-blue-600/20 group-hover:rotate-6 transition-all">
                        <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#151a30] flex items-center justify-center text-blue-600 dark:text-white font-black">
                          {item.name?.[0] || 'C'}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-black text-blue-900 dark:text-white uppercase tracking-tight">{item.name || 'Global Enterprise'}</p>
                        <p className="text-[10px] font-black text-blue-600/40 uppercase tracking-widest mt-1">Verified Employer</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-7">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-[12px] font-black text-blue-800 dark:text-slate-300">
                          <HiMail className="w-4 h-4 text-blue-400" />
                          {item.email}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                          <HiGlobe className="w-4 h-4" />
                          www.{item.name?.toLowerCase().replace(/ /g, '') || 'company'}.com
                       </div>
                    </div>
                  </td>
                  <td className="p-7">
                    <div className="flex items-center gap-2 text-sm font-black text-blue-900/60 dark:text-slate-300/60 uppercase">
                       <HiLocationMarker className="w-4 h-4 text-rose-500" />
                       {item.location || 'Addis Ababa, ET'}
                    </div>
                  </td>
                  <td className="p-7">
                    <Badge variant={item.status === 'suspended' ? 'danger' : 'success'} className="!px-5 !py-2 text-[10px] font-black uppercase tracking-widest shadow-lg">
                      {item.status || 'Verified'}
                    </Badge>
                  </td>
                  <td className="p-7 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-3 rounded-xl bg-blue-50 dark:bg-white/5 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <HiPencil className="w-5 h-5" />
                      </button>
                      <button className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <HiOfficeBuilding className="w-16 h-16 text-blue-100 dark:text-white/5 mx-auto mb-4" />
            <p className="text-sm font-black text-blue-200 dark:text-white/10 uppercase tracking-[0.4em]">No Partners Found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={!!selectedEmployer} onClose={() => setSelectedEmployer(null)} title="Employer Intelligence">
        {selectedEmployer && (
          <div className="space-y-6">
             <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-2xl text-center relative overflow-hidden">
                <div className="relative z-10">
                   <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md mx-auto mb-4 flex items-center justify-center text-3xl font-black border border-white/20">
                      {selectedEmployer.name?.[0]}
                   </div>
                   <h4 className="text-2xl font-black uppercase mb-1">{selectedEmployer.name}</h4>
                   <p className="text-blue-200 text-xs font-black uppercase tracking-widest">{selectedEmployer.email}</p>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-white/5 border border-blue-100 dark:border-white/5">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status</p>
                   <p className="text-sm font-black text-blue-900 dark:text-white uppercase">{selectedEmployer.status || 'Active'}</p>
                </div>
                <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-white/5 border border-blue-100 dark:border-white/5">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Joined</p>
                   <p className="text-sm font-black text-blue-900 dark:text-white">{selectedEmployer.createdAt ? new Date(selectedEmployer.createdAt.seconds * 1000).toLocaleDateString() : '—'}</p>
                </div>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployersPanel;
