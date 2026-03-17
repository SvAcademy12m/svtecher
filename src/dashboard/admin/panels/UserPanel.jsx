import React, { useState } from 'react';
import { HiSearch, HiPencil, HiTrash, HiBan, HiCheck, HiDownload, HiMail, HiPhone, HiChatAlt } from 'react-icons/hi';
import { userService } from '../../../core/services/firestoreService';
import { ROLE_LABELS, ROLES } from '../../../core/utils/constants';
import { useDebounce } from '../../../hooks';
import { useLanguage } from '../../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UserPanel = ({ users, filterRole = null, title = null }) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  // Filter by role if provided
  const roleFiltered = filterRole ? users.filter(u => u.role === filterRole) : users;
  const filtered = roleFiltered.filter(u =>
    (u.name || u.email || '').toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const toggleBlock = async (user) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await userService.update(user.id, { status: newStatus });
      toast.success(`User ${newStatus === 'suspended' ? 'blocked' : 'unblocked'}`);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.delete(id);
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      await userService.update(userId, { role: newRole });
      toast.success('Role updated');
      setSelectedUser(null);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const roleBadgeVariant = (role) => {
    const map = { admin: 'danger', student: 'primary', trainer: 'info', jobFinder: 'warning', customer: 'success' };
    return map[role] || 'default';
  };

  const pageTitle = title || t('users');
  const totalLabel = filterRole ? ROLE_LABELS[filterRole] || filterRole : 'Users';

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Phone: u.phone || 'N/A',
      Role: ROLE_LABELS[u.role] || u.role,
      Status: u.status || 'active',
      Joined: u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `${pageTitle.replace(/ /g, '_')}_Export.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`${pageTitle} Report`, 14, 15);
    doc.autoTable({
      head: [['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined Date']],
      body: filtered.map(u => [
        u.name || 'Unnamed',
        u.email,
        u.phone || 'N/A',
        ROLE_LABELS[u.role] || u.role,
        u.status || 'active',
        u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
      ]),
      startY: 20,
    });
    doc.save(`${pageTitle.replace(/ /g, '_')}_Export.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-blue-900 dark:text-white tracking-tight">{pageTitle}</h3>
          <p className="text-sm font-black text-blue-600/50 dark:text-indigo-400/50 uppercase tracking-widest mt-1">{roleFiltered.length} Total {totalLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToPDF} className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 shadow-lg shadow-rose-500/10 group">
            <HiDownload className="w-4 h-4 group-hover:bounce" /> Export PDF
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/10 group">
            <HiDownload className="w-4 h-4 group-hover:bounce" /> Export Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {!filterRole && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(ROLES).filter(([, v]) => v !== 'admin').map(([key, val]) => {
            const count = users.filter(u => u.role === val).length;
            const colors = {
              student: 'from-blue-500 to-indigo-500', 
              trainer: 'from-purple-500 to-pink-500',
              jobFinder: 'from-amber-500 to-orange-500', 
              customer: 'from-emerald-500 to-teal-500',
              seller: 'from-cyan-500 to-blue-500',
            };
            return (
              <div key={val} className={`bg-gradient-to-br ${colors[val] || 'from-slate-500 to-slate-600'} rounded-2xl p-4 text-white shadow-lg`}>
                <p className="text-2xl font-black">{count}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 mt-0.5">{ROLE_LABELS[val]}</p>
              </div>
            );
          })}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-lg">
            <p className="text-2xl font-black">{users.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 mt-0.5">Total</p>
          </div>
        </div>
      )}

      {/* Search */}
      {/* Search */}
      <div className="relative max-w-xl group">
        <HiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`${t('search')} ${totalLabel.toLowerCase()}...`}
          className="w-full pl-14 pr-6 py-4 rounded-3xl bg-white dark:bg-[#151a30] border-2 border-blue-50 dark:border-white/5 text-blue-900 dark:text-white font-black placeholder:text-blue-200 dark:placeholder:text-white/10 focus:border-blue-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-xl shadow-blue-900/5"
        />
      </div>

      {/* Table - Enhanced Excel Style */}
      <div className="bg-white dark:bg-[#151a30] rounded-[2.5rem] border border-blue-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-blue-900/10 transition-all">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900 dark:bg-[#0e1225]">
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Member Identity</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Access Credentials</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">System Role</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Account Status</th>
                <th className="text-left p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Registry Date</th>
                <th className="text-right p-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b border-white/10">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-white/5">
              {filtered.map(user => (
                <tr key={user.id} className="transition-all group hover:bg-blue-50/50 dark:hover:bg-white/[0.02]">
                  <td className="p-6 align-middle">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                        <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#151a30] flex items-center justify-center text-blue-600 dark:text-white text-sm font-black uppercase">
                          {user.name?.[0] || '?'}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-black text-blue-900 dark:text-white tracking-tight leading-none">{user.name || 'Anonymous User'}</p>
                        <p className="text-[10px] font-black text-blue-600/40 dark:text-indigo-400/40 uppercase tracking-widest mt-1.5">Verified Profile</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 align-middle">
                    <div className="space-y-1.5">
                      <p className="text-[12px] font-black text-blue-800 dark:text-slate-300 tracking-tight" title={user.email}>{user.email}</p>
                      {user.phone ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-blue-600/50 dark:text-indigo-400/50 uppercase">{user.phone}</span>
                          <div className="flex gap-1">
                            <a href={`tel:${user.phone}`} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Direct CALL">
                              <HiPhone className="w-3.5 h-3.5" />
                            </a>
                            <a href={`sms:${user.phone}`} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Direct SMS">
                              <HiChatAlt className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-blue-200 dark:text-white/10 font-black uppercase tracking-widest italic">No Linkable Phone</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 align-middle">
                    <button onClick={() => setSelectedUser(user)} className="cursor-pointer group flex items-center gap-2">
                      <Badge variant={roleBadgeVariant(user.role)} className="!px-4 !py-1.5 text-[10px] uppercase font-black tracking-[0.15em] shadow-lg">{ROLE_LABELS[user.role] || user.role}</Badge>
                      <HiPencil className="w-3.5 h-3.5 text-blue-200 dark:text-white/10 group-hover:text-blue-600 transition-colors" />
                    </button>
                  </td>
                  <td className="p-6 align-middle">
                    <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-full px-4 py-1.5 border-2 ${
                      user.status === 'suspended' ? 'text-rose-600 bg-rose-500/5 border-rose-500/10' : 'text-emerald-600 bg-emerald-500/5 border-emerald-500/10'
                    }`}>
                      <span className={`w-2 h-2 rounded-full animate-pulse capitalize ${user.status === 'suspended' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      {user.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-6 align-middle">
                    <div className="bg-blue-50/50 dark:bg-black/20 rounded-2xl p-3 border border-blue-100/50 dark:border-white/5 inline-block">
                       <p className="text-[13px] font-black text-blue-900 dark:text-indigo-200 tracking-tight">{user.createdAt ? new Date(user.createdAt?.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
                       <p className="text-[9px] font-black text-blue-400 dark:text-indigo-400/40 uppercase tracking-widest mt-0.5">Registration</p>
                    </div>
                  </td>
                  <td className="p-6 align-middle">
                    <div className="flex items-center justify-end gap-2">
                       <div className="flex bg-white dark:bg-white/5 border border-blue-50 dark:border-white/10 rounded-2xl p-1 shadow-xl">
                          <button
                            onClick={() => toggleBlock(user)}
                            className={`p-3 rounded-xl transition-all ${
                              user.status === 'suspended' ? 'text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'text-amber-500 hover:bg-amber-500 hover:text-white'
                            }`}
                            title={user.status === 'suspended' ? 'Security CLEARED' : 'RESTRICT Access'}
                          >
                            {user.status === 'suspended' ? <HiCheck className="w-5 h-5" /> : <HiBan className="w-5 h-5" />}
                          </button>
                          <button onClick={() => deleteUser(user.id)} className="p-3 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all" title="WIPE Data">
                            <HiTrash className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-24 text-sm font-black text-blue-200 dark:text-white/10 uppercase tracking-[0.3em]">No Match Found in Registry</div>}
      </div>

      {/* Edit Role Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Edit — ${selectedUser?.name}`}>
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {selectedUser.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-bold text-slate-900">{selectedUser.name}</p>
                <p className="text-xs text-slate-400">{selectedUser.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Change Role</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROLES).map(([key, val]) => (
                  <button
                    key={val}
                    onClick={() => updateRole(selectedUser.id, val)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedUser.role === val
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-100 hover:border-slate-200 text-slate-600'
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
    </div>
  );
};

export default UserPanel;
