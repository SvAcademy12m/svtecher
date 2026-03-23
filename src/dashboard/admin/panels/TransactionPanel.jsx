import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { formatDateTime } from '../../../core/utils/formatters';
import { 
  HiCash, HiArrowUp, HiArrowDown, HiPlus, HiDownload, HiPaperAirplane, 
  HiCalendar, HiChartBar, HiCollection, HiScale, HiTrendingUp, HiTrendingDown,
  HiPencil, HiTrash
} from 'react-icons/hi';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TransactionPanel = () => {
  const { t } = useLanguage();
  const { formatDualPrice, formatPrice } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [timeRange, setTimeRange] = useState('all'); 
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ userName: '', amount: '', type: 'income', description: '', method: 'bank', userPhone: '', userEmail: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    
    const unsub = onSnapshot(q, (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const now = new Date();
      if (timeRange === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        data = data.filter(tr => tr.createdAt?.seconds * 1000 >= todayStart);
      } else if (timeRange === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        data = data.filter(tr => tr.createdAt?.seconds * 1000 >= monthStart);
      } else if (timeRange === 'year') {
        const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
        data = data.filter(tr => tr.createdAt?.seconds * 1000 >= yearStart);
      }

      setTransactions(data);
    });
    return () => unsub();
  }, [timeRange]);

  // Categorization Logic
  const categorized = useMemo(() => {
    return transactions.map(tr => {
      let category = 'income';
      if (['withdrawal', 'expense', 'payout'].includes(tr.type)) category = 'expense';
      if (['liability', 'debt'].includes(tr.type)) category = 'liability';
      if (['deposit', 'course_payment', 'employer_payment', 'income', 'app_sale'].includes(tr.type)) category = 'income';
      return { ...tr, category };
    });
  }, [transactions]);

  const stats = useMemo(() => {
    const { income, expenses, liabilities } = categorized.reduce((acc, tr) => {
      const amt = Number(tr.amount) || 0;
      if (tr.category === 'income') acc.income += amt;
      if (tr.category === 'expense') acc.expenses += amt;
      if (tr.category === 'liability') acc.liabilities += amt;
      return acc;
    }, { income: 0, expenses: 0, liabilities: 0 });

    const margin = income > 0 ? ((income - expenses) / income) * 100 : 0;
    return { income, expenses, liabilities, net: income - expenses - liabilities, margin };
  }, [categorized]);

  const filtered = filter === 'all' ? categorized : categorized.filter(tr => tr.category === filter);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await updateDoc(doc(db, 'transactions', editId), {
          ...form,
          amount: Number(form.amount),
          updatedAt: serverTimestamp(),
        });
        toast.success('Transaction updated');
      } else {
        await addDoc(collection(db, 'transactions'), {
          ...form,
          amount: Number(form.amount),
          status: 'completed',
          createdAt: serverTimestamp(),
        });
        toast.success('Transaction added to ledger');
      }
      setForm({ userName: '', amount: '', type: 'income', description: '', method: 'bank', userPhone: '', userEmail: '' });
      setShowForm(false);
      setEditId(null);
    } catch {
      toast.error('Failed to sync transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this transaction?")) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
      toast.success("Transaction deleted");
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  const exportData = (type) => {
    if (type === 'excel') {
      const exportList = filtered.map(tr => ({
        'Date': tr.createdAt ? formatDateTime(tr.createdAt) : 'N/A',
        'Entity Name': tr.userName || 'Generic Client',
        'Transaction Type': tr.type?.toUpperCase(),
        'Category': tr.category?.toUpperCase(),
        'Payment Method': tr.method?.toUpperCase(),
        'Amount (ETB)': tr.amount,
        'Status': tr.status?.toUpperCase()
      }));

      // Add Summary Rows
      exportList.push({});
      exportList.push({ 'Entity Name': 'SUMMARY REPORT', 'Amount (ETB)': '' });
      exportList.push({ 'Entity Name': 'Total Income', 'Amount (ETB)': stats.income });
      exportList.push({ 'Entity Name': 'Total Expenses', 'Amount (ETB)': stats.expenses });
      exportList.push({ 'Entity Name': 'Total Liabilities', 'Amount (ETB)': stats.liabilities });
      exportList.push({ 'Entity Name': 'NET PROFIT', 'Amount (ETB)': stats.net });

      const ws = XLSX.utils.json_to_sheet(exportList);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Financial_Report");
      XLSX.writeFile(wb, `SVTECH_FINANCIAL_REPORT_${timeRange.toUpperCase()}.xlsx`);
    } else {
      const docPdf = new jsPDF();
      
      // Branding Header
      docPdf.setFillColor(30, 58, 138); // blue-900
      docPdf.rect(0, 0, 210, 40, 'F');
      
      docPdf.setTextColor(255, 255, 255);
      docPdf.setFontSize(24);
      docPdf.setFont('helvetica', 'bold');
      docPdf.text('SVTECH DIGITAL', 14, 20);
      
      docPdf.setFontSize(10);
      docPdf.setFont('helvetica', 'normal');
      docPdf.text('OFFICIAL FINANCIAL AUDIT REPORT', 14, 30);
      docPdf.text(`Generation Date: ${new Date().toLocaleString()}`, 130, 30);

      // Body
      docPdf.autoTable({
        head: [['Date', 'Entity', 'Type', 'Category', 'Amount (ETB)', 'Status']],
        body: filtered.map(tr => [
          tr.createdAt ? formatDateTime(tr.createdAt) : 'N/A', 
          tr.userName || 'N/A', 
          tr.type?.toUpperCase() || 'N/A',
          tr.category?.toUpperCase() || 'N/A',
          formatPrice(tr.amount), 
          tr.status?.toUpperCase()
        ]),
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      // Footer / Summary
      const lastY = docPdf.previousAutoTable.finalY + 10;
      docPdf.setTextColor(30, 58, 138);
      docPdf.setFontSize(12);
      docPdf.setFont('helvetica', 'bold');
      docPdf.text('REPORT SUMMARY', 14, lastY);
      
      docPdf.setFontSize(10);
      docPdf.setFont('helvetica', 'normal');
      docPdf.setTextColor(0, 0, 0);
      docPdf.text(`Total Recorded Income: ${formatPrice(stats.income)}`, 14, lastY + 8);
      docPdf.text(`Total Recorded Expenses: ${formatPrice(stats.expenses)}`, 14, lastY + 14);
      docPdf.text(`Total Recorded Liabilities: ${formatPrice(stats.liabilities)}`, 14, lastY + 20);
      
      docPdf.setFontSize(12);
      docPdf.setFont('helvetica', 'bold');
      docPdf.setTextColor(16, 185, 129); // emerald-500
      docPdf.text(`NET PLATFORM PROFIT: ${formatPrice(stats.net)}`, 14, lastY + 32);

      // Footer branding
      docPdf.setFontSize(8);
      docPdf.setTextColor(150, 150, 150);
      docPdf.text('This is an electronically generated report from SVTECH Digital Admin Engine. All rights reserved 2026.', 14, 285);

      docPdf.save(`SVTECH_AUDIT_REPORT_${timeRange.toUpperCase()}.pdf`);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{t('financialOverview')}</h2>
          <p className="text-sm text-gray-400 dark:text-white/40 font-bold uppercase tracking-widest mt-1">Global Audit & Resource Tracking</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="flex p-1.5 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
              {['today', 'month', 'year', 'all'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-blue-600'}`}
                >
                  {t}
                </button>
              ))}
           </div>

           <div className="flex items-center gap-3">
              <button onClick={() => exportData('pdf')} className="p-4 bg-rose-500 text-white rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-105 transition-all" title="Export PDF">
                 <HiDownload className="w-5 h-5" />
              </button>
              <button onClick={() => exportData('excel')} className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all" title="Export Excel">
                 <HiCollection className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { setShowForm(true); setEditId(null); setForm({ userName: '', amount: '', type: 'income', description: '', method: 'bank', userPhone: '', userEmail: '' }); }} 
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                <HiPlus className="w-5 h-5" /> {t('addCourse').replace('Course', 'Entry')}
              </button>
           </div>
        </div>
      </div>

      {/* Summary Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
         <StatsPulse icon={HiTrendingUp} label={t('income')} val={stats.income} color="from-emerald-600 to-teal-700" isPrice formatPrice={formatPrice} />
         <StatsPulse icon={HiTrendingDown} label={t('expenses')} val={stats.expenses} color="from-rose-500 to-pink-600" isPrice formatPrice={formatPrice} />
         <StatsPulse icon={HiScale} label={t('liabilities')} val={stats.liabilities} color="from-amber-500 to-orange-600" isPrice formatPrice={formatPrice} />
         <StatsPulse icon={HiChartBar} label="Profit Margin" val={`${stats.margin.toFixed(1)}%`} color="from-indigo-600 to-purple-700" />
         <StatsPulse icon={HiCash} label={t('netProfit')} val={stats.net} color="from-blue-600 to-indigo-700" isPrice formatPrice={formatPrice} />
      </div>

      {/* Mini Trend Chart */}
      <div className="bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-blue-50 dark:border-white/10 shadow-sm relative overflow-hidden group">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Profitability Nodes</h4>
               <p className="text-xl font-black text-slate-900 dark:text-white uppercase mt-1">Growth Matrix</p>
            </div>
            <div className="flex gap-2">
               <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Income</span>
               <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase"><span className="w-2 h-2 rounded-full bg-rose-500" /> Expense</span>
            </div>
         </div>
         <div className="h-40 w-full relative">
            <svg viewBox="0 0 1000 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
               {/* Simplified trend lines */}
               <path d="M0,80 L100,50 L200,70 L300,30 L400,60 L500,40 L600,20 L700,50 L800,10 L900,40 L1000,20" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500/80" />
               <path d="M0,90 L100,70 L200,80 L300,60 L400,75 L500,65 L600,55 L700,70 L800,50 L900,65 L1000,45" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-500/50" strokeDasharray="5,5" />
            </svg>
            <div className="absolute inset-0 flex items-end justify-between px-2 pt-10 pointer-events-none opacity-20">
               {[...Array(11)].map((_, i) => <div key={i} className="w-[1px] h-full bg-slate-200 dark:bg-white/10" />)}
            </div>
         </div>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-6 text-center italic">Calculated trend based on last 30 operational nodes</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
         {['all', 'income', 'expense', 'liability'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                filter === f 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                  : 'bg-white dark:bg-white/5 text-gray-400 border-gray-100 dark:border-white/10 hover:border-blue-300'
              }`}
            >
              {t(f) || f}
            </button>
         ))}
      </div>

      {/* Table */}
      {/* Desktop Table: Advanced Scrollable Layout */}
      <div className="bg-white dark:bg-black rounded-[3.5rem] border-4 border-blue-600 dark:border-blue-900 shadow-2xl shadow-blue-900/10 overflow-hidden transition-all relative">
         <div className="overflow-auto max-h-[70vh] custom-scrollbar border-b-2 border-blue-50 dark:border-blue-900/30">
            <table className="w-full border-collapse min-w-[1400px]">
               <thead className="sticky top-0 z-20 shadow-xl">
                  <tr className="bg-blue-600 dark:bg-blue-700 border-b-4 border-blue-700 dark:border-blue-900">
                    <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black">Time-Stamp</th>
                    <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black">Entity / Source</th>
                    <th className="p-8 text-left text-[12px] font-black uppercase tracking-[0.3em] text-black">Categorization</th>
                    <th className="p-8 text-right text-[12px] font-black uppercase tracking-[0.3em] text-black">Financial Value</th>
                    <th className="p-8 text-right text-[12px] font-black uppercase tracking-[0.3em] text-black">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y-2 divide-blue-50 dark:divide-blue-900/30">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-20 text-center">
                        <HiChartBar className="w-12 h-12 text-gray-200 dark:text-white/10 mx-auto mb-4" />
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('noResults')}</p>
                      </td>
                    </tr>
                  ) : filtered.map(tr => {
                    const dual = formatDualPrice(tr.amount);
                    return (
                      <tr 
                        key={tr.id} 
                        className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-all relative"
                      >
                        <td className="p-8">
                           <p className="text-sm font-black text-slate-800 dark:text-emerald-400 tabular-nums uppercase tracking-tighter leading-none mb-2">{tr.createdAt ? formatDateTime(tr.createdAt) : 'PENDING'}</p>
                           <p className="text-[10px] font-black text-blue-600/40 uppercase tracking-[0.2em]">{tr.id.slice(0, 8)}</p>
                        </td>
                        <td className="p-8">
                           <div className="flex items-center gap-6">
                             <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.8rem] flex items-center justify-center text-white font-black shadow-xl group-hover:rotate-6 transition-all duration-500">
                                {tr.userName?.[0] || 'S'}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 dark:text-emerald-400 uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-none mb-2">{tr.userName || 'Anonymous Entity'}</p>
                                <p className="text-[10px] font-black text-slate-400 dark:text-emerald-500/30 uppercase tracking-widest leading-none">{tr.method || 'Internal Gateway'}</p>
                             </div>
                           </div>
                        </td>
                        <td className="p-8">
                           <span className={`inline-flex px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl ${
                              tr.category === 'income' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 
                              tr.category === 'expense' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                           }`}>
                              {tr.type?.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="p-8 text-right">
                           <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none mb-1">{dual.etb}</p>
                           <p className="text-[10px] font-black text-blue-600/40 uppercase tracking-widest">{dual.usd}</p>
                        </td>
                        <td className="p-8 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button 
                                onClick={() => { setForm(tr); setEditId(tr.id); setShowForm(true); }}
                                className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
                                title="Edit Transaction"
                              >
                                 <HiPencil className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(tr.id)}
                                className="p-3 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-colors"
                                title="Permanent Delete"
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

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? "Edit Financial Entry" : "New Financial Entry"}>
         <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <InputGroup label="Entity Name" placeholder="e.g. John Doe, SVTech Supplies" value={form.userName} onChange={v => setForm({...form, userName: v})} />
               <InputGroup label="Fiscal Value" type="number" value={form.amount} onChange={v => setForm({...form, amount: v})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <SelectGroup label="Operation Logic" value={form.type} onChange={v => setForm({...form, type: v})} options={[
                  {v: 'income', l: 'Standard Income'},
                  {v: 'expense', l: 'General Expense'},
                  {v: 'liability', l: 'Account Liability'},
                  {v: 'withdrawal', l: 'User Payout'},
                  {v: 'course_payment', l: 'Course Revenue'},
                  {v: 'app_sale', l: 'Product Sale'},
               ]} />
               <SelectGroup label="Gateway" value={form.method} onChange={v => setForm({...form, method: v})} options={[
                  {v: 'bank', l: 'Local Bank'},
                  {v: 'telebirr', l: 'Telebirr'},
                  {v: 'stripe', l: 'Stripe Global'},
                  {v: 'cash', l: 'Physical Cash'},
               ]} />
            </div>

            <textarea 
               placeholder="Memo / Description..."
               className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm"
               value={form.description}
               onChange={e => setForm({...form, description: e.target.value})}
            />

            <button disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
               {loading ? t('loading') : (editId ? 'Update Financial Entry' : 'Commit Financial Entry')}
            </button>
         </form>
      </Modal>
    </div>
  );
};

const StatsPulse = ({ icon: Icon, label, val, color, isPrice, formatPrice }) => (
  <div className={`bg-gradient-to-br ${color} p-7 rounded-[2rem] border border-white/10 shadow-xl relative overflow-hidden group`}>
     <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
        <Icon className="w-24 h-24 text-white" />
     </div>
     <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-xl border border-white/20">
           <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
           <h4 className="text-2xl font-black text-white tracking-tighter tabular-nums leading-none mb-1">
              {isPrice ? formatPrice(val) : val}
           </h4>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{label}</p>
        </div>
     </div>
  </div>
);

const InputGroup = ({ label, value, onChange, type="text", placeholder }) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">{label}</label>
     <input 
        type={type}
        placeholder={placeholder}
        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
        value={value}
        onChange={e => onChange(e.target.value)}
     />
  </div>
);

const SelectGroup = ({ label, value, onChange, options }) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">{label}</label>
     <select 
       className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all cursor-pointer"
       value={value}
       onChange={e => onChange(e.target.value)}
     >
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
     </select>
  </div>
);

export default TransactionPanel;
