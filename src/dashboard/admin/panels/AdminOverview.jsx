import React, { useMemo, useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import {
  HiUserGroup, HiAcademicCap, HiBriefcase, HiNewspaper,
  HiCash, HiShoppingCart, HiShieldCheck, HiOutlineSearch,
  HiPencilAlt, HiTrash, HiCheckCircle, HiXCircle, HiChevronLeft, HiChevronRight,
  HiFilter, HiDownload, HiLink
} from 'react-icons/hi';
import { ROLES } from '../../../core/utils/constants';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
  return <span>{prefix}{value}{suffix}</span>;
}

const TABS = [
  { id: 'overview', label: 'Global Stats' },
  { id: 'users', label: 'User Hub' },
  { id: 'jobs', label: 'Jobs & Apps' },
  { id: 'finance', label: 'Transactions & Payouts' },
];

const AdminOverview = ({ users, courses, jobs, posts, applications, onSwitchPanel }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');

  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  // Fetch Live Data
  useEffect(() => {
    const qT = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    const unsubT = onSnapshot(qT, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qW = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
    const unsubW = onSnapshot(qW, (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubT(); unsubW(); };
  }, []);

  const stats = useMemo(() => {
    let income = 0, expenses = 0;
    transactions.forEach(tr => {
      const amt = Number(tr.amount) || 0;
      if (['deposit', 'course_payment', 'employer_payment', 'income', 'app_sale'].includes(tr.type)) income += amt;
      else expenses += amt;
    });

    let pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status !== 'banned').length,
      jobPosts: jobs.length,
      jobApps: applications.length,
      courses: courses.length,
      income,
      expenses,
      netProfit: income - expenses,
      pendingWithdrawals
    };
  }, [transactions, withdrawals, users, jobs, applications, courses]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0e1225] p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight px-4">Admin Console</h2>
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl overflow-x-auto w-full md:w-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab stats={stats} formatPrice={formatPrice} />}
          {activeTab === 'users' && <UsersTab users={users} />}
          {activeTab === 'jobs' && <JobsTab jobs={jobs} applications={applications} />}
          {activeTab === 'finance' && <FinanceTab transactions={transactions} withdrawals={withdrawals} formatPrice={formatPrice} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- SUB TABS --- //

const OverviewTab = ({ stats, formatPrice }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Total Users" value={stats.totalUsers} icon={HiUserGroup} color="from-blue-500 to-indigo-600" />
      <StatCard title="Active Users" value={stats.activeUsers} icon={HiCheckCircle} color="from-emerald-400 to-teal-500" />
      <StatCard title="Total Jobs" value={stats.jobPosts} icon={HiBriefcase} color="from-amber-400 to-orange-500" />
      <StatCard title="Total Apps" value={stats.jobApps} icon={HiNewspaper} color="from-purple-500 to-pink-600" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="Total Revenue" value={formatPrice(stats.income)} icon={HiCash} color="from-emerald-600 to-green-700" highlight />
      <StatCard title="Pending Withdrawals" value={formatPrice(stats.pendingWithdrawals)} icon={HiShieldCheck} color="from-rose-500 to-red-600" highlight />
      <StatCard title="Net Profit" value={formatPrice(stats.netProfit)} icon={HiShoppingCart} color="from-cyan-500 to-blue-600" highlight />
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, highlight }) => (
  <motion.div 
    whileHover={{ y: -4, scale: 1.02 }}
    className={`relative overflow-hidden p-6 rounded-[2rem] shadow-xl border border-white/10 flex flex-col justify-between ${highlight ? 'h-40' : 'h-32'} bg-gradient-to-br ${color} text-white`}
  >
    <div className="absolute top-0 right-0 p-4 opacity-20">
      <Icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
    </div>
    <div className="relative z-10 flex justify-between items-start">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="relative z-10">
      <h3 className={`font-black tracking-tighter ${highlight ? 'text-4xl' : 'text-3xl'}`}>{value}</h3>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 mt-1">{title}</p>
    </div>
  </motion.div>
);

// --- GENERIC DATA TABLE --- //
const DataTable = ({ columns, data, searchableKeys = ['name', 'email'] }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const filtered = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter(item => 
      searchableKeys.some(key => String(item[key] || '').toLowerCase().includes(lower))
    );
  }, [data, search, searchableKeys]);

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filtered.length / limit) || 1;

  return (
    <div className="bg-white dark:bg-[#0e1225] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="relative group w-full max-w-sm">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
          />
        </div>
        <div className="text-xs font-bold text-gray-500 bg-white dark:bg-black/20 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10">
          Showing {filtered.length} entries
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-white/[0.02]">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {paginated.map((row, rowIdx) => (
              <tr key={row.id || rowIdx} className="hover:bg-blue-50/50 dark:hover:bg-white/[0.02] transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(row) : <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{row[col.accessor]}</span>}
                  </td>
                ))}
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 text-sm font-bold">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
        <button 
          disabled={page === 1} onClick={() => setPage(p => p - 1)}
          className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 disabled:opacity-30 hover:bg-white dark:hover:bg-white/5 transition-colors"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Page {page} of {totalPages}</span>
        <button 
          disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
          className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 disabled:opacity-30 hover:bg-white dark:hover:bg-white/5 transition-colors"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// --- SPECIFIC TABS --- //

const UsersTab = ({ users }) => {
  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success('User role updated!');
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const toggleBanUser = async (user) => {
    try {
      const newStatus = user.status === 'banned' ? 'active' : 'banned';
      await updateDoc(doc(db, 'users', user.id), { status: newStatus });
      toast.success(`User ${newStatus} successfully!`);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const cols = [
    { header: 'Full Name', render: (u) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0">
          {u.name?.charAt(0) || '?'}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{u.name || 'Unknown User'}</p>
        </div>
      </div>
    )},
    { header: 'Contact', render: (u) => (
      <div>
        <p className="text-[11px] font-bold text-gray-800 dark:text-gray-300">{u.email}</p>
        {u.phone && <p className="text-[10px] text-gray-500">{u.phone}</p>}
      </div>
    )},
    { header: 'Role', render: (u) => (
      <select 
        value={u.role || 'student'} 
        onChange={(e) => updateUserRole(u.id, e.target.value)}
        className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 dark:text-blue-400 outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
      </select>
    )},
    { header: 'Followers', render: (u) => (
      <span className="text-xs font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">{u.followersCount || u.followers?.length || 0}</span>
    )},
    { header: 'Commission', render: (u) => (
      <div className="flex items-center gap-1">
        <input 
          type="number" 
          defaultValue={u.earnedCommissions || 0} 
          onBlur={async (e) => {
            if (Number(e.target.value) !== (u.earnedCommissions || 0)) {
              await updateDoc(doc(db, 'users', u.id), { earnedCommissions: Number(e.target.value) });
              toast.success('Commission Updated');
            }
          }}
          className="w-16 bg-transparent border-b border-gray-300 dark:border-gray-600 px-1 py-0.5 text-xs text-emerald-600 font-black outline-none focus:border-emerald-500 transition-colors text-right"
        />
        <span className="text-xs font-bold text-gray-500">Br</span>
      </div>
    )},
    { header: 'Status', render: (u) => (
      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${u.status === 'banned' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
        {u.status === 'banned' ? 'Banned' : 'Active'}
      </span>
    )},
    { header: 'Actions', render: (u) => (
      <div className="flex gap-2">
        <button onClick={() => toggleBanUser(u)} className={`p-1.5 rounded-lg border transition-colors ${u.status === 'banned' ? 'text-emerald-500 border-emerald-200 hover:bg-emerald-50' : 'text-rose-500 border-rose-200 hover:bg-rose-50'}`} title={u.status === 'banned' ? 'Unban User' : 'Ban User'}>
          {u.status === 'banned' ? <HiCheckCircle className="w-4 h-4" /> : <HiXCircle className="w-4 h-4" />}
        </button>
      </div>
    )},
  ];

  return <DataTable columns={cols} data={users} searchableKeys={['name', 'email', 'referralCode']} />;
};

const JobsTab = ({ jobs, applications }) => {
  const jobCols = [
    { header: 'Title', accessor: 'title', render: (j) => <span className="font-bold">{j.title}</span> },
    { header: 'Company', accessor: 'company' },
    { header: 'Type', accessor: 'type', render: (j) => <span className="text-[10px] uppercase font-black tracking-widest border border-gray-200 rounded px-2">{j.type}</span> },
    { header: 'Status', render: (j) => <span className={`text-[10px] uppercase font-black px-2 py-1 rounded ${j.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{j.status}</span>}
  ];

  const appCols = [
    { header: 'Applicant Name', accessor: 'applicantName', render: (a) => <span className="font-bold">{a.applicantName}</span> },
    { header: 'Job Post', accessor: 'jobTitle' },
    { header: 'Status', render: (a) => <span className="text-[10px] uppercase font-black tracking-widest text-cyan-500">{a.status}</span> },
    { header: 'Date', render: (a) => <span className="text-xs text-gray-500">{new Date(a.createdAt?.seconds * 1000).toLocaleDateString()}</span> }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3">Job Postings</h3>
        <DataTable columns={jobCols} data={jobs} searchableKeys={['title', 'company']} />
      </div>
      <div>
        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3">Recent Applications</h3>
        <DataTable columns={appCols} data={applications} searchableKeys={['applicantName', 'jobTitle']} />
      </div>
    </div>
  );
};

const FinanceTab = ({ transactions, withdrawals, formatPrice }) => {
  const transCols = [
    { header: 'Transaction ID', render: (t) => <span className="text-[10px] font-mono bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500">{t.id.slice(0, 8)}</span> },
    { header: 'User', accessor: 'userEmail' },
    { header: 'Type', render: (t) => <span className="text-[10px] uppercase font-black tracking-widest text-blue-500">{t.type}</span> },
    { header: 'Amount', render: (t) => <b className={['deposit', 'income'].includes(t.type) ? 'text-emerald-500' : 'text-rose-500'}>{formatPrice(t.amount)}</b> },
    { header: 'Date', render: (t) => <span className="text-xs text-gray-500">{t.createdAt?.seconds ? new Date(t.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span> }
  ];

  const wdrCols = [
    { header: 'User Info', render: (w) => (
      <div>
        <p className="font-bold text-sm">{w.accountName}</p>
        <p className="text-[10px] text-gray-500">{w.accountNumber} ({w.bankName})</p>
      </div>
    )},
    { header: 'Amount', render: (w) => <b className="text-amber-500">{formatPrice(w.amount)}</b> },
    { header: 'Status', render: (w) => <span className={`text-[10px] uppercase font-black px-2 py-1 rounded ${w.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{w.status}</span>},
    { header: 'Date', render: (w) => <span className="text-xs text-gray-500">{w.createdAt?.seconds ? new Date(w.createdAt.seconds * 1000).toLocaleDateString() : '-'}</span> }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3">Withdrawal Requests</h3>
        <DataTable columns={wdrCols} data={withdrawals} searchableKeys={['accountName', 'accountNumber']} />
      </div>
      <div>
        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3">Global Transactions</h3>
        <DataTable columns={transCols} data={transactions} searchableKeys={['userEmail', 'type', 'id']} />
      </div>
    </div>
  );
};

export default AdminOverview;
