import React, { useState, useEffect } from 'react';
import { 
  HiTicket, HiTrash, HiCheckCircle, HiClock, HiExclamation, 
  HiPhone, HiDeviceMobile, HiSearch, HiLightningBolt, HiChatAlt2, HiGlobe
} from 'react-icons/hi';
import { serviceRequestService } from '../../../core/services/firestoreService';
import { toast } from 'react-toastify';
import Badge from '../../../components/ui/Badge';

const SupportTicketsPanel = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = serviceRequestService.subscribe((data) => {
      setTickets(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await serviceRequestService.update(id, { status });
      toast.success(`Withdrawal ${status === 'completed' ? 'authorized' : 'declined'}`);
    } catch (err) {
      toast.error('Operation failed.');
    }
  };

  const deleteTicket = async (id) => {
    if (!window.confirm('WIPE TICKET FROM GLOBAL REGISTRY?')) return;
    try {
      await serviceRequestService.delete(id);
      toast.success('Packet purged');
    } catch {
      toast.error('Purge failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="warning" className="!px-5 !py-2 text-[10px] font-black uppercase tracking-widest border-amber-500/20 shadow-lg shadow-amber-500/10">Pending Approval</Badge>;
      case 'diagnosing': return <Badge variant="info" className="!px-5 !py-2 text-[10px] font-black uppercase tracking-widest border-blue-500/20 shadow-lg shadow-blue-500/10">Analyzing Faults</Badge>;
      case 'parts-pending': return <Badge variant="danger" className="!px-5 !py-2 text-[10px] font-black uppercase tracking-widest border-rose-500/20 shadow-lg shadow-rose-500/10">Waiting for Data</Badge>;
      case 'ready': return <Badge variant="primary" className="!px-5 !py-2 text-[10px] font-black uppercase tracking-widest border-cyan-500/20 shadow-lg shadow-cyan-500/10">Optimized</Badge>;
      case 'resolved': return <Badge variant="success" className="!px-5 !py-2 text-[10px] font-black uppercase tracking-widest border-emerald-500/20 shadow-lg shadow-emerald-500/10">Service Closed</Badge>;
      default: return <Badge variant="default" className="!px-5 !py-2 text-[10px] font-black uppercase tracking-widest">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h3 className="text-4xl font-black text-blue-900 dark:text-white tracking-tighter uppercase  underline decoration-blue-600 decoration-4 underline-offset-8">Support HUD</h3>
          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-3">Global Technical Asset & Inquiry Registry</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-blue-100 dark:border-white/10 shadow-xl flex items-center gap-6 group">
              <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center">
                 <HiChatAlt2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-blue-600 leading-none tabular-nums">{tickets.length}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Finalized</p>
              </div>
           </div>
           <div className="bg-amber-500 p-6 rounded-3xl shadow-xl shadow-amber-500/20 flex items-center gap-6 group">
              <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center animate-pulse">
                 <HiClock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-white leading-none tabular-nums">{tickets.filter(t => t.status !== 'resolved').length}</p>
                <p className="text-[9px] font-black text-amber-100 uppercase tracking-widest mt-1 opacity-70">Active Latency</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          <div className="py-32 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Connecting to Support Stream...</div>
        ) : tickets.length === 0 ? (
          <div className="py-32 text-center bg-white dark:bg-[#0e1225] rounded-[4rem] border-2 border-dashed border-blue-100 dark:border-white/10">
             <HiGlobe className="w-20 h-20 text-blue-100 dark:text-white/5 mx-auto mb-8" />
             <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase ">Atmosphere Clear</p>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4">No active technical faults detected in the matrix.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} className="group bg-white dark:bg-[#0e1225] rounded-[3.5rem] p-10 border border-blue-50 dark:border-white/5 shadow-2xl shadow-blue-900/5 hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                 <HiChatAlt2 className="w-48 h-48 rotate-12" />
              </div>
              
              <div className="flex flex-col xl:flex-row gap-10 relative z-10">
                {/* Identity Block */}
                <div className="flex items-start gap-8">
                   <div className={`w-24 h-24 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-all duration-500 ${
                     ticket.status === 'resolved' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20' : 
                     ticket.status === 'ready' ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/20' : 
                     'bg-gradient-to-br from-blue-700 to-indigo-900 shadow-blue-600/30'
                   }`}>
                      <HiDeviceMobile className="w-12 h-12" />
                   </div>
                   <div>
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                         <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter ">{ticket.name || 'Anonymous User'}</h4>
                         {getStatusBadge(ticket.status)}
                      </div>
                      <div className="flex items-center gap-6">
                         <span className="flex items-center gap-2 text-[11px] font-black text-blue-600/40 uppercase tracking-[0.1em]"><HiPhone className="w-4 h-4" /> {ticket.contact || 'SECURE'}</span>
                         <span className="flex items-center gap-2 text-[11px] font-black text-indigo-400/40 uppercase tracking-[0.1em]"><HiLightningBolt className="w-4 h-4" /> {ticket.deviceType || 'DATA NODE'}</span>
                      </div>
                   </div>
                </div>

                {/* Report Content */}
                <div className="flex-1">
                   <div className="bg-slate-50 dark:bg-black/30 p-8 rounded-[2.5rem] border border-blue-50 dark:border-white/5 shadow-inner relative group/report overflow-hidden">
                      <div className="absolute top-4 right-6 text-6xl font-black text-blue-600/5 opacity-40  group-hover/report:translate-x-10 transition-transform duration-1000">FAULT</div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Transmission Payload</p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100  leading-relaxed tracking-tight line-clamp-2">
                        "{ticket.issue || 'No diagnostic data provided.'}"
                      </p>
                   </div>
                </div>

                {/* Command Deck */}
                <div className="flex flex-col justify-between gap-6">
                   <div className="flex bg-slate-100 dark:bg-black p-2 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-inner">
                      {[
                        { s: 'diagnosing', i: HiSearch, c: 'bg-blue-600 text-white', h: 'text-blue-500', label: 'Scan' },
                        { s: 'parts-pending', i: HiExclamation, c: 'bg-rose-500 text-white', h: 'text-rose-500', label: 'Data' },
                        { s: 'ready', i: HiCheckCircle, c: 'bg-emerald-500 text-white', h: 'text-emerald-500', label: 'Optimize' },
                      ].map(btn => (
                        <button 
                          key={btn.s}
                          onClick={() => updateStatus(ticket.id, btn.s)}
                          className={`flex-1 p-4 rounded-3xl transition-all flex flex-col items-center gap-1 min-w-[70px] ${ticket.status === btn.s ? btn.c + ' shadow-xl' : 'text-slate-400 dark:text-white/20 hover:' + btn.h + ' hover:bg-white dark:hover:bg-white/5'}`}
                        >
                          <btn.i className="w-6 h-6" />
                          <span className="text-[8px] font-black uppercase tracking-widest">{btn.label}</span>
                        </button>
                      ))}
                      <div className="w-px h-10 bg-slate-300 dark:bg-white/10 mx-2 self-center" />
                      <button 
                        onClick={() => deleteTicket(ticket.id)}
                        className="p-4 rounded-3xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all flex items-center justify-center min-w-[70px]"
                      >
                        <HiTrash className="w-6 h-6" />
                      </button>
                   </div>
                   
                   <div className="flex items-center justify-between px-4">
                      <span className="text-[10px] font-black text-slate-300 dark:text-white/20 tabular-nums">LOG: {ticket.id.slice(0, 10).toUpperCase()}</span>
                      <span className="text-[11px] font-black text-blue-600/30 uppercase tracking-[0.2em] ">
                         {ticket.createdAt ? new Date(ticket.createdAt?.seconds * 1000).toLocaleDateString() : 'REALTIME'}
                      </span>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SupportTicketsPanel;
