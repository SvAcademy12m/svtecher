import React, { useState } from 'react';
import { HiCheck, HiX, HiEye, HiTrash, HiDownload, HiPhone, HiMail } from 'react-icons/hi';
import { applicationService } from '../../../core/services/firestoreService';
import { toast } from 'react-toastify';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import * as XLSX from 'xlsx';

const ApplicationsPanel = ({ applications }) => {
  const [selectedApp, setSelectedApp] = useState(null);

  const updateStatus = async (appId, newStatus) => {
    try {
      await applicationService.update(appId, { status: newStatus });
      toast.success(`Application marked as ${newStatus}`);
      setSelectedApp(prev => prev?.id === appId ? { ...prev, status: newStatus } : prev);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteApp = async (appId) => {
    if (!window.confirm('Delete this application permanently?')) return;
    try {
      await applicationService.delete(appId);
      toast.success('Application deleted');
      if (selectedApp?.id === appId) setSelectedApp(null);
    } catch {
      toast.error('Failed to delete application');
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(applications.map(app => ({
      Applicant: app.applicantName || 'Unnamed',
      Email: app.applicantEmail || 'N/A',
      Phone: app.phone || 'N/A',
      JobTitle: app.jobTitle || 'N/A',
      Status: app.status || 'pending',
      AppliedDate: app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    XLSX.writeFile(wb, "Job_Applications_Export.xlsx");
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
        <div>
           <h3 className="text-sm font-black text-blue-600 tracking-wider mb-2 text-left">Talent Acquisition</h3>
           <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Candidate <span className="text-blue-700">Dossiers</span></h2>
           <p className="text-[10px] font-black text-slate-500 dark:text-white tracking-widest mt-4">{applications.length} Total Applications Ingested</p>
        </div>
         <button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#151a30] text-emerald-600 rounded-2xl text-[10px] font-black tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-blue-500/5 group border border-slate-100 dark:border-white/5 hover:-translate-y-1">
          <HiDownload className="w-4 h-4 group-hover:animate-bounce" /> Export Data Vault
        </button>
      </div>

      {/* Desktop Table: Advanced Scrollable Layout */}
      <div className="bg-white dark:bg-black rounded-[3.5rem] border-4 border-blue-600 dark:border-blue-900 shadow-2xl shadow-blue-900/10 overflow-hidden relative z-10 transition-all">
        <div className="overflow-auto max-h-[70vh] custom-scrollbar border-b-2 border-blue-50 dark:border-blue-900/30">
          <table className="w-full border-collapse min-w-[1400px]">
            <thead className="sticky top-0 z-20 shadow-xl">
              <tr className="bg-blue-600 dark:bg-blue-700 border-b-4 border-blue-700 dark:border-blue-900">
                 <th className="text-left py-8 px-8 text-[12px] font-black uppercase tracking-[0.3em] text-black">Applicant Identity</th>
                <th className="text-left py-8 px-8 text-[12px] font-black uppercase tracking-[0.3em] text-black">Target Position</th>
                <th className="text-left py-8 px-8 text-[12px] font-black uppercase tracking-[0.3em] text-black">Submission Log</th>
                <th className="text-left py-8 px-8 text-[12px] font-black uppercase tracking-[0.3em] text-black">Review Status</th>
                <th className="text-right py-8 px-8 text-[12px] font-black uppercase tracking-[0.3em] text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-blue-50 dark:divide-blue-900/30">
              {applications.map(app => (
                <tr 
                  key={app.id} 
                  className="transition-all group hover:bg-blue-50/40 dark:hover:bg-blue-900/20 cursor-pointer relative"
                  onClick={() => setSelectedApp(app)}
                  title="Click to Access Candidate Dossier"
                >
                  <td className="py-8 px-8 align-middle">
                    <div className="flex flex-col">
                      <p className="text-sm font-black text-slate-900 dark:text-emerald-400 tracking-tight leading-none group-hover:text-blue-600 transition-colors uppercase">
                        {app.applicantName || 'Anonymous Candidate'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                         <a href={`mailto:${app.applicantEmail}`} className="text-[10px] font-black text-slate-400 dark:text-emerald-500/30 hover:text-blue-600 transition-colors tracking-widest flex items-center gap-2">
                           <HiMail className="w-4 h-4" /> {app.applicantEmail || 'No Email'}
                         </a>
                         {app.phone && (
                           <a href={`tel:${app.phone}`} className="text-[10px] font-black text-slate-400 dark:text-emerald-500/30 hover:text-emerald-500 transition-colors tracking-widest flex items-center gap-2">
                             <HiPhone className="w-4 h-4" /> {app.phone}
                           </a>
                         )}
                      </div>
                    </div>
                  </td>
                   <td className="py-8 px-8 align-middle font-black text-[11px] text-blue-600 dark:text-emerald-400/60 uppercase tracking-widest">
                     {app.jobTitle || 'Unspecified Role'}
                   </td>
                   <td className="py-8 px-8 align-middle text-[10px] font-black text-slate-400 dark:text-emerald-500/20 uppercase tracking-widest">
                     <span className="bg-slate-50 dark:bg-blue-900/20 px-5 py-2.5 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                       {app.createdAt ? new Date(app.createdAt?.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}
                     </span>
                  </td>
                  <td className="py-8 px-8 align-middle">
                     <span className={`inline-flex items-center px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 shadow-lg transition-all ${
                      app.status === 'accepted' ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30 shadow-emerald-500/10' :
                      app.status === 'rejected' ? 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30 shadow-rose-500/10' :
                      'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30 shadow-amber-500/10'
                    }`}>
                      <span className={`w-2.5 h-2.5 rounded-full mr-2 shadow-lg ${
                         app.status === 'accepted' ? 'bg-emerald-500 shadow-emerald-500/50' : app.status === 'rejected' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-amber-500 shadow-amber-500/50 animate-pulse'
                      }`} />
                      {app.status === 'accepted' ? 'VERIFIED' : app.status === 'rejected' ? 'DECLINED' : 'AWAITING LOG'}
                    </span>
                  </td>
                  <td className="py-8 px-8 align-middle">
                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }} 
                         className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/20 hover-blue-gradient" 
                         title="Inspect Full Dossier"
                       >
                         <HiEye className="w-6 h-6" />
                       </button>
                       <div className="flex bg-slate-50 dark:bg-blue-900/20 p-2 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 shadow-inner">
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateStatus(app.id, 'accepted'); }} 
                            className="p-4 rounded-2xl text-emerald-500 hover-blue-gradient" 
                            title="Authorize Candidate"
                          >
                            <HiCheck className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateStatus(app.id, 'rejected'); }} 
                            className="p-4 rounded-2xl text-amber-600 hover-blue-gradient" 
                            title="Decline Candidate"
                          >
                            <HiX className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteApp(app.id); }} 
                            className="p-4 rounded-2xl text-rose-600 hover-blue-gradient" 
                            title="Purge Record"
                          >
                            <HiTrash className="w-6 h-6" />
                          </button>
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {applications.length === 0 && (
           <div className="text-center py-32 flex flex-col items-center justify-center">
              <HiSearch className="w-16 h-16 text-slate-200 mb-6" />
              <p className="text-[11px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.3em]">No Candidate Applications Cataloged</p>
           </div>
        )}
      </div>

      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Full Application Details" maxWidth="max-w-3xl">
        {selectedApp && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border border-slate-100">
               <div>
                 <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedApp.applicantName}</h2>
                 <p className="text-sm font-bold text-slate-500">{selectedApp.jobTitle}</p>
               </div>
               <Badge variant={selectedApp.status === 'accepted' ? 'success' : selectedApp.status === 'rejected' ? 'danger' : 'warning'} className="text-sm px-4 py-2 font-black tracking-wider">
                 {selectedApp.status === 'accepted' ? 'Accepted' : selectedApp.status === 'rejected' ? 'Rejected' : 'Pending'}
               </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <h4 className="text-xs font-black tracking-widest text-slate-400">Contact Information</h4>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><HiMail className="w-4 h-4"/></div>
                     <div><p className="text-[10px] font-bold text-slate-400 tracking-wider">Email Profile</p><a href={`mailto:${selectedApp.applicantEmail}`} className="text-sm font-black text-slate-800 hover:text-blue-600">{selectedApp.applicantEmail}</a></div>
                   </div>
                   {selectedApp.phone && (
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><HiPhone className="w-4 h-4"/></div>
                       <div><p className="text-[10px] font-bold text-slate-400 tracking-wider">Phone Link</p><a href={`tel:${selectedApp.phone}`} className="text-sm font-black text-slate-800 hover:text-emerald-600">{selectedApp.phone}</a></div>
                     </div>
                   )}
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-black tracking-widest text-slate-400">Professional Details</h4>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3 h-[calc(100%-2rem)]">
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider">Resume Portfolio</p>
                   {selectedApp.resumeUrl ? (
                     <a href={selectedApp.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors">
                       <HiDownload className="w-4 h-4" /> View Resume Document
                     </a>
                   ) : (
                     <p className="text-sm font-bold text-slate-500">No resume document provided.</p>
                   )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
                 <h4 className="text-xs font-black tracking-widest text-slate-400">Cover Letter Details</h4>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                  <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedApp.coverLetter || selectedApp.message || 'No additional message was provided by the applicant.'}
                  </p>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => updateStatus(selectedApp.id, 'accepted')} className="flex-1 py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">Accept Candidate</button>
               <button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="flex-1 py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Decline Candidate</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationsPanel;
