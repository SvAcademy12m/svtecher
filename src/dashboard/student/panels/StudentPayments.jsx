import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCreditCard, HiLibrary, HiBadgeCheck, HiShieldCheck, HiArrowRight, HiClipboardCopy, HiCheckCircle, HiClock, HiCollection } from 'react-icons/hi';
import { CONTACT_INFO } from '../../../core/utils/constants';
import { toast } from 'react-toastify';
import { db } from '../../../core/firebase/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { formatDateTime } from '../../../core/utils/formatters';

const StudentPayments = ({ user, userData }) => {
  const [refCode, setRefCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('bank');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    
    // Listen to pending payments
    const qPayments = query(
      collection(db, 'payments'), 
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    
    // Listen to completed transactions
    const qTransactions = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubPayments = onSnapshot(qPayments, (snap) => {
      const pData = snap.docs.map(d => ({ id: d.id, ...d.data(), isTransaction: false }));
      setHistory(prev => {
        const transOnly = prev.filter(i => i.isTransaction);
        return [...pData, ...transOnly].sort((a, b) => {
          const tA = (a.timestamp || a.createdAt)?.seconds || 0;
          const tB = (b.timestamp || b.createdAt)?.seconds || 0;
          return tB - tA;
        });
      });
    });

    const unsubTransactions = onSnapshot(qTransactions, (snap) => {
      const tData = snap.docs.map(d => ({ id: d.id, ...d.data(), isTransaction: true }));
      setHistory(prev => {
        const payOnly = prev.filter(i => !i.isTransaction);
        return [...tData, ...payOnly].sort((a, b) => {
          const tA = (a.timestamp || a.createdAt)?.seconds || 0;
          const tB = (b.timestamp || b.createdAt)?.seconds || 0;
          return tB - tA;
        });
      });
    });

    return () => {
      unsubPayments();
      unsubTransactions();
    };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!refCode) return toast.error('Reference number required');
    setLoading(true);
    try {
      await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        userName: userData?.name || 'Technician',
        referenceCode: refCode,
        method: method,
        status: 'pending',
        timestamp: serverTimestamp(),
        bankAccount: '1000508224145'
      });
      toast.success('Payment Submitted! awaiting verification.');
      setRefCode('');
    } catch (err) {
      toast.error('System Link Failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-2 text-left ">Financial Infrastructure</h3>
           <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter  uppercase leading-none">Payment <span className="text-blue-700">Hub</span></h2>
        </div>
        
        <div className="flex items-center gap-4 p-5 bg-blue-50 rounded-3xl border border-blue-100 border-b-4">
           <HiShieldCheck className="w-8 h-8 text-blue-600" />
           <div>
              <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest leading-none">Secure Link Status</p>
              <p className="text-xs font-black text-slate-700 uppercase  mt-1">Encrypted Connection Active</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Payment Instructions */}
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm shadow-slate-200/50">
             <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8  flex items-center gap-3">
               <HiLibrary className="text-blue-600" /> Official Repository Instructions
             </h4>

             <div className="space-y-6">
                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                      <HiCreditCard className="w-20 h-20" />
                   </div>
                   <div className="relative z-10">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Commercial Bank Of Ethiopia (CBE)</p>
                      <h5 className="text-3xl font-black text-slate-900 tracking-tighter">1000508224145</h5>
                      <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest ">Beneficiary: SVTECH DIGITAL</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('1000508224145');
                          toast.success('Account number copied');
                        }}
                        className="mt-6 flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                      >
                         <HiClipboardCopy /> Copy Account Number
                      </button>
                   </div>
                </div>

                <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                      <HiCreditCard className="w-20 h-20" />
                   </div>
                   <div className="relative z-10">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">Mobile Money (Telebirr)</p>
                      <h5 className="text-3xl font-black text-slate-900 tracking-tighter ">Coming 04/26</h5>
                      <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Direct API Intgration underway</p>
                   </div>
                </div>
             </div>

             <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest ">
                   * Note: For manual bank transfers, please include your <span className="text-blue-700">Full Name</span> or <span className="text-blue-700 font-bold">Ref No</span> in the transaction description for faster verification.
                </p>
             </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="bg-[#0e1225] text-white rounded-[3rem] p-10 shadow-2xl shadow-blue-900/40 relative overflow-hidden group border border-white/5">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-400/20 transition-all" />
             
             <div className="relative z-10">
                <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 ">Payment Verification</h4>
                <p className="text-blue-100/40 text-[10px] uppercase tracking-widest font-black mb-10">Submit your transaction details to unlock modules.</p>

                <div className="space-y-8">
                   <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-blue-300 mb-3 ml-2 ">Select Link Type</label>
                      <div className="grid grid-cols-2 gap-4">
                         <PayMethodBtn active={method === 'bank'} onClick={() => setMethod('bank')}>CBE Bank</PayMethodBtn>
                         <PayMethodBtn active={method === 'telebirr'} onClick={() => setMethod('telebirr')}>Telebirr</PayMethodBtn>
                      </div>
                   </div>

                   <div className="group/field">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-blue-300 mb-3 ml-2 ">Transaction Reference Code</label>
                      <input 
                        value={refCode}
                        onChange={(e) => setRefCode(e.target.value)}
                        required
                        placeholder="ENTER REF CODE" 
                        className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-2xl focus:border-cyan-400 outline-none font-mono text-xl tracking-widest text-white transition-all group-hover/field:border-white/20 uppercase"
                      />
                   </div>

                   <button 
                     type="submit"
                     disabled={loading}
                     className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-blue-900/50"
                   >
                     {loading ? 'Initializing Sync...' : (<>Initialize Unlock <HiArrowRight className="w-5 h-5"/></>)}
                   </button>
                </div>
             </div>
          </form>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex items-start gap-5 group">
             <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <HiBadgeCheck className="w-7 h-7" />
             </div>
             <div>
                <h5 className="font-black text-slate-900 uppercase tracking-tight ">Approval Hierarchy</h5>
                <div className="mt-4 space-y-3">
                   <StatusLine icon={HiCheckCircle} color="text-emerald-500" label="Approved: Module Active" />
                   <StatusLine icon={HiClock} color="text-amber-500" label="Pending: Tech Verification" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="mt-12">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <HiCollection className="w-6 h-6" />
           </div>
           <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Transaction Ledger</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Financial Records</p>
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date Triggered</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Reference ID</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Gateway</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-20 text-center">
                           <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No transaction nodes detected in current session.</p>
                        </td>
                      </tr>
                    ) : (
                      history.map(item => {
                        const date = item.timestamp || item.createdAt;
                        const isApproved = item.isTransaction || item.status === 'approved';
                        
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="p-6 text-xs font-black text-slate-900 uppercase tracking-tighter">
                                {date ? formatDateTime(date) : 'Pending Sync'}
                             </td>
                             <td className="p-6">
                                <p className="px-3 py-1 bg-slate-100 rounded-lg font-mono text-[11px] font-black text-slate-600 inline-block">
                                   {item.referenceCode || 'INTERNAL-REF'}
                                </p>
                                {item.type && (
                                  <p className="text-[8px] font-black text-blue-400 mt-1 uppercase tracking-widest">{item.type.replace('_', ' ')}</p>
                                )}
                             </td>
                             <td className="p-6 text-xs font-bold text-slate-500 uppercase">
                                {item.method || 'System'}
                             </td>
                             <td className="p-6 text-center">
                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                  isApproved 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-amber-500 text-white'
                                }`}>
                                   {isApproved ? 'COMMITTED' : 'PENDING'}
                                </span>
                             </td>
                          </tr>
                        );
                      })
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

const PayMethodBtn = ({ active, onClick, children }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`p-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
      active ? 'bg-white text-blue-900 border-white shadow-xl shadow-white/20' : 'bg-transparent text-white/40 border-white/10 hover:border-white/20'
    }`}
  >
    {children}
  </button>
);

const StatusLine = ({ icon: Icon, color, label }) => (
  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 ">
     <Icon className={`w-4 h-4 ${color}`} /> {label}
  </div>
);

export default StudentPayments;
