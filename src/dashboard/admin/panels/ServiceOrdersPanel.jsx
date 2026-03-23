import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { HiPlus, HiPencil, HiTrash, HiCheckCircle, HiClock, HiCurrencyDollar, HiGlobe, HiDeviceMobile, HiSpeakerphone, HiDownload } from 'react-icons/hi';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const ServiceOrdersPanel = () => {
  const { t } = useLanguage();
  const { formatPrice, formatDualPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'service_orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'service_orders', id), { 
        status: newStatus, 
        updatedAt: serverTimestamp() 
      });
      toast.success(`Order marked as ${newStatus}`);
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order permanently?')) return;
    try {
      await deleteDoc(doc(db, 'service_orders', id));
      toast.success('Order deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const statusColors = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    cancelled: 'error',
    paid: 'success'
  };

  const typeIcons = {
    website: HiGlobe,
    app: HiDeviceMobile,
    marketing: HiSpeakerphone,
    other: HiPlus
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-blue-900 dark:text-white tracking-tighter uppercase whitespace-nowrap underline decoration-blue-600 decoration-4 underline-offset-8">Service Engine</h2>
          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-4">Web, App & Digital Marketing Pipeline</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white dark:bg-white/5 px-6 py-3 rounded-2xl border border-blue-50 dark:border-white/10 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Pipeline</p>
              <p className="text-lg font-black text-blue-900 dark:text-white tabular-nums">{orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length} Orders</p>
           </div>
           <button 
             onClick={() => {
               const ws = XLSX.utils.json_to_sheet(orders);
               const wb = XLSX.utils.book_new();
               XLSX.utils.book_append_sheet(wb, ws, "ServiceOrders");
               XLSX.writeFile(wb, "SVTech_Service_Orders.xlsx");
             }}
             className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border-2 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-xl font-black uppercase tracking-widest text-[10px]"
           >
             Export <HiDownload className="w-5 h-5" />
           </button>
           <label className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl border-2 border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all shadow-xl font-black uppercase tracking-widest text-[10px] cursor-pointer">
             Import <HiPlus className="w-5 h-5" />
             <input 
               type="file" 
               className="hidden" 
               accept=".xlsx,.xls" 
               onChange={(e) => {
                 const file = e.target.files[0];
                 if (!file) return;
                 const reader = new FileReader();
                 reader.onload = async (evt) => {
                   const data = XLSX.utils.sheet_to_json(XLSX.read(evt.target.result, { type: 'binary' }).Sheets[XLSX.read(evt.target.result, { type: 'binary' }).SheetNames[0]]);
                   let count = 0;
                   for (const row of data) {
                     await addDoc(collection(db, 'service_orders'), {
                       clientName: row.Client || row.clientName || 'Unnamed',
                       clientEmail: row.Email || row.clientEmail || '',
                       projectName: row.Project || row.projectName || 'New Service',
                       type: (row.Type || row.type || 'other').toLowerCase(),
                       budget: Number(row.Budget || row.budget || 0),
                       status: (row.Status || row.status || 'pending').toLowerCase(),
                       createdAt: serverTimestamp()
                     });
                     count++;
                   }
                   toast.success(`${count} orders synced`);
                 };
                 reader.readAsBinaryString(file);
               }}
             />
           </label>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0e1225] rounded-[3rem] border-[3px] border-black dark:border-white/20 shadow-2xl overflow-hidden relative mt-8">
         <div className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar">
            <table className="w-full border-collapse min-w-[1200px]">
               <thead className="sticky top-0 z-20">
                  <tr className="bg-black text-white">
                    <th className="p-8 border-r-[3px] border-b-4 border-black text-left text-[11px] font-black uppercase tracking-[0.3em]">Date Placed</th>
                    <th className="p-8 border-r-[3px] border-b-4 border-black text-left text-[11px] font-black uppercase tracking-[0.3em]">Client Identity</th>
                    <th className="p-8 border-r-[3px] border-b-4 border-black text-left text-[11px] font-black uppercase tracking-[0.3em]">Digital Service</th>
                    <th className="p-8 border-r-[3px] border-b-4 border-black text-right text-[11px] font-black uppercase tracking-[0.3em]">Amount (ETB)</th>
                    <th className="p-8 border-b-4 border-black text-right text-[11px] font-black uppercase tracking-[0.3em]">Operations</th>
                  </tr>
               </thead>
               <tbody className="divide-y-[3px] divide-black dark:divide-white/10 bg-white dark:bg-black/40">
              {orders.length === 0 ? (
                <tr>
                   <td colSpan="5" className="p-20 text-center border-b-4 border-black dark:border-white/10">
                      <HiClock className="w-12 h-12 text-slate-100 dark:text-white/5 mx-auto mb-4" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active service orders in pipeline</p>
                   </td>
                </tr>
              ) : orders.map(order => {
                const Icon = typeIcons[order.type] || HiPlus;
                return (                  <tr key={order.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors group">
                    <td className="p-8 border-r-[3px] border-black dark:border-white/10">
                      <p className="text-sm font-black text-slate-800 dark:text-white tabular-nums uppercase leading-none mb-2">{order.createdAt ? formatDateTime(order.createdAt) : 'PENDING'}</p>
                      <p className="text-[10px] font-black text-blue-600/40 uppercase tracking-[0.2em]">{order.id.slice(0, 8)}</p>
                    </td>
                    <td className="p-8 border-r-[3px] border-black dark:border-white/10">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-white/5 border-[3px] border-black rounded-[1.2rem] flex items-center justify-center text-slate-900 dark:text-white font-black shadow-xl group-hover:rotate-6 transition-all duration-500">
                             {order.userName?.[0] || 'C'}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1.5">{order.userName || 'Guest Client'}</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{order.userEmail?.slice(0, 20)}...</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-8 border-r-[3px] border-black dark:border-white/10">
                       <p className="text-xs font-black text-slate-600 dark:text-cyan-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-lg border-[3px] border-black inline-block">{order.serviceName}</p>
                    </td>
                    <td className="p-8 border-r-[3px] border-black dark:border-white/10 text-right">
                       <p className="text-xl font-black text-emerald-600 tabular-nums">{order.totalAmount} ETB</p>
                       <p className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest">{order.status || 'Pending'}</p>
                    </td>
                    <td className="p-8 text-right">
                       <div className="flex justify-end gap-3">
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'processing')}
                              className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:scale-110 active:scale-95 transition-all"
                              title="Begin Processing"
                            >
                               <HiClock className="w-5 h-5" />
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all"
                              title="Mark Completed"
                            >
                               <HiCheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="p-3 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 hover:scale-110 active:scale-95 transition-all"
                            title="Purge Order"
                          >
                             <HiTrash className="w-5 h-5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceOrdersPanel;
