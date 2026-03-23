import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { formatDateTime } from '../../../core/utils/formatters';
import { HiCurrencyDollar, HiCheckCircle, HiXCircle, HiClock, HiUser, HiArrowRight, HiLibrary, HiLightningBolt, HiTrendingUp, HiCash, HiDownload, HiPlus } from 'react-icons/hi';
import Badge from '../../../components/ui/Badge';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';


const WithdrawalPanel = () => {
  const { t } = useLanguage();
  const { formatDualPrice, formatPrice } = useCurrency();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'), 
      where('type', '==', 'withdrawal'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const completedCount = withdrawals.filter(w => w.status === 'completed').length;
  const failedCount = withdrawals.filter(w => w.status === 'failed').length;
  const totalPaid = withdrawals.filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  const totalPending = withdrawals.filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  const handleAction = async (id, status) => {
    try {
      await updateDoc(doc(db, 'transactions', id), { status });
      toast.success(`Withdrawal ${status === 'completed' ? 'authorized' : 'declined'}`);
    } catch (err) {
      toast.error('Operation failed.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-600 via-emerald-700 to-green-900 p-8 lg:p-10 shadow-2xl shadow-emerald-900/30">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                <HiCurrencyDollar className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Finance</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Withdrawal Center</h2>
            <p className="text-sm text-white/50 font-bold mt-2">Identity-Based Financial Payout Matrix</p>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => {
                 const ws = XLSX.utils.json_to_sheet(withdrawals);
                 const wb = XLSX.utils.book_new();
                 XLSX.utils.book_append_sheet(wb, ws, "Withdrawals");
                 XLSX.writeFile(wb, "SVTech_Withdrawals.xlsx");
               }}
               className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl border-2 border-white/20 hover:bg-white hover:text-emerald-700 transition-all font-black uppercase tracking-widest text-[10px]"
             >
                Export Matrix <HiDownload className="w-4 h-4" />
             </button>
             <label className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl border-2 border-white/20 hover:bg-white hover:text-blue-700 transition-all font-black uppercase tracking-widest text-[10px] cursor-pointer">
                Import Matrix <HiPlus className="w-4 h-4" />
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
                        await addDoc(collection(db, 'transactions'), {
                          userName: row.User || row.userName || 'Anonymous',
                          userId: row.UserId || row.userId || '',
                          amount: Number(row.Amount || row.amount || 0),
                          type: 'withdrawal',
                          status: (row.Status || row.status || 'pending').toLowerCase(),
                          method: row.Method || row.method || 'Bank Transfer',
                          createdAt: serverTimestamp()
                        });
                        count++;
                      }
                      toast.success(`${count} withdrawals synchronized`);
                    };
                    reader.readAsBinaryString(file);
                  }}
                />
             </label>
          </div>
        </div>
      </div>

      {/* Colorful Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiClock} label="Pending Queue" value={pendingCount} gradient="from-amber-400 to-orange-500" shadow="shadow-amber-500/20" />
        <StatCard icon={HiCheckCircle} label="Authorized" value={completedCount} gradient="from-emerald-400 to-teal-600" shadow="shadow-emerald-500/20" />
        <StatCard icon={HiXCircle} label="Declined" value={failedCount} gradient="from-rose-400 to-pink-600" shadow="shadow-rose-500/20" />
        <StatCard icon={HiCash} label="Released Total" value={formatPrice(totalPaid)} gradient="from-blue-500 to-indigo-700" shadow="shadow-blue-500/20" isText />
      </div>

      {/* Pending Volume Alert */}
      {totalPending > 0 && (
        <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border-2 border-amber-200 dark:border-amber-800/40 rounded-2xl p-5">
          <div className="w-12 h-12 bg-amber-400 text-white rounded-xl flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/20">
            <HiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-black text-amber-800 dark:text-amber-400">Pending Withdrawal Volume</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-300 tabular-nums">{formatPrice(totalPending)}</p>
          </div>
        </div>
      )}

      {/* Withdrawal Table */}
      <div className="bg-white dark:bg-[#0e1225] rounded-[3.5rem] border-[3px] border-black dark:border-white/10 shadow-2xl overflow-hidden relative mt-8">
         <div className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar">
            <table className="w-full border-collapse min-w-[1200px]">
               <thead className="sticky top-0 z-20">
                  <tr className="bg-black text-white">
                    <th className="p-8 border-r-[3px] border-b-4 border-black text-left text-[12px] font-black uppercase tracking-[0.3em]">Date Requested</th>
                    <th className="p-8 border-r-[3px] border-b-4 border-black text-left text-[12px] font-black uppercase tracking-[0.3em]">Client Identity</th>
                    <th className="p-8 border-r-[3px] border-b-4 border-black text-right text-[12px] font-black uppercase tracking-[0.3em]">Payout Amount</th>
                    <th className="p-8 border-r-[3px] border-b-4 border-black text-center text-[12px] font-black uppercase tracking-[0.3em]">Status</th>
                    <th className="p-8 border-b-4 border-black text-right text-[12px] font-black uppercase tracking-[0.3em]">Action Matrix</th>
                  </tr>
               </thead>
               <tbody className="divide-y-[3px] divide-black dark:divide-white/10 bg-white dark:bg-black/40">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-20 text-center animate-pulse text-emerald-500 font-black tracking-widest uppercase">Initializing Financial Stream...</td>
                    </tr>
                  ) : withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-20 text-center">
                        <HiLibrary className="w-12 h-12 text-gray-200 dark:text-white/10 mx-auto mb-4" />
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Payout Requests Registered</p>
                      </td>
                    </tr>
                  ) : withdrawals.map(item => (
                    <tr 
                      key={item.id} 
                      className="group hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20 transition-all relative"
                    >
                      <td className="p-8 border-r-[3px] border-black dark:border-white/10">
                         <p className="text-sm font-black text-slate-800 dark:text-white tabular-nums uppercase tracking-tighter leading-none mb-2">{item.createdAt ? formatDateTime(item.createdAt) : 'PENDING'}</p>
                         <p className="text-[10px] font-black text-blue-600/40 uppercase tracking-[0.2em]">{item.id.slice(0, 8)}</p>
                      </td>
                      <td className="p-8 border-r-[3px] border-black dark:border-white/10">
                         <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-white dark:bg-white/5 border-2 border-black dark:border-white/10 rounded-[1.8rem] flex items-center justify-center text-slate-900 dark:text-white font-black shadow-xl group-hover:rotate-6 transition-all duration-500">
                              {item.userName?.[0] || 'U'}
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-none mb-2">{item.userName || 'Anonymous Client'}</p>
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest leading-none">
                                <HiUser className="w-3 h-3"/> {item.userId?.slice(0,8)}
                              </div>
                           </div>
                         </div>
                      </td>
                      <td className="p-8 border-r-[3px] border-black dark:border-white/10 text-right">
                         <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none mb-1">{formatDualPrice(item.amount).etb}</p>
                         <p className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest">{formatDualPrice(item.amount).usd}</p>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{item.method || 'Bank Transfer'}</p>
                      </td>
                      <td className="p-8 border-r-[3px] border-black dark:border-white/10 text-center">
                         <Badge 
                           variant={item.status === 'completed' ? 'success' : item.status === 'failed' ? 'danger' : 'warning'} 
                           className="text-[10px] font-black px-5 py-2 rounded-xl uppercase tracking-[0.15em] shadow-lg border-2 border-black"
                         >
                            {item.status || 'Pending'}
                         </Badge>
                      </td>
                      <td className="p-8 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                           {item.status === 'pending' ? (
                             <>
                                <button 
                                  onClick={() => handleAction(item.id, 'completed')}
                                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest"
                                >
                                  <HiCheckCircle className="w-4 h-4" /> Approve
                                </button>
                                <button 
                                  onClick={() => handleAction(item.id, 'failed')}
                                  className="flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest"
                                >
                                  <HiXCircle className="w-4 h-4" /> Reject
                                </button>
                             </>
                           ) : (
                             <div className="px-4 py-3 bg-white/40 dark:bg-white/5 rounded-xl border border-slate-100/50 dark:border-white/5 text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.status}</p>
                             </div>
                           )}
                         </div>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, gradient, shadow, isText }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-xl ${shadow} group`}>
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-150 transition-transform duration-1000">
      <Icon className="w-20 h-20 text-white" />
    </div>
    <div className="relative z-10">
      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 border border-white/20">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className={`${isText ? 'text-xl' : 'text-3xl'} font-black text-white tabular-nums leading-none mb-1`}>{value}</p>
      <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">{label}</p>
    </div>
  </div>
);

export default WithdrawalPanel;
