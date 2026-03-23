import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { formatDateTime } from '../../../core/utils/formatters';
import { HiMail, HiCheck, HiPhone, HiChatAlt2, HiEye, HiTrash, HiDownload } from 'react-icons/hi';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const MessagePanel = ({ notifications }) => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'messages', id), { read: true });
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteMessage = async (id) => {
    if(!window.confirm('Delete this message?')) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
      toast.success('Message deleted');
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const openMessage = (m) => {
    setSelectedMessage(m);
    if (!m.read) markAsRead(m.id);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(messages.map(m => ({
      SenderName: m.name || 'N/A',
      Email: m.email || 'N/A',
      Phone: m.phone || 'N/A',
      Subject: m.subject || 'N/A',
      Message: m.message || 'N/A',
      Date: m.createdAt ? formatDateTime(m.createdAt) : 'N/A',
      Read: m.read ? 'Yes' : 'No'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Messages");
    XLSX.writeFile(wb, "Contact_Messages_Export.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Contact & Messages</h3>
          <p className="text-sm font-bold text-slate-500 mt-1">Manage user contact form submissions</p>
        </div>
        <div className="flex gap-2">
           <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200">
             <HiDownload className="w-4 h-4" /> Export Excel
           </button>
        </div>
      </div>

      {notifications?.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><HiMail className="w-4 h-4"/></div>
          <p className="text-sm font-black text-blue-700">
            You have {notifications.length} unread notification system alert{notifications.length > 1 ? 's' : ''}!
          </p>
        </div>
      )}

      {/* Advanced Contact Table */}
      <div className="bg-[#0e1225] rounded-2xl border border-white/5 overflow-hidden shadow-xl shadow-indigo-500/10">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-[#1e2544]">
            <thead>
              <tr className="bg-[#0e1225]">
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-wider text-white border border-[#1e2544]">Sender Info</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-wider text-white border border-[#1e2544]">Contact (Email & Phone)</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-wider text-white border border-[#1e2544]">Subject</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-wider text-white border border-[#1e2544]">Date</th>
                <th className="text-right p-4 text-[11px] font-black uppercase tracking-wider text-white border border-[#1e2544]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(m => (
                <tr key={m.id} className={`transition-all group border border-[#1e2544] ${m.read ? 'bg-[#151a30] hover:bg-[#1e2544]' : 'bg-indigo-500/10 hover:bg-indigo-500/20'}`}>
                  <td className="p-4 align-top border border-[#1e2544]">
                     <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${m.read ? 'bg-transparent' : 'bg-indigo-400 animate-pulse'}`}></div>
                        <p className="text-sm font-black text-white">{m.name || 'Unknown'}</p>
                     </div>
                  </td>
                  <td className="p-4 align-top border border-[#1e2544]">
                     <div className="flex flex-col gap-1.5">
                       <a href={`mailto:${m.email}`} className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 truncate max-w-[150px]">{m.email}</a>
                       {m.phone ? (
                         <div className="flex items-center gap-2">
                           <span className="text-[11px] font-bold text-slate-400">{m.phone}</span>
                           <a href={`tel:${m.phone}`} className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Call User">
                             <HiPhone className="w-3.5 h-3.5" />
                           </a>
                           <a href={`sms:${m.phone}`} className="p-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="Send SMS">
                             <HiChatAlt2 className="w-3.5 h-3.5" />
                           </a>
                         </div>
                       ) : (
                         <span className="text-[11px] text-slate-500 font-medium ">No Phone Provided</span>
                       )}
                     </div>
                  </td>
                  <td className="p-4 align-top border border-[#1e2544]">
                     <p className={`text-sm ${m.read ? 'font-medium text-slate-400' : 'font-black text-white'} truncate max-w-[200px]`}>{m.subject || 'No Subject'}</p>
                  </td>
                  <td className="p-4 align-top text-[11px] font-bold text-slate-400 border border-[#1e2544]">
                     {m.createdAt ? formatDateTime(m.createdAt) : '—'}
                  </td>
                  <td className="p-4 align-top border border-[#1e2544]">
                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {!m.read && (
                        <button onClick={() => markAsRead(m.id)} className="p-2 rounded-lg text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 bg-[#0e1225]" title="Mark as Read">
                          <HiCheck className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => openMessage(m)} className="p-2 rounded-lg text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10 bg-[#0e1225]" title="View Full Message">
                        <HiEye className="w-5 h-5" />
                      </button>
                      <button onClick={() => deleteMessage(m.id)} className="p-2 rounded-lg text-red-400 border border-red-500/20 hover:bg-red-500/10 bg-[#0e1225]" title="Delete">
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {messages.length === 0 && <div className="text-center py-16 text-sm font-bold text-slate-400">No contact messages received yet</div>}
      </div>

      {/* Message Reader Modal */}
      <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)} title="Read Message" maxWidth="max-w-2xl">
        {selectedMessage && (
          <div className="space-y-6">
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
               <h2 className="text-2xl font-black text-slate-900 mb-4">{selectedMessage.subject || 'No Subject'}</h2>
               <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">From / Sender</p>
                    <p className="text-sm font-bold text-slate-800">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                    <a href={`mailto:${selectedMessage.email}`} className="text-sm font-bold text-blue-600 hover:text-blue-800">{selectedMessage.email}</a>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Phone Number</p>
                      <div className="flex items-center gap-2">
                        <a href={`tel:${selectedMessage.phone}`} className="text-sm font-bold text-slate-800 hover:text-emerald-600">{selectedMessage.phone}</a>
                        <a href={`tel:${selectedMessage.phone}`} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200" title="Call User"><HiPhone className="w-3.5 h-3.5"/></a>
                        <a href={`sms:${selectedMessage.phone}`} className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200" title="Send SMS"><HiChatAlt2 className="w-3.5 h-3.5"/></a>
                      </div>
                    </div>
                  )}
               </div>
             </div>
             
             <div className="space-y-3">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Body</p>
               <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-inner min-h-[150px]">
                 <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                   {selectedMessage.message}
                 </p>
               </div>
             </div>

             <div className="flex justify-between items-center text-xs font-bold text-slate-400 pt-4 border-t border-slate-100">
               <span>Sent on: {selectedMessage.createdAt ? formatDateTime(selectedMessage.createdAt) : 'Unknown Date'}</span>
               <button onClick={() => deleteMessage(selectedMessage.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                 <HiTrash className="w-4 h-4" /> Delete Message
               </button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MessagePanel;
