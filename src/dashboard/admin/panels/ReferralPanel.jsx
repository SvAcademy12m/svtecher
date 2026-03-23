import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { formatDateTime } from '../../../core/utils/formatters';
import { HiUserAdd, HiCash, HiCheck, HiX, HiClipboardCopy, HiGift } from 'react-icons/hi';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import StatCard from '../../../components/cards/StatCard';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { HiDownload, HiPlus } from 'react-icons/hi';

const REFERRAL_RATE = 0.10; // 10%

const ReferralPanel = ({ users }) => {
  const { t } = useLanguage();
  const { formatPrice, formatDualPrice } = useCurrency();
  const [referrals, setReferrals] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReferral, setNewReferral] = useState({ referrerId: '', referredId: '', commission: 0 });

  useEffect(() => {
    const q = query(collection(db, 'referrals'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const wq = query(collection(db, 'referral_withdrawals'), orderBy('createdAt', 'desc'));
    const unsub2 = onSnapshot(wq, (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsub(); unsub2(); };
  }, []);

  // Calculate per-user referral stats
  const getUserReferralStats = (userId) => {
    const userRefs = referrals.filter(r => r.referrerId === userId);
    const totalEarned = userRefs.reduce((sum, r) => sum + (Number(r.commission) || 0), 0);
    const userWithdrawals = withdrawals.filter(w => w.userId === userId && w.status === 'completed');
    const totalWithdrawn = userWithdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
    return {
      referredCount: userRefs.length,
      totalEarned,
      totalWithdrawn,
      balance: totalEarned - totalWithdrawn,
    };
  };

  // Get all referrers (users who have referred others)
  const referrerIds = [...new Set(referrals.map(r => r.referrerId))];
  const referrers = referrerIds.map(id => {
    const user = users.find(u => u.id === id) || { id, name: 'Unknown', email: '' };
    return { ...user, stats: getUserReferralStats(id) };
  }).sort((a, b) => b.stats.totalEarned - a.stats.totalEarned);

  const totalCommissions = referrals.reduce((sum, r) => sum + (Number(r.commission) || 0), 0);
  const totalPaidOut = withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const amount = Number(withdrawAmount);
    if (amount <= 0 || amount > selectedUser.stats.balance) {
      toast.error('Invalid amount');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'referral_withdrawals'), {
        userId: selectedUser.id,
        userName: selectedUser.name,
        amount,
        status: 'completed',
        method: 'bank',
        createdAt: serverTimestamp(),
      });

      // Record as transaction too
      await addDoc(collection(db, 'transactions'), {
        userId: selectedUser.id,
        userName: selectedUser.name,
        amount,
        type: 'withdrawal',
        description: `Referral commission payout for ${selectedUser.name}`,
        status: 'completed',
        method: 'bank',
        createdAt: serverTimestamp(),
      });

      toast.success(`Paid out ${formatPrice(amount)} to ${selectedUser.name}`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setSelectedUser(null);
    } catch {
      toast.error('Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Referral code copied!');
  };

  const handleAddReferral = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'referrals'), {
        referrerId: newReferral.referrerId,
        referredId: newReferral.referredId,
        commission: Number(newReferral.commission),
        status: 'verified',
        createdAt: serverTimestamp()
      });
      toast.success('Referral relationship added!');
      setShowAddModal(false);
      setNewReferral({ referrerId: '', referredId: '', commission: 0 });
    } catch {
      toast.error('Failed to add referral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight underline decoration-blue-600 decoration-4 underline-offset-8">Referrals Console</h3>
          <p className="text-[10px] font-black text-blue-600 dark:text-white/40 uppercase tracking-widest mt-4">Growth & Incentives Performance</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => {
                const ws = XLSX.utils.json_to_sheet(referrers);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Referrers");
                XLSX.writeFile(wb, "SVTech_Referrers.xlsx");
             }}
             className="px-6 py-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border-2 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all font-black uppercase tracking-widest text-[10px]"
           >
              Export Matrix <HiDownload className="w-4 h-4" />
           </button>
           <label className="px-6 py-3 bg-blue-500/10 text-blue-500 rounded-2xl border-2 border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] cursor-pointer">
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
                         await addDoc(collection(db, 'referrals'), {
                            referrerId: row.ReferrerId || row.referrerId || '',
                            referredId: row.ReferredId || row.referredId || '',
                            commission: Number(row.Commission || row.commission || 0),
                            status: (row.Status || row.status || 'verified').toLowerCase(),
                            createdAt: serverTimestamp()
                         });
                         count++;
                      }
                      toast.success(`${count} referral nodes synchronized`);
                   };
                   reader.readAsBinaryString(file);
                }}
              />
           </label>
           <button 
             onClick={() => setShowAddModal(true)}
             className="px-6 py-3 bg-purple-500/10 text-purple-600 rounded-2xl border-2 border-purple-500/20 hover:bg-purple-600 hover:text-white transition-all font-black uppercase tracking-widest text-[10px]"
           >
              Override <HiPlus className="w-4 h-4 inline" />
           </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <StatCard icon={HiUserAdd} label={t('referredUsers')} value={referrals.length} gradient />
        <StatCard icon={HiCash} label={t('totalEarnings')} value={formatPrice(totalCommissions)} />
        <StatCard icon={HiCheck} label="Paid Out" value={formatPrice(totalPaidOut)} />
        <StatCard icon={HiGift} label={t('referralRate')} value="10%" />
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
         <h4 className="text-xl font-black mb-6 tracking-wide relative">How It Works</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg shadow-blue-600/20">1</span>
            <div>
                <p className="text-sm font-black tracking-wide mb-1 text-blue-200">Your Referral Link</p>
               <p className="text-xs text-blue-100/60 leading-relaxed font-medium">Each user gets a unique referral link to share with friends and family at svtecher.com.</p>
            </div>
          </div>
          <div className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg shadow-indigo-600/20">2</span>
            <div>
                <p className="text-sm font-black tracking-wide mb-1 text-indigo-200">How You Earn</p>
               <p className="text-xs text-blue-100/60 leading-relaxed font-medium">When someone you referred makes a payment and it is approved by admin, you earn 10% commission automatically.</p>
            </div>
          </div>
          <div className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg shadow-purple-600/20">3</span>
            <div>
                <p className="text-sm font-black tracking-wide mb-1 text-purple-200">Getting Paid</p>
               <p className="text-xs text-blue-100/60 leading-relaxed font-medium">Your earned balance can be withdrawn to your bank or mobile money account when approved by admin.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referrer Table - Premium Style */}
      <div className="bg-white dark:bg-[#0e1225] rounded-[3rem] border-[3px] border-black dark:border-white/10 overflow-hidden shadow-2xl transition-all">
         <div className="p-8 border-b-4 border-black dark:border-white/5 flex justify-between items-center">
          <h4 className="text-xl font-black text-blue-900 dark:text-white tracking-tighter uppercase">Affiliate High-Score Matrix</h4>
          <span className="px-5 py-1.5 rounded-2xl bg-blue-500 text-white text-[10px] font-black tracking-wider shadow-lg">{referrers.length} Active Nodes</span>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar p-1">
          <table className="w-full border-collapse border-[3px] border-slate-300 dark:border-slate-600 min-w-[1000px]">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white z-20">
               <tr>
                <th className="border-[3px] border-slate-300 dark:border-slate-600 text-left p-6 text-[11px] font-black tracking-widest uppercase">Referrer Identity</th>
                <th className="border-[3px] border-slate-300 dark:border-slate-600 text-center p-6 text-[11px] font-black tracking-widest uppercase">Referral Scale</th>
                <th className="border-[3px] border-slate-300 dark:border-slate-600 text-right p-6 text-[11px] font-black tracking-widest uppercase">Earned (ETB)</th>
                <th className="border-[3px] border-slate-300 dark:border-slate-600 text-right p-6 text-[11px] font-black tracking-widest uppercase">Earned (USD)</th>
                <th className="border-[3px] border-slate-300 dark:border-slate-600 text-right p-6 text-[11px] font-black tracking-widest uppercase">Released</th>
                <th className="border-[3px] border-slate-300 dark:border-slate-600 text-right p-6 text-[11px] font-black tracking-widest uppercase">Net Balance</th>
                <th className="border-[3px] border-slate-300 dark:border-slate-600 text-right p-6 text-[11px] font-black tracking-widest uppercase">Protocol</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#0e1225]">
              {referrers.map(ref => {
                const dual = formatDualPrice(ref.stats.totalEarned);
                return (
                  <tr key={ref.id} className="transition-all group hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="p-6 border-[3px] border-slate-300 dark:border-slate-600">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-900 dark:text-white text-sm font-black uppercase group-hover:rotate-6 transition-all">
                              {ref.name?.[0] || '?'}
                        </div>
                         <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">{ref.name}</p>
                          <p className="text-[10px] font-black text-blue-600/40 uppercase tracking-widest mt-1.5">{ref.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 border-[3px] border-slate-300 dark:border-slate-600 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white text-xs font-black">
                        {ref.stats.referredCount}
                      </span>
                    </td>
                    <td className="p-6 border-[3px] border-slate-300 dark:border-slate-600 text-right font-black text-slate-900 dark:text-white">{dual.etb}</td>
                    <td className="p-6 border-[3px] border-slate-300 dark:border-slate-600 text-right font-black text-blue-600">{dual.usd}</td>
                    <td className="p-6 border-[3px] border-slate-300 dark:border-slate-600 text-right text-[10px] font-black text-slate-400 uppercase tracking-wide">{formatPrice(ref.stats.totalWithdrawn)}</td>
                    <td className="p-6 border-[3px] border-slate-300 dark:border-slate-600 text-right">
                      <span className={`text-[11px] font-black px-4 py-1.5 rounded-xl border-2 transition-all ${ref.stats.balance > 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-500 shadow-lg' : 'text-slate-300 dark:text-white/10 border-slate-100 dark:border-white/5'}`}>
                        {formatPrice(ref.stats.balance)}
                      </span>
                    </td>
                    <td className="p-6 border-[3px] border-slate-300 dark:border-slate-600 text-right">
                      {ref.stats.balance > 0 ? (
                        <button
                           className="px-6 py-2.5 bg-blue-600 hover:bg-black text-white rounded-xl text-[10px] font-black tracking-widest shadow-xl transition-all active:scale-95"
                          onClick={() => { setSelectedUser(ref); setShowWithdrawModal(true); }}
                        >
                          RELEASE
                        </button>
                      ) : (
                        <span className="text-[8px] font-black tracking-widest text-slate-300 uppercase">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {referrers.length === 0 && (
          <div className="text-center py-16 text-sm text-slate-400">No referrals tracked yet</div>
        )}
      </div>

      {/* Withdrawal Modal */}
      <Modal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title={`Payout â€” ${selectedUser?.name}`}>
        <form onSubmit={handleWithdraw} className="space-y-5">
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Earned</span>
              <span className="font-bold text-slate-900">{formatPrice(selectedUser?.stats?.totalEarned || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Already Withdrawn</span>
              <span className="font-medium text-slate-600">{formatPrice(selectedUser?.stats?.totalWithdrawn || 0)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
              <span className="text-slate-900 font-bold">{t('withdrawable')}</span>
              <span className="font-black text-emerald-600">{formatPrice(selectedUser?.stats?.balance || 0)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{t('amount')} (ETB)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              max={selectedUser?.stats?.balance || 0}
              className="input-field"
              placeholder={`Max: ${selectedUser?.stats?.balance || 0} ETB`}
              required
            />
            {withdrawAmount && (
              <p className="text-xs text-slate-400 mt-1">â‰ˆ {formatDualPrice(withdrawAmount).usd}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all">
            {t('withdrawFunds')}
          </button>
        </form>
      </Modal>

      {/* Add Referral Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Override Referral">
        <form onSubmit={handleAddReferral} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Referrer User ID</label>
            <input type="text" value={newReferral.referrerId} onChange={e => setNewReferral({...newReferral, referrerId: e.target.value})} className="input-field" required placeholder="User ID of referrer" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Referred User ID</label>
            <input type="text" value={newReferral.referredId} onChange={e => setNewReferral({...newReferral, referredId: e.target.value})} className="input-field" required placeholder="User ID of referred person" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Commission Amount (ETB)</label>
            <input type="number" value={newReferral.commission} onChange={e => setNewReferral({...newReferral, commission: e.target.value})} className="input-field" required placeholder="e.g. 500" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all">Save Relation</button>
        </form>
      </Modal>
    </div>
  );
};

export default ReferralPanel;
