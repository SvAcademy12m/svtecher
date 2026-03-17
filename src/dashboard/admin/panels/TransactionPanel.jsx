import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { formatDateTime } from '../../../core/utils/formatters';
import { HiCash, HiArrowUp, HiArrowDown, HiPlus, HiDownload, HiPaperAirplane, HiPhone, HiMail } from 'react-icons/hi';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import StatCard from '../../../components/cards/StatCard';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TransactionPanel = () => {
  const { t } = useLanguage();
  const { formatPrice, formatDualPrice } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [form, setForm] = useState({ userId: '', userName: '', amount: '', type: 'deposit', description: '', method: 'bank', userPhone: '', userEmail: '' });
  const [messageForm, setMessageForm] = useState({ targetUserId: '', targetUserName: '', title: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status !== 'failed')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status !== 'failed')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const netRevenue = totalDeposits - totalWithdrawals;

  const filtered = filter === 'all' ? transactions : transactions.filter(tr => tr.type === filter);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        ...form,
        amount: Number(form.amount),
        status: 'completed',
        createdAt: serverTimestamp(),
      });
      toast.success('Transaction successfully recorded!');
      setForm({ userId: '', userName: '', amount: '', type: 'deposit', description: '', method: 'bank', userPhone: '', userEmail: '' });
      setShowAddForm(false);
    } catch {
      toast.error('Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
       const { updateDoc, doc } = await import('firebase/firestore');
       await updateDoc(doc(db, 'transactions', id), { status: newStatus });
       toast.success(`Transaction marked as ${newStatus}`);
    } catch {
       toast.error('Failed to update status');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create a notification for the target user
      await addDoc(collection(db, 'notifications'), {
        userId: messageForm.targetUserId,
        title: messageForm.title || 'Admin Message regarding your transaction',
        message: messageForm.message,
        read: false,
        type: 'admin_message',
        createdAt: serverTimestamp(),
      });
      toast.success(`Message sent to ${messageForm.targetUserName}!`);
      setShowMessageForm(false);
      setMessageForm({ targetUserId: '', targetUserName: '', title: '', message: '' });
    } catch {
      toast.error('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const openMessageModal = (tr) => {
    if (!tr.userId) {
      toast.error('This transaction has no associated User ID to send a message to.');
      return;
    }
    setMessageForm({
      targetUserId: tr.userId,
      targetUserName: tr.userName || 'Unknown User',
      title: 'Regarding your recent transaction',
      message: `Hello ${tr.userName}, \n\nWe are writing to you regarding your recent ${tr.type} transaction of ${tr.amount} ETB...`
    });
    setShowMessageForm(true);
  };

  const statusBadge = (status) => {
    const map = { completed: 'success', pending: 'warning', failed: 'danger' };
    return <Badge variant={map[status] || 'default'} className="text-[10px] font-black uppercase tracking-widest px-3 py-1">{t(status) || status}</Badge>;
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(tr => ({
      Date: tr.createdAt ? formatDateTime(tr.createdAt) : 'N/A',
      User: tr.userName || 'N/A',
      Email: tr.userEmail || 'N/A',
      Phone: tr.userPhone || 'N/A',
      Type: tr.type || 'N/A',
      Description: tr.description || 'N/A',
      Method: tr.method || 'N/A',
      AmountETB: tr.amount || 0,
      Status: tr.status || 'N/A'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Financial_Transactions_Export.xlsx");
  };

  const exportToPDF = () => {
    const docPdf = new jsPDF();
    docPdf.text('Financial Transactions Report', 14, 15);
    docPdf.autoTable({
      head: [['Date', 'User', 'Type', 'Desc', 'Amount', 'Status']],
      body: filtered.map(tr => [
        tr.createdAt ? formatDateTime(tr.createdAt) : 'N/A', 
        tr.userName || 'N/A', 
        tr.type || 'N/A', 
        (tr.description || '').substring(0, 20), 
        tr.amount + ' ETB', 
        tr.status
      ]),
      startY: 20,
    });
    docPdf.save('Financial_Transactions_Export.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight">{t('transactionHistory')}</h3>
          <p className="text-sm font-black text-blue-600/50 dark:text-indigo-400/50 uppercase tracking-widest mt-1 tracking-widest uppercase">Ledger Management & Reconciliation</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToPDF} className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 shadow-lg shadow-rose-500/10 group">
            <HiDownload className="w-4 h-4 group-hover:bounce" /> Export PDF
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/10 group">
            <HiDownload className="w-4 h-4 group-hover:bounce" /> Export Excel
          </button>
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider hover:scale-105 transition-all shadow-xl shadow-blue-500/20">
            <HiPlus className="w-4 h-4" /> New Record
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon={HiArrowDown} label={t('deposit') + 's'} value={formatPrice(totalDeposits)} gradient />
        <StatCard icon={HiArrowUp} label={t('withdrawal') + 's'} value={formatPrice(totalWithdrawals)} />
        <StatCard icon={HiCash} label="Net Revenue" value={formatPrice(netRevenue)} />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3">
        {['all', 'deposit', 'withdrawal', 'referral_commission', 'course_payment'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              filter === f 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 border-2 border-transparent' 
                : 'bg-white dark:bg-[#151a30] text-blue-900/60 dark:text-slate-400/60 border-2 border-blue-50 dark:border-white/5 hover:border-blue-200 dark:hover:border-white/20'
            }`}
          >
            {f === 'all' ? 'All Operations' : f.split('_').join(' ')}
          </button>
        ))}
      </div>

      {/* Custom Excel Table Format */}
      <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-blue-900/10 transition-all">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900 dark:bg-[#0e1225]">
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Timestamp Tracking</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Entity Reference</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Operation Specification</th>
                <th className="text-right p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Fiscal Value</th>
                <th className="text-center p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-white/5">
              {filtered.map(tr => {
                const dual = formatDualPrice(tr.amount);
                return (
                  <tr key={tr.id} className="transition-all group hover:bg-blue-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-6 align-middle">
                      <div className="bg-blue-50/50 dark:bg-black/20 rounded-2xl p-3 border border-blue-100/50 dark:border-white/5 inline-block">
                        <p className="text-[13px] font-black text-blue-900 dark:text-indigo-200 tracking-tight leading-none">{tr.createdAt ? new Date(tr.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                        <p className="text-[10px] font-black text-blue-400 dark:text-indigo-400/40 uppercase tracking-widest mt-1.5">{tr.createdAt ? new Date(tr.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-6 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-indigo-600/20 group-hover:rotate-12 transition-transform">
                          <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#151a30] flex items-center justify-center text-blue-600 dark:text-white text-xs font-black uppercase">
                            {(tr.userName?.[0] || 'U')}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-blue-900 dark:text-white tracking-tight leading-none">{tr.userName || 'Generic Client'}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {tr.userPhone && <a href={`tel:${tr.userPhone}`} className="text-[10px] font-black text-blue-600/50 dark:text-indigo-400/50 hover:text-emerald-500 transition-colors uppercase tracking-tight flex items-center gap-1"><HiPhone className="w-3 h-3"/>{tr.userPhone}</a>}
                            <span className="w-1 h-1 rounded-full bg-blue-100 dark:bg-white/10" />
                            {tr.userEmail && <a href={`mailto:${tr.userEmail}`} className="text-[10px] font-black text-blue-600/50 dark:text-indigo-400/50 hover:text-blue-500 transition-colors uppercase tracking-tight flex items-center gap-1"><HiMail className="w-3 h-3"/>{tr.userEmail}</a>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 align-middle">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-2 w-max px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                          tr.type === 'deposit' || tr.type === 'course_payment' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' : 'bg-rose-500/5 text-rose-600 border-rose-500/10'
                        }`}>
                          {tr.type === 'deposit' || tr.type === 'course_payment' ? <HiArrowDown className="w-3 h-3" /> : <HiArrowUp className="w-3 h-3" />}
                          {tr.type?.split('_').join(' ')}
                        </span>
                        <p className="text-[11px] font-black text-blue-900/60 dark:text-slate-400/60 uppercase tracking-wide truncate max-w-[200px]" title={tr.description}>{tr.description || 'System Generated Entry'}</p>
                        <div className="flex items-center gap-1.5">
                           <span className="text-[9px] font-black uppercase text-blue-600/40 dark:text-indigo-400/40 bg-blue-50 dark:bg-black/20 border border-blue-100 dark:border-white/5 rounded-md px-2 py-0.5 tracking-[0.15em]">{tr.method || 'NETWORK'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right align-middle">
                       <div className="inline-block text-right">
                          <p className="text-xl font-black text-blue-900 dark:text-white tracking-tighter leading-none">{dual.etb}</p>
                          <p className="text-[10px] font-black text-blue-600/60 dark:text-indigo-400/60 uppercase tracking-widest mt-2 bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/5 rounded-xl px-3 py-1 ml-auto w-max">{dual.usd}</p>
                       </div>
                    </td>
                    <td className="p-6 text-center align-middle">
                      <div className="flex flex-col items-center gap-3">
                         {statusBadge(tr.status)}
                         
                         {tr.status === 'pending' && tr.type === 'withdrawal' && (
                           <div className="flex gap-2 w-full max-w-[140px]">
                             <button onClick={() => updateStatus(tr.id, 'completed')} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">Accept</button>
                             <button onClick={() => updateStatus(tr.id, 'failed')} className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-[9px] font-black uppercase shadow-lg shadow-rose-500/20 hover:scale-105 transition-all">Reject</button>
                           </div>
                         )}

                         <button onClick={() => openMessageModal(tr)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 w-full max-w-[140px] justify-center group">
                           <HiPaperAirplane className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> NOTIFY
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-sm font-bold text-slate-400">Empty List — No transactions matched format.</div>
        )}
      </div>

      {/* Add Transaction Modal format */}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="Record Manual Transaction" maxWidth="max-w-2xl">
        <form onSubmit={handleAdd} className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Client Full Name *</label>
               <input name="userName" value={form.userName} onChange={e => setForm({...form, userName: e.target.value})} className="w-full bg-white border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none" placeholder="e.g. John Doe" required />
            </div>
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">User Firebase ID</label>
               <input name="userId" value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} className="w-full bg-white border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none" placeholder="UID (Highly Recommended for messaging)" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Client Mobile Phone</label>
               <input name="userPhone" value={form.userPhone} onChange={e => setForm({...form, userPhone: e.target.value})} className="w-full bg-white border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none" placeholder="+251..." />
            </div>
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Client Email Address</label>
               <input type="email" name="userEmail" value={form.userEmail} onChange={e => setForm({...form, userEmail: e.target.value})} className="w-full bg-white border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none" placeholder="client@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Transaction Type *</label>
               <select name="type" value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-white border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none">
                 <option value="deposit">Deposit Income</option>
                 <option value="withdrawal">Withdrawal / Payout</option>
                 <option value="course_payment">Course Payment Enrollment</option>
                 <option value="referral_commission">Referral Commission</option>
                 <option value="app_sale">App / Web Product Sale</option>
                 <option value="digital_product">Digital Resource Item Sale</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Payment Method / Gateway *</label>
               <select name="method" value={form.method} onChange={e => setForm({...form, method: e.target.value})} className="w-full bg-white border border-slate-200 text-sm font-bold p-3 rounded-xl focus:border-indigo-500 outline-none">
                 <option value="bank">Bank Transfer Local</option>
                 <option value="telebirr">Telebirr Mobile Money</option>
                 <option value="cbe">CBE Birr Mobile</option>
                 <option value="cash">Direct Cash Hand-off</option>
                 <option value="stripe">Stripe / Credit Card Global</option>
                 <option value="paypal">PayPal Global</option>
               </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-1">
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Gross Amount (ETB) *</label>
               <input name="amount" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full bg-white border-2 border-emerald-500 text-emerald-700 text-lg font-black p-3 rounded-xl outline-none" placeholder="0.00" required />
             </div>
             <div className="col-span-2">
               <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Memo / Description Reference</label>
               <input name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-white border border-slate-200 text-sm font-bold p-3.5 rounded-xl focus:border-indigo-500 outline-none" placeholder="Invoice # or specific service details..." />
             </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
             <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-all">
               {loading ? 'Processing Ledger...' : 'Insert Transaction to Ledger Table'}
             </button>
          </div>
        </form>
      </Modal>

      {/* Message User Modal */}
      <Modal isOpen={showMessageForm} onClose={() => setShowMessageForm(false)} title="Broadcast Message to Selected User" maxWidth="max-w-2xl">
         <form onSubmit={handleSendMessage} className="space-y-5 bg-[#0e1225] p-6 rounded-2xl border border-white/10">
            <div>
               <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1.5">Recipient Full Name</label>
               <input value={messageForm.targetUserName} disabled className="w-full bg-slate-900/50 text-white/50 border border-white/10 p-4 rounded-xl font-bold cursor-not-allowed" />
            </div>
            <div>
               <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1.5">Message Title Header</label>
               <input value={messageForm.title} onChange={e => setMessageForm({...messageForm, title: e.target.value})} className="w-full bg-slate-900 text-white placeholder:text-slate-500 border border-white/20 p-4 rounded-xl focus:border-indigo-500 font-black outline-none transition-colors" placeholder="Notice regarding invoice payment" required />
            </div>
            <div>
               <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1.5">Content Body Formatting</label>
               <textarea value={messageForm.message} onChange={e => setMessageForm({...messageForm, message: e.target.value})} className="w-full bg-slate-900 text-white placeholder:text-slate-500 border border-white/20 p-4 rounded-xl focus:border-indigo-500 font-medium outline-none min-h-[160px] resize-y" placeholder="Type your full formatted message here..." required></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-blue-500 shadow-xl shadow-blue-600/30 transition-all cursor-pointer">
              <HiPaperAirplane className="w-5 h-5" /> Push Target Notification Now
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default TransactionPanel;
