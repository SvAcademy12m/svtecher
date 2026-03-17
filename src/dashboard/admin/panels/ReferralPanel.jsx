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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight">{t('referrals')}</h3>
          <p className="text-sm font-black text-blue-600/50 dark:text-indigo-400/50 uppercase tracking-widest mt-1">Growth & Incentives Performance</p>
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
        <h4 className="text-xl font-black mb-6 uppercase tracking-widest relative">Ecosystem Logic</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg shadow-blue-600/20">1</span>
            <div>
               <p className="text-sm font-black uppercase tracking-wide mb-1 text-blue-200">Unique Identity</p>
               <p className="text-xs text-blue-100/60 leading-relaxed font-medium">Each entity is assigned a cryptographically unique referral identifier for distribution.</p>
            </div>
          </div>
          <div className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg shadow-indigo-600/20">2</span>
            <div>
               <p className="text-sm font-black uppercase tracking-wide mb-1 text-indigo-200">Revenue Split</p>
               <p className="text-xs text-blue-100/60 leading-relaxed font-medium">Upon verified acquisition and fiscal completion, a 10% commission is automatically yielded.</p>
            </div>
          </div>
          <div className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg shadow-purple-600/20">3</span>
            <div>
               <p className="text-sm font-black uppercase tracking-wide mb-1 text-purple-200">Fiscal Liquidity</p>
               <p className="text-xs text-blue-100/60 leading-relaxed font-medium">Earned balances can be transitioned into liquidity through authorized bank/mobile settlements.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referrer Table - Premium Style */}
      <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-blue-900/10 transition-all">
        <div className="p-8 border-b border-blue-50 dark:border-white/5 flex justify-between items-center">
          <h4 className="text-lg font-black text-blue-900 dark:text-white uppercase tracking-widest">Referrer Hierarchy</h4>
          <span className="px-5 py-1.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">{referrers.length} Active Referrers</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900 dark:bg-[#0e1225]">
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Ambassador Identity</th>
                <th className="text-center p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Network Size</th>
                <th className="text-right p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Yielded ETB</th>
                <th className="text-right p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Yielded USD</th>
                <th className="text-right p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Accumulated Payout</th>
                <th className="text-right p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Net Liquidity</th>
                <th className="text-right p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-white/5">
              {referrers.map(ref => {
                const dual = formatDualPrice(ref.stats.totalEarned);
                return (
                  <tr key={ref.id} className="transition-all group hover:bg-blue-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-6 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                           <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#151a30] flex items-center justify-center text-blue-600 dark:text-white text-sm font-black uppercase">
                              {ref.name?.[0] || '?'}
                           </div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-blue-900 dark:text-white tracking-tight leading-none">{ref.name}</p>
                          <p className="text-[10px] font-black text-blue-600/40 dark:text-indigo-400/40 uppercase tracking-widest mt-1.5">{ref.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 align-middle text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-sm font-black shadow-inner">
                        {ref.stats.referredCount}
                      </span>
                    </td>
                    <td className="p-6 align-middle text-right font-black text-blue-900 dark:text-white bg-blue-50/30 dark:bg-black/10">{dual.etb}</td>
                    <td className="p-6 align-middle text-right font-black text-blue-600 dark:text-indigo-400 bg-blue-50/30 dark:bg-black/10">{dual.usd}</td>
                    <td className="p-6 align-middle text-right text-xs font-black text-blue-900/40 dark:text-slate-500/40 uppercase tracking-wide">{formatPrice(ref.stats.totalWithdrawn)}</td>
                    <td className="p-6 align-middle text-right">
                      <span className={`text-[13px] font-black px-4 py-1.5 rounded-xl border-2 transition-all ${ref.stats.balance > 0 ? 'text-emerald-600 bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/10' : 'text-blue-200 dark:text-white/10 border-blue-50 dark:border-white/5'}`}>
                        {formatPrice(ref.stats.balance)}
                      </span>
                    </td>
                    <td className="p-6 align-middle text-right">
                      {ref.stats.balance > 0 ? (
                        <button
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:scale-105"
                          onClick={() => { setSelectedUser(ref); setShowWithdrawModal(true); }}
                        >
                          Payout
                        </button>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-200 dark:text-white/10">No Balance</span>
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
      <Modal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title={`Payout — ${selectedUser?.name}`}>
        <form onSubmit={handleWithdraw} className="space-y-5">
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Earned</span>
              <span className="font-bold text-slate-900">{formatPrice(selectedUser?.stats.totalEarned || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Already Withdrawn</span>
              <span className="font-medium text-slate-600">{formatPrice(selectedUser?.stats.totalWithdrawn || 0)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
              <span className="text-slate-900 font-bold">{t('withdrawable')}</span>
              <span className="font-black text-emerald-600">{formatPrice(selectedUser?.stats.balance || 0)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{t('amount')} (ETB)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              max={selectedUser?.stats.balance || 0}
              className="input-field"
              placeholder={`Max: ${selectedUser?.stats.balance || 0} ETB`}
              required
            />
            {withdrawAmount && (
              <p className="text-xs text-slate-400 mt-1">≈ {formatDualPrice(withdrawAmount).usd}</p>
            )}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            {t('withdrawFunds')}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ReferralPanel;
