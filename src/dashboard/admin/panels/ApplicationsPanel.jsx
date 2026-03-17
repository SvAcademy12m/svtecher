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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight">Job Applications</h3>
          <p className="text-sm font-black text-blue-600/50 dark:text-indigo-400/50 uppercase tracking-widest mt-1">{applications.length} TOTAL SUBMISSIONS INGESTED</p>
        </div>
        <button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/10 group">
          <HiDownload className="w-4 h-4 group-hover:bounce" /> Export Sheet
        </button>
      </div>

      <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-blue-900/10 transition-all">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900 dark:bg-[#0e1225]">
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Candidate Identity</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Target Position</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Arrival Timestamp</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Evaluation Status</th>
                <th className="text-right p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Direct Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-white/5">
              {applications.map(app => (
                <tr key={app.id} className="transition-all group hover:bg-blue-50/50 dark:hover:bg-white/[0.02]">
                  <td className="p-6 align-middle">
                    <div className="flex flex-col">
                      <p className="text-sm font-black text-blue-900 dark:text-white tracking-tight uppercase leading-none">{app.applicantName || app.applicantId || 'GENERIC ENTITY'}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                         <a href={`mailto:${app.applicantEmail}`} className="text-[10px] font-black text-blue-600/40 dark:text-indigo-400/40 hover:text-blue-500 transition-colors uppercase tracking-tight flex items-center gap-1"><HiMail className="w-3.5 h-3.5" />{app.applicantEmail || 'N/A'}</a>
                         {app.phone && (
                           <a href={`tel:${app.phone}`} className="text-[10px] font-black text-blue-600/40 dark:text-indigo-400/40 hover:text-emerald-500 transition-colors uppercase tracking-tight flex items-center gap-1"><HiPhone className="w-3.5 h-3.5" />{app.phone}</a>
                         )}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 align-middle font-black text-[11px] text-blue-600 dark:text-indigo-300 uppercase tracking-widest">{app.jobTitle || 'UNSPECIFIED'}</td>
                  <td className="p-6 align-middle text-[10px] font-black text-blue-900/40 dark:text-slate-500/40 uppercase tracking-tighter">
                     <span className="bg-blue-50 dark:bg-black/20 px-3 py-1 rounded-xl border border-blue-100 dark:border-white/5">{app.createdAt ? new Date(app.createdAt?.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'DATETIME N/A'}</span>
                  </td>
                  <td className="p-6 align-middle">
                    <span className={`inline-flex px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 ${
                      app.status === 'accepted' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' :
                      app.status === 'rejected' ? 'bg-rose-500/5 text-rose-600 border-rose-500/10' :
                      'bg-amber-500/5 text-amber-600 border-amber-500/10'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${
                         app.status === 'accepted' ? 'bg-emerald-500' : app.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      {app.status || 'Pending Review'}
                    </span>
                  </td>
                  <td className="p-6 align-middle">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => setSelectedApp(app)} className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-white/5 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:rotate-12" title="Inspect Full Dossier">
                         <HiEye className="w-5 h-5" />
                       </button>
                       <div className="flex bg-blue-50/50 dark:bg-black/20 p-1 rounded-2xl border border-blue-100 dark:border-white/5">
                          <button onClick={() => updateStatus(app.id, 'accepted')} className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all" title="Authorize">
                            <HiCheck className="w-5 h-5" />
                          </button>
                          <button onClick={() => updateStatus(app.id, 'rejected')} className="p-2 rounded-xl text-amber-500 hover:bg-amber-500 hover:text-white transition-all" title="Decline">
                            <HiX className="w-5 h-5" />
                          </button>
                          <button onClick={() => deleteApp(app.id)} className="p-2 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all" title="Purge Record">
                            <HiTrash className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {applications.length === 0 && <div className="text-center py-24 text-[11px] font-black text-blue-200 dark:text-white/10 uppercase tracking-[0.3em]">No Candidate Applications Cataloged</div>}
      </div>

      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Full Application Details" maxWidth="max-w-3xl">
        {selectedApp && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border border-slate-100">
               <div>
                 <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedApp.applicantName}</h2>
                 <p className="text-sm font-bold text-slate-500">{selectedApp.jobTitle}</p>
               </div>
               <Badge variant={selectedApp.status === 'accepted' ? 'success' : selectedApp.status === 'rejected' ? 'danger' : 'warning'} className="text-sm px-4 py-2 font-black uppercase tracking-wider">
                 {selectedApp.status || 'Pending'}
               </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Contact Information</h4>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><HiMail className="w-4 h-4"/></div>
                     <div><p className="text-[10px] font-bold text-slate-400 uppercase">Email</p><a href={`mailto:${selectedApp.applicantEmail}`} className="text-sm font-black text-slate-800 hover:text-blue-600">{selectedApp.applicantEmail}</a></div>
                   </div>
                   {selectedApp.phone && (
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><HiPhone className="w-4 h-4"/></div>
                       <div><p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p><a href={`tel:${selectedApp.phone}`} className="text-sm font-black text-slate-800 hover:text-emerald-600">{selectedApp.phone}</a></div>
                     </div>
                   )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Professional Details</h4>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3 h-[calc(100%-2rem)]">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Resume / CV Link</p>
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
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Cover Letter / Message</h4>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                  <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedApp.coverLetter || selectedApp.message || 'No additional message was provided by the applicant.'}
                  </p>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
               <button onClick={() => updateStatus(selectedApp.id, 'accepted')} className="flex-1 py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">ACCEPT APPLICANT</button>
               <button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="flex-1 py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">REJECT APPLICANT</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationsPanel;
