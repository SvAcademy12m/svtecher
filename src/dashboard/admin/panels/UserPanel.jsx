import React, { useState, useMemo } from 'react';
import { 
  HiSearch, HiPencil, HiTrash, HiBan, HiCheck, HiDownload, HiMail, HiPhone, 
  HiChatAlt, HiChatAlt2, HiFingerPrint, HiShieldCheck, HiStatusOnline, HiIdentification, HiUsers, HiPlus, HiPrinter, HiArrowCircleRight, HiCurrencyDollar
} from 'react-icons/hi';
import { userService } from '../../../core/services/firestoreService';
import { db } from '../../../core/firebase/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { ROLE_LABELS, ROLES } from '../../../core/utils/constants';
import { useDebounce } from '../../../hooks';
import { useLanguage } from '../../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UserPanel = ({ users, filterRole = null, title = null, onSwitchPanel }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', address: '', role: 'student', password: '' });
  const [editForm, setEditForm] = useState({ commissionBalance: 0, walletBalance: 0, earnings: 0 });
  const [identityForm, setIdentityForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const debouncedSearch = useDebounce(search, 300);

  const roleFiltered = filterRole ? users.filter(u => u.role === filterRole) : users;
  const filtered = roleFiltered.filter(u =>
    (u.name || u.email || '').toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleStatusChange = async (user, status) => {
    try {
      await userService.update(user.id, { status });
      toast.success(`User status ${status === 'active' ? 'authorized' : 'restricted'}`);
    } catch {
      toast.error('Identity update failed');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently from the database?')) return;
    try {
      await userService.delete(id);
      toast.success('User deleted successfully.');
    } catch {
      toast.error('Deletion failed');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email) {
      toast.error("Name and Email are required!"); return;
    }
    setIsAdding(true);
    try {
      // NOTE: Using direct addDoc to users collection
      await addDoc(collection(db, 'users'), { 
        name: addForm.name, email: addForm.email, phone: addForm.phone, 
        address: addForm.address, role: addForm.role, status: 'active',
        password: addForm.password || 'Temporary123',
        createdAt: new Date(), isVerified: false
      });
      toast.success('User registered explicitly to database!');
      setShowAddModal(false);
      setAddForm({ name: '', email: '', phone: '', address: '', role: 'student', password: '' });
    } catch (err) {
      toast.error('Failed to add user manually: ' + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleVerification = async (user) => {
    try {
      await userService.update(user.id, { isVerified: !user.isVerified });
      toast.success(user.isVerified ? 'Verification Revoked' : 'Identity Verified');
    } catch {
      toast.error('Verification toggle failed');
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      await userService.update(userId, { role: newRole });
      toast.success('User role updated');
      setSelectedUser(null);
    } catch {
      toast.error('Role update failed');
    }
  };

  const updateBalances = async (e) => {
    e.preventDefault();
    try {
      await userService.update(selectedUser.id, {
        commissionBalance: Number(editForm.commissionBalance),
        walletBalance: Number(editForm.walletBalance),
        earnings: Number(editForm.earnings)
      });
      toast.success('Financial parameters updated');
      setShowEditModal(false);
    } catch {
      toast.error('Financial sync failed');
    }
  };

  const updateIdentity = async (e) => {
    e.preventDefault();
    try {
      await userService.update(selectedUser.id, {
        name: identityForm.name,
        email: identityForm.email,
        phone: identityForm.phone,
        address: identityForm.address
      });
      toast.success('Identity node updated successfully');
      setShowIdentityModal(false);
    } catch {
      toast.error('Identity update failed');
    }
  };

  const roleBadgeVariant = (role) => {
    const map = { admin: 'danger', student: 'primary', trainer: 'info', jobFinder: 'warning', customer: 'success' };
    return map[role] || 'default';
  };

  const sortedUsers = useMemo(() => {
    const rolePriority = { admin: 0, trainer: 1, jobFinder: 2, student: 3, customer: 4, seller: 5, support: 6 };
    return [...filtered].sort((a, b) => (rolePriority[a.role] ?? 99) - (rolePriority[b.role] ?? 99));
  }, [filtered]);

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedUsers.map(u => u.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} users?`)) return;
    try {
      await Promise.all(selectedIds.map(id => userService.delete(id)));
      toast.success(`Successfully purged ${selectedIds.length} users`);
      setSelectedIds([]);
    } catch {
      toast.error('Bulk deletion failed');
    }
  };

  const exportData = (type) => {
    if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet(sortedUsers.map(u => ({
        'Full Name': u.name || 'Anonymous User',
        'Role': ROLE_LABELS[u.role] || u.role || 'N/A',
        'Ref Code': u.referralCode || 'N/A',
        'Referral': u.referralsCount ?? u.referrals?.length ?? 0,
        'Follower': u.followersCount ?? u.followers?.length ?? 0,
        'Wallet Balance': u.walletBalance || 0,
        'Commission Balance': u.commissionBalance || 0,
        'Contact (Email/Phone)': `${u.email || 'N/A'} / ${u.phone || 'N/A'}`,
        'Node ID': u.id || 'N/A',
        'Payment': u.isVerified ? 'APPROVED' : 'PENDING',
        'Withdrawal Size': u.withdrawalsCount ?? 0,
        'Joint Date': u.createdAt ? (u.createdAt.toDate ? u.createdAt.toDate().toLocaleDateString() : new Date(u.createdAt.seconds * 1000).toLocaleDateString()) : 'N/A',
        'Status': u.status?.toUpperCase() || 'ACTIVE'
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Identity Nodes");
      XLSX.writeFile(wb, `SVTECH_IDENTITY_MATRIX.xlsx`);
    } else {
      const doc = new jsPDF();
      doc.text("SVTECH GLOBAL IDENTITY MATRIX", 14, 15);
      doc.autoTable({
        head: [['Full Name', 'Role', 'Contact', 'Refs', 'Followers', 'Following', 'Courses']],
        body: sortedUsers.map(u => [
          u.name || 'Anonymous',
          ROLE_LABELS[u.role]?.toUpperCase() || u.role?.toUpperCase() || 'N/A',
          `${u.email}\n${u.phone || ''}`,
          u.referralsCount ?? u.referrals?.length ?? 0,
          u.followersCount ?? u.followers?.length ?? 0,
          u.followingCount ?? u.following?.length ?? 0,
          u.enrolledCourses?.length ?? u.coursesCount ?? 0
        ]),
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] }
      });
      doc.save("SVTECH_IDENTITY_MATRIX.pdf");
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h3 className="text-4xl font-black text-blue-900 dark:text-white tracking-tighter uppercase  underline decoration-blue-600 decoration-4 underline-offset-8 text-shadow-sm">Identity Matrix</h3>
          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-3">{roleFiltered.length} Active Identity Nodes In Network</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-blue-500/30 transition-all active:scale-95">
             <HiPlus className="w-5 h-5" /> Deploy User
          </button>
          <button onClick={() => window.print()} className="p-4 bg-white dark:bg-white/5 text-slate-600 dark:text-blue-300 rounded-2xl border-2 border-slate-900 dark:border-white/20 hover:bg-slate-200 transition-all shadow-xl group" title="Print Data Report">
             <HiPrinter className="w-5 h-5 group-hover:scale-110" />
          </button>
          <button onClick={() => exportData('pdf')} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border-2 border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5 group" title="Export PDF">
             <HiDownload className="w-5 h-5 group-hover:bounce" />
          </button>
          <button onClick={() => exportData('excel')} className="flex items-center gap-2 p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border-2 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/5 font-black uppercase tracking-widest text-[11px]" title="Export Excel Data Matrix">
             Excel Pro <HiDownload className="w-4 h-4" />
          </button>
          
          {/* Excel Import Feature */}
          <div className="relative">
             <input 
               type="file" 
               id="excel-import" 
               className="hidden" 
               accept=".xlsx, .xls, .csv" 
               onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (evt) => {
                     try {
                        const bstr = evt.target.result;
                        const wb = XLSX.read(bstr, { type: 'binary' });
                        const wsname = wb.SheetNames[0];
                        const ws = wb.Sheets[wsname];
                        const data = XLSX.utils.sheet_to_json(ws);
                        
                        if (data.length === 0) { toast.error('Empty file'); return; }
                        
                        toast.info(`Initializing Import Protocol for ${data.length} nodes...`);
                        let successCount = 0;
                        for (const row of data) {
                           // Mapping Excel headers to Firestore fields
                           const userObj = {
                               name: row['Full Name'] || row['Name'] || 'New User',
                               email: row['Contact (Email/Phone)']?.split('/')?.[0]?.trim() || row['Email Address'] || row['Email'] || '',
                               phone: row['Contact (Email/Phone)']?.split('/')?.[1]?.trim() || row['Phone Number'] || row['Phone'] || '',
                               role: (row['Role'] || 'student').toLowerCase(),
                               status: row['Status']?.toLowerCase() || 'active',
                               createdAt: new Date(),
                               isVerified: row['Payment']?.toLowerCase() === 'approved' || row['Pay Approved']?.toLowerCase() === 'yes',
                               referralsCount: Number(row['Referral'] || row['Referrals'] || 0),
                               followersCount: Number(row['Follower'] || row['Followers'] || 0),
                               walletBalance: Number(row['Commission Walt'] || 0),
                               commissionBalance: Number(row['Registered Commission'] || row['Commissions'] || 0),
                               withdrawalsCount: Number(row['Withdrawal Size'] || row['Withdrawals'] || 0),
                               earnings: Number(row['Earnings'] || 0)
                           };
                           
                           if (userObj.email) {
                              await addDoc(collection(db, 'users'), userObj);
                              successCount++;
                           }
                        }
                        toast.success(`Matrix Sync Complete: ${successCount} identity nodes imported.`);
                     } catch (err) {
                        toast.error('Import Failed: ' + err.message);
                     }
                  };
                  reader.readAsBinaryString(file);
               }}
             />
             <label htmlFor="excel-import" className="flex items-center gap-2 p-4 bg-blue-500/10 text-blue-500 rounded-2xl border-2 border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-500/5 font-black uppercase tracking-widest text-[11px] cursor-pointer" title="Import Data from Excel">
                Import Matrix <HiPlus className="w-4 h-4" />
             </label>
          </div>
        </div>
      </div>

      {!filterRole && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Object.entries(ROLES).filter(([, v]) => v !== 'admin').map(([key, val], idx) => {
            const count = users.filter(u => u.role === val).length;
            const gradients = [
              'from-blue-600 to-indigo-700', 
              'from-purple-600 to-pink-600',
              'from-amber-500 to-orange-600', 
              'from-emerald-500 to-teal-600',
              'from-cyan-500 to-blue-600',
              'from-slate-700 to-slate-900'
            ];
            return (
              <div key={val} className={`bg-gradient-to-br ${gradients[idx % gradients.length]} rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform border-4 border-black dark:border-white/10`}>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors" />
                <p className="text-3xl font-black tracking-tighter leading-none mb-1 tabular-nums">{count}</p>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70 ">{ROLE_LABELS[val]}</p>
              </div>
            );
          })}
          <div className="bg-[#0e1225] text-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden border-[3px] border-blue-600 shadow-blue-900/40 group">
             <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
             <p className="text-3xl font-black tracking-tighter leading-none text-cyan-400 mb-1 tabular-nums relative z-10">{users.length}</p>
             <p className="text-[9px] font-black uppercase tracking-widest text-white relative z-10 ">Global Sum</p>
          </div>
        </div>
      )}

      <div className="relative group max-w-2xl">
        <HiSearch className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="SEARCH IDENTITY NODES..."
          className="w-full pl-20 pr-8 py-6 rounded-[2.5rem] bg-white dark:bg-[#0e1225] border-[3px] border-black dark:border-white/10 text-slate-900 dark:text-white font-black placeholder:text-slate-300 focus:border-blue-600 transition-all outline-none shadow-2xl shadow-blue-900/5"
        />
      </div>

      <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Enterprise Header Section */}
      <div className="bg-white dark:bg-[#0e1225] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Identity Management</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{roleFiltered.length} Total Devices/Users Found</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95">
               <HiPlus className="w-4 h-4" /> Deploy User
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2" />
            <button onClick={() => exportData('excel')} className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-blue-300 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition-all shadow-sm" title="Export Excel">
               <HiDownload className="w-5 h-5" />
            </button>
            <button onClick={() => exportData('pdf')} className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-blue-300 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition-all shadow-sm" title="Export PDF">
               <HiDownload className="w-5 h-5 transform rotate-180" />
            </button>
          </div>
        </div>

        {/* Action Bar (Cisco Nexus Style) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-slate-100 dark:border-white/5">
           <div className="w-full sm:w-auto flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <HiSearch className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter by attributes..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 dark:text-white placeholder-slate-400 w-full sm:w-64"
              />
           </div>
           
           <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">{selectedIds.length} Selected</span>
              <button 
                disabled={!selectedIds.length}
                onClick={bulkDelete}
                className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-white/5 text-rose-600 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 disabled:opacity-30 transition-all"
              >
                Delete Selected
              </button>
              <div className="relative group/actions">
                 <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Actions</button>
              </div>
           </div>
        </div>
      </div>

      {/* Enterprise Table Container */}
      <div className="bg-white dark:bg-[#0e1225] rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 text-slate-600 border-b border-slate-200 dark:border-white/10">
                <th className="w-12 px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === sortedUsers.length && sortedUsers.length > 0} 
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Device Name / User</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Network Role</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Active Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Referrals</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Ref Code</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Commission Wallet</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No active nodes found in this sector</td>
                </tr>
              ) : (
                sortedUsers.map(user => (
                  <tr key={user.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-200 ${selectedIds.includes(user.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm ${roleBadgeVariant(user.role) === 'danger' ? 'bg-rose-500' : 'bg-blue-600'}`}>
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p onClick={() => { setSelectedUser(user); setShowIdentityModal(true); }} className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer transition-colors leading-none truncate max-w-[150px]">{user.name || 'Anonymous'}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 truncate max-w-[150px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         user.role === 'admin' ? 'bg-rose-50 border-rose-200 text-rose-600' : 
                         user.role === 'trainer' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' :
                         'bg-slate-50 border-slate-200 text-slate-600'
                       }`}>
                         {ROLE_LABELS[user.role] || user.role}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${user.status === 'active' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}`}>{user.status || 'Active'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-white/10 px-3 py-1 rounded-lg border border-slate-200">
                          <HiUsers className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-black text-slate-700 dark:text-blue-300">{user.referralsCount ?? 0}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded font-mono">{user.referralCode || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex flex-col items-center">
                          <p className="text-sm font-black text-emerald-600">{user.walletBalance || 0} Br</p>
                          <p className="text-[9px] font-bold text-slate-400">Total Yield</p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { setSelectedUser(user); setShowIdentityModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Edit Identity"><HiPencil className="w-5 h-5" /></button>
                          <button onClick={() => { setSelectedUser(user); setShowEditModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Edit Balances"><HiCurrencyDollar className="w-5 h-5" /></button>
                          <button onClick={() => toggleVerification(user)} className={`p-2 transition-colors ${user.isVerified ? 'text-blue-600' : 'text-slate-300'}`} title="Verify"><HiShieldCheck className="w-5 h-5" /></button>
                          <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Purge"><HiTrash className="w-5 h-5" /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Identity Edit Modal */}
      <Modal isOpen={showIdentityModal} onClose={() => setShowIdentityModal(false)} title="Identity Registry Editor">
         <form onSubmit={updateIdentity} className="p-10 space-y-6">
            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Full Identity Name</label>
                  <input required value={identityForm.name} onChange={e => setIdentityForm({...identityForm, name: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Email Protocol</label>
                  <input required type="email" value={identityForm.email} onChange={e => setIdentityForm({...identityForm, email: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Comms Phone</label>
                  <input value={identityForm.phone} onChange={e => setIdentityForm({...identityForm, phone: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Physical Address Node</label>
                  <input value={identityForm.address} onChange={e => setIdentityForm({...identityForm, address: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500" />
               </div>
            </div>
            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-black transition-all">Update Identity Archive</button>
         </form>
      </Modal>

      {/* Financial Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Financial Matrix Override">
         <form onSubmit={updateBalances} className="p-10 space-y-6 bg-white dark:bg-[#0e1225]">
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Commission Balance (ETB)</label>
                  <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-black text-blue-600" value={editForm.commissionBalance} onChange={e => setEditForm({...editForm, commissionBalance: e.target.value})} />
               </div>
               <div>
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Wallet Balance (ETB)</label>
                  <input type="number" step="0.01" className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-xl font-black text-emerald-600" value={editForm.walletBalance} onChange={e => setEditForm({...editForm, walletBalance: e.target.value})} />
               </div>
               <div>
                  <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Total Earnings (ETB)</label>
                  <input type="number" step="0.01" className="w-full bg-purple-50 border border-purple-100 p-4 rounded-xl font-black text-purple-600" value={editForm.earnings} onChange={e => setEditForm({...editForm, earnings: e.target.value})} />
               </div>
            </div>
            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl">Sync Financial Node</button>
         </form>
      </Modal>

      {/* Role Config Modal */}
      <Modal isOpen={!!selectedUser && !showEditModal} onClose={() => setSelectedUser(null)} title="Identity Role Override" maxWidth="max-w-3xl">
        {selectedUser && (
          <div className="p-10 space-y-8 bg-white dark:bg-[#0e1225]">
             <div className="p-10 rounded-[3rem] bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 text-white shadow-2xl text-center relative overflow-hidden">
                <div className="relative z-10">
                   <div className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-xl mx-auto mb-6 flex items-center justify-center text-4xl font-black border border-white/30 shadow-2xl">
                      {selectedUser.name?.[0]}
                   </div>
                   <h4 className="text-4xl font-black uppercase tracking-tighter mb-2  ">{selectedUser.name}</h4>
                   <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{selectedUser.email}</p>
                </div>
             </div>
             
             <div>
               <label className="text-[11px] font-black uppercase text-blue-600 tracking-[0.3em] mb-6 block text-center ">Authorization Matrix Level</label>
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                 {Object.entries(ROLES).map(([key, val]) => (
                   <button
                     key={val}
                     onClick={() => updateRole(selectedUser.id, val)}
                     className={`p-6 rounded-[2rem] border-4 text-[10px] font-black uppercase tracking-widest transition-all  ${
                       selectedUser.role === val
                         ? 'border-blue-600 bg-blue-600 text-white shadow-2xl shadow-blue-500/30'
                         : 'border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:border-blue-200'
                     }`}
                   >
                     {ROLE_LABELS[val]}
                   </button>
                 ))}
               </div>
             </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register New Database User" maxWidth="max-w-2xl">
        <form onSubmit={handleAddUser} className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Full Name</label>
                <input required value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500" placeholder="John Doe" />
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Email Address</label>
                <input required type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500" placeholder="user@domain.com" />
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Phone</label>
                <input value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500" placeholder="+251..." />
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Address Location</label>
                <input value={addForm.address} onChange={e => setAddForm({...addForm, address: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500" placeholder="City, State" />
             </div>
              <div className="col-span-1">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Initial Role Authorization</label>
                 <select value={addForm.role} onChange={e => setAddForm({...addForm, role: e.target.value})} className="w-full bg-white dark:bg-black border-[3px] border-black dark:border-white/20 p-4 rounded-xl font-bold text-sm outline-none focus:border-blue-500">
                   {Object.entries(ROLES).map(([k, v]) => <option key={v} value={v}>{ROLE_LABELS[v]}</option>)}
                 </select>
              </div>
              <div className="col-span-1">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Initial Password</label>
                 <div className="flex bg-white dark:bg-black border-[3px] border-black dark:border-white/20 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                   <input type="text" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} className="w-full p-4 font-bold text-sm outline-none bg-transparent" placeholder="Temporary123" />
                   <button type="button" onClick={() => { navigator.clipboard.writeText(addForm.password || 'Temporary123'); toast.info('Password copied!'); }} className="px-5 bg-gray-100 dark:bg-white/5 hover:bg-blue-100 hover:text-blue-600 font-bold text-xs transition-colors">Copy</button>
                 </div>
              </div>
           </div>
           <button disabled={isAdding} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700">
              {isAdding ? 'Registering...' : 'Force Register User'}
           </button>
        </form>
      </Modal>
    </div>
  );
};

export default UserPanel;
