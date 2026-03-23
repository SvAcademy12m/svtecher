import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiShieldCheck, HiCreditCard, HiCheckCircle, HiXCircle, 
  HiClock, HiSearch, HiFilter, HiBadgeCheck, HiEye,
  HiChartBar, HiCurrencyDollar, HiLightningBolt, HiSparkles
} from 'react-icons/hi';
import { db } from '../../../core/firebase/firebase';
import { 
  collection, query, where, onSnapshot, addDoc,
  doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const q = filter === 'all' 
      ? collection(db, 'payments')
      : query(collection(db, 'payments'), where('status', '==', filter));

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPayments(docs.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
    });

    return () => unsub();
  }, [filter]);

  const handleAction = async (payment, status) => {
    if (loading) return;
    
    if (status === 'approved') {
       const confirmRef = window.prompt(`To approve this payment, please type the Reference Number explicitly to cross-check: ${payment.referenceCode}`);
       if (confirmRef !== payment.referenceCode) {
          toast.error("Reference number mismatch. Approval aborted.");
          return;
       }
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'payments', payment.id), {
        status,
        verifiedAt: serverTimestamp(),
      });

      if (status === 'approved') {
        await addDoc(collection(db, 'transactions'), {
           amount: Number(payment.amount || 0),
           type: payment.type || 'deposit',
           category: 'income',
           status: 'completed',
           method: payment.method || 'bank',
           referenceCode: payment.referenceCode,
           userId: payment.userId || 'UNKNOWN',
           userName: payment.userName || 'Anonymous Entity',
           createdAt: serverTimestamp(),
        });

        // Special logic for Certificate Fees
        if (payment.type === 'certificate_fee' && payment.certDocId) {
          await updateDoc(doc(db, 'certificates', payment.certDocId), {
            status: 'paid',
            verifiedAt: serverTimestamp(),
            verifiedBy: 'Admin System'
          });
        }
      }

      toast.success(`Payment ${status === 'approved' ? 'approved' : 'declined'} successfully.`);
    } catch (err) {
      toast.error('Failed to update payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.referenceCode?.toLowerCase().includes(search.toLowerCase()) || 
    p.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const approvedCount = payments.filter(p => p.status === 'approved').length;
  const declinedCount = payments.filter(p => p.status === 'declined').length;
  const totalApprovedVal = payments.filter(p => p.status === 'approved').reduce((s, p) => s + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-900 p-8 lg:p-10 shadow-2xl shadow-purple-900/30">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                <HiShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">{t('payments')}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">{t('paymentVerification')}</h2>
            <p className="text-sm text-white/50 font-bold mt-2">Review, approve, and manage incoming payment submissions</p>
          </div>
          <div className="flex bg-white/10 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10">
            <FilterBtn active={filter === 'pending'} onClick={() => setFilter('pending')} count={pendingCount} color="amber">
              {t('paymentPending')}
            </FilterBtn>
            <FilterBtn active={filter === 'approved'} onClick={() => setFilter('approved')} count={approvedCount} color="emerald">
              {t('paymentApproved')}
            </FilterBtn>
            <FilterBtn active={filter === 'declined'} onClick={() => setFilter('declined')} count={declinedCount} color="rose">
              Declined
            </FilterBtn>
            <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} color="blue">
              All
            </FilterBtn>
          </div>
        </div>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiClock} label={t('paymentPending')} value={pendingCount} gradient="from-amber-400 to-orange-500" shadow="shadow-amber-500/20" />
        <StatCard icon={HiCheckCircle} label={t('paymentApproved')} value={approvedCount} gradient="from-emerald-400 to-teal-600" shadow="shadow-emerald-500/20" />
        <StatCard icon={HiXCircle} label={t('paymentDeclined')} value={declinedCount} gradient="from-rose-400 to-pink-600" shadow="shadow-rose-500/20" />
        <StatCard icon={HiCurrencyDollar} label="Approved Value" value={formatPrice(totalApprovedVal)} gradient="from-violet-500 to-purple-700" shadow="shadow-violet-500/20" isText />
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-900/40 shadow-lg flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 relative w-full">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5" />
          <input 
            type="text"
            placeholder={`${t('search')} by reference or name...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-purple-50 dark:bg-purple-900/10 rounded-xl border-2 border-purple-100 dark:border-purple-800/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none font-bold text-sm transition-all dark:text-white dark:placeholder-white/30"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-purple-500 dark:text-purple-400 uppercase tracking-widest">
          <HiFilter className="w-4 h-4" />
          <span>{filteredPayments.length} results</span>
        </div>
      </div>

      {/* Payments Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredPayments.map((p, idx) => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative overflow-hidden rounded-2xl p-6 border-2 shadow-xl transition-all group hover:-translate-y-1 hover:shadow-2xl ${
              p.status === 'approved' 
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border-emerald-200 dark:border-emerald-800/40 shadow-emerald-100 dark:shadow-emerald-900/10'
                : p.status === 'declined'
                ? 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/10 border-rose-200 dark:border-rose-800/40 shadow-rose-100 dark:shadow-rose-900/10'
                : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/5 border-amber-200 dark:border-amber-800/40 shadow-amber-100 dark:shadow-amber-900/10'
            }`}
          >
            {/* Decorative glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${
              p.status === 'approved' ? 'bg-emerald-400' : p.status === 'declined' ? 'bg-rose-400' : 'bg-amber-400'
            }`} />

            {/* Top Row */}
            <div className="relative z-10 flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl ${
                  p.status === 'approved' ? 'bg-gradient-to-br from-emerald-400 to-teal-600' :
                  p.status === 'declined' ? 'bg-gradient-to-br from-rose-400 to-pink-600' :
                  'bg-gradient-to-br from-amber-400 to-orange-600'
                }`}>
                  {p.userName?.[0] || '?'}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{p.userName || 'Anonymous'}</h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">{p.method || 'Bank Transfer'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{formatPrice(Number(p.amount || 0))}</p>
                <StatusBadge status={p.status} t={t} />
              </div>
            </div>

            {/* Reference Code */}
            <div className="relative z-10 p-4 bg-white/60 dark:bg-black/20 rounded-xl border border-slate-200/60 dark:border-white/5 mb-5 backdrop-blur-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('transactionRef')}</p>
              <code className="text-lg font-black text-purple-700 dark:text-purple-400 tracking-widest break-all">{p.referenceCode}</code>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('submissionDate')}</p>
                <p className="text-sm font-black text-slate-700 dark:text-white/80 mt-0.5">
                  {p.timestamp?.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>

              {p.status === 'pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(p, 'declined')}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 text-white hover:bg-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95"
                  >
                    <HiXCircle className="w-4 h-4" />
                    {t('declinePayment')}
                  </button>
                  <button 
                    onClick={() => handleAction(p, 'approved')}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
                  >
                    <HiCheckCircle className="w-4 h-4" />
                    {t('approvePayment')}
                  </button>
                </div>
              )}
              {p.status !== 'pending' && (
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full ${
                  p.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
                }`}>
                  <HiLightningBolt className="inline w-3 h-3 mr-1" /> Finalized
                </span>
              )}
            </div>
          </motion.div>
        ))}

        {filteredPayments.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-3xl flex items-center justify-center mb-6">
              <HiSparkles className="w-10 h-10 text-purple-400" />
            </div>
            <p className="text-lg font-black text-slate-600 dark:text-white">{t('noPaymentsFound')}</p>
            <p className="text-sm font-medium text-slate-400 dark:text-white/50 mt-1">{t('paymentQueueEmpty')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, gradient, shadow, isText }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-xl ${shadow} group`}>
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-1000">
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

const StatusBadge = ({ status, t }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 border-amber-300',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    declined: 'bg-rose-100 text-rose-700 border-rose-300',
  };
  const labels = {
    pending: t('paymentPending'),
    approved: t('paymentApproved'),
    declined: t('paymentDeclined'),
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black tracking-widest border-2 mt-1 ${styles[status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
      {labels[status] || status}
    </span>
  );
};

const FilterBtn = ({ active, onClick, children, count, color = 'blue' }) => {
  const colors = {
    blue: 'bg-white text-purple-900 shadow-lg',
    amber: 'bg-amber-400 text-white shadow-lg shadow-amber-500/30',
    emerald: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
    rose: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30',
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider transition-all ${
        active ? colors[color] : 'text-white/60 hover:text-white'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${active ? 'bg-black/10' : 'bg-white/10 text-white/40'}`}>
          {count}
        </span>
      )}
    </button>
  );
};

export default PaymentVerification;
