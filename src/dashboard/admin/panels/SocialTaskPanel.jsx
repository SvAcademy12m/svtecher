import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { FaTiktok, FaTelegram, FaFacebook, FaYoutube, FaInstagram } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import * as XLSX from 'xlsx';
import { HiDownload, HiPlus, HiTrendingUp, HiLightningBolt, HiExternalLink, HiCheckCircle, HiTrash, HiPencil } from 'react-icons/hi';
import { formatDateTime } from '../../../core/utils/formatters';

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', icon: FaTiktok },
  { id: 'telegram', label: 'Telegram', icon: FaTelegram },
  { id: 'facebook', label: 'Facebook', icon: FaFacebook },
  { id: 'youtube', label: 'YouTube', icon: FaYoutube },
  { id: 'instagram', label: 'Instagram', icon: FaInstagram }
];

const SocialTaskPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    platform: 'tiktok',
    reward: 5,
    link: '',
    status: 'active',
    targetCount: 1000
  });

  useEffect(() => {
    const q = query(collection(db, 'social_tasks'), orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qv = query(collection(db, 'user_social_tasks'), orderBy('createdAt', 'desc'));
    const unsubVerifications = onSnapshot(qv, (snap) => {
      setPendingVerifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubTasks(); unsubVerifications(); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await updateDoc(doc(db, 'social_tasks', editId), { ...form, reward: Number(form.reward), targetCount: Number(form.targetCount) });
        toast.success("Task node updated");
      } else {
        await addDoc(collection(db, 'social_tasks'), {
          ...form,
          reward: Number(form.reward),
          targetCount: Number(form.targetCount),
          createdAt: serverTimestamp()
        });
        toast.success("New social task deployed");
      }
      setShowForm(false);
      setEditId(null);
      setForm({ title: '', platform: 'tiktok', reward: 5, link: '', status: 'active', targetCount: 1000 });
    } catch (err) {
      toast.error("Failed to sync task");
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (v) => {
    try {
      await updateDoc(doc(db, 'user_social_tasks', v.id), { status: 'verified', verifiedAt: serverTimestamp() });
      toast.success("Reward authorized");
    } catch {
      toast.error("Authorization failed");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Purge social task from matrix?")) return;
    try {
      await deleteDoc(doc(db, 'social_tasks', id));
      toast.success("Task purged");
    } catch {
      toast.error("Purge operation failed");
    }
  };

  const approvePromotion = async (task) => {
    const rewardInput = document.getElementById(`reward-${task.id}`)?.value;
    const reward = Number(rewardInput) || 5;
    try {
      await updateDoc(doc(db, 'social_tasks', task.id), { 
         status: 'active', 
         reward,
         updatedAt: serverTimestamp() 
      });
      toast.success("User promotion authorized and broadcasted");
    } catch {
      toast.error("Authorization failed");
    }
  };

  const activeTasks = tasks.filter(t => t.status === 'active');
  const pendingPromotions = tasks.filter(t => t.status === 'pending');
  const verifiedTasks = pendingVerifications.filter(v => v.status === 'verified');
  const openQueue = pendingVerifications.filter(v => v.status === 'pending_verification');

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h3 className="text-4xl font-black text-blue-900 dark:text-white tracking-tighter uppercase underline decoration-blue-600 decoration-4 underline-offset-8">Social Earning Matrix</h3>
          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-3">Daily Task Distribution Console</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setShowForm(true); setEditId(null); setForm({ title: '', platform: 'tiktok', reward: 5, link: '', status: 'active', targetCount: 1000 }); }} 
            className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-[2rem] shadow-2xl shadow-blue-900/40 hover:-translate-y-1 transition-all font-black tracking-widest text-[11px] uppercase "
          >
            <HiPlus className="w-6 h-6"/> Broadcast New Task
          </button>

          <button 
            onClick={() => {
              const ws = XLSX.utils.json_to_sheet(tasks);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "SocialTasks");
              XLSX.writeFile(wb, "SVTech_Social_Tasks.xlsx");
            }} 
            className="flex items-center gap-2 p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border-2 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-xl font-black uppercase tracking-widest text-[10px]"
          >
            Export <HiDownload className="w-4 h-4" />
          </button>

          <label className="flex items-center gap-2 p-4 bg-blue-500/10 text-blue-500 rounded-2xl border-2 border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all shadow-xl font-black uppercase tracking-widest text-[10px] cursor-pointer">
            Import <HiPlus className="w-4 h-4" />
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx,.xls" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (evt) => {
                  const bstr = evt.target.result;
                  const wb = XLSX.read(bstr, { type: 'binary' });
                  const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                  let count = 0;
                  for (const row of data) {
                    await addDoc(collection(db, 'social_tasks'), {
                      title: row.Title || row.title || 'New Task',
                      platform: (row.Platform || row.platform || 'tiktok').toLowerCase(),
                      reward: Number(row.Reward || row.reward || 5),
                      link: row.Link || row.link || '',
                      status: 'active',
                      targetCount: Number(row.Target || row.targetCount || 1000),
                      createdAt: serverTimestamp()
                    });
                    count++;
                  }
                  toast.success(`${count} tasks imported`);
                };
                reader.readAsBinaryString(file);
              }} 
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           <div className="space-y-4">
              <h4 className="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                 <HiTrendingUp className="w-6 h-6 text-blue-600" /> Active Broadcasts Matrix
              </h4>
              <div className="bg-white dark:bg-[#0e1225] border-[3px] border-black dark:border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                 <div className="overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar">
                    <table className="w-full border-collapse min-w-[700px]">
                       <thead className="sticky top-0 bg-black text-white z-10">
                          <tr>
                             <th className="p-4 border-r-[3px] border-b-4 border-black text-left text-[10px] font-black uppercase tracking-widest">Node</th>
                             <th className="p-4 border-r-[3px] border-b-4 border-black text-left text-[10px] font-black uppercase tracking-widest">Identifier</th>
                             <th className="p-4 border-r-[3px] border-b-4 border-black text-center text-[10px] font-black uppercase tracking-widest">Platform</th>
                             <th className="p-4 border-r-[3px] border-b-4 border-black text-center text-[10px] font-black uppercase tracking-widest">Yield</th>
                             <th className="p-4 border-b-4 border-black text-center text-[10px] font-black uppercase tracking-widest">Ops</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y-[3px] divide-black dark:divide-white/10 bg-white dark:bg-black/40">
                          {activeTasks.length === 0 ? (
                            <tr><td colSpan="5" className="p-20 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrix Idle</td></tr>
                          ) : (
                            activeTasks.map(task => (
                              <tr key={task.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors group">
                                 <td className="p-8 border-r-[3px] border-black dark:border-white/10">
                                    <p className="text-sm font-black text-slate-800 dark:text-white tabular-nums uppercase leading-none mb-2">{task.createdAt ? formatDateTime(task.createdAt) : 'LIVE'}</p>
                                    <p className="text-[10px] font-black text-blue-600/40 uppercase tracking-[0.2em]">{task.id.slice(0, 8)}</p>
                                 </td>
                                 <td className="p-8 border-r-[3px] border-black dark:border-white/10">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-white dark:bg-white/5 border-[3px] border-black rounded-[1.2rem] flex items-center justify-center text-blue-600 shadow-xl group-hover:rotate-6 transition-all duration-500">
                                          <HiLightningBolt className="w-6 h-6" />
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1.5">{task.title}</p>
                                          <Badge variant="info" className="text-[8px] px-2 py-0.5 border-2 border-black">SOCIAL BROADCAST</Badge>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-8 border-r-[3px] border-black dark:border-white/10 text-center">
                                    <p className="text-xs font-black text-slate-600 dark:text-cyan-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-lg border-2 border-black inline-block">{task.platform}</p>
                                 </td>
                                 <td className="p-8 border-r-[3px] border-black dark:border-white/10 text-right">
                                    <p className="text-xl font-black text-emerald-600 tabular-nums">{task.reward} ETB</p>
                                 </td>
                                 <td className="p-8 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                       <button onClick={() => { setForm(task); setEditId(task.id); setShowForm(true); }} className="p-3 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg"><HiPencil className="w-4 h-4" /></button>
                                       <button onClick={() => deleteTask(task.id)} className="p-3 bg-rose-600 text-white rounded-lg hover:bg-black transition-all shadow-lg"><HiTrash className="w-4 h-4" /></button>
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

           {pendingPromotions.length > 0 && (
              <div className="space-y-4">
                 <h4 className="text-xl font-black text-amber-600 uppercase tracking-tighter flex items-center gap-3">
                    <HiLightningBolt className="w-6 h-6" /> User Promotions Registry
                 </h4>
                 {pendingPromotions.map(task => (
                    <div key={task.id} className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl border-[3px] border-black dark:border-amber-700/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                       <div className="flex items-center gap-6 w-full">
                           <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
                              {PLATFORMS.find(p => p.id === task.platform)?.icon({ className: 'w-6 h-6' })}
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Promotion Node: {task.authorName || 'Anon'}</p>
                              <h4 className="font-black text-slate-900 dark:text-amber-400 uppercase truncate">{task.title}</h4>
                              <a href={task.link} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 flex items-center gap-1 mt-1 truncate hover:underline">
                                 <HiExternalLink className="w-3 h-3" /> External Link Matrix
                              </a>
                           </div>
                       </div>
                       <div className="flex items-center gap-3 w-full md:w-auto">
                           <div className="bg-white dark:bg-black px-4 py-3 rounded-xl border-2 border-black flex items-center gap-3 shrink-0">
                              <span className="text-[9px] font-black text-slate-400 uppercase">Yield:</span>
                              <input type="number" className="w-12 bg-transparent font-black text-emerald-600 outline-none text-right" id={`reward-${task.id}`} defaultValue="5" />
                           </div>
                           <button onClick={() => approvePromotion(task)} className="p-4 bg-emerald-600 text-white rounded-xl hover:bg-black transition-all shadow-lg"><HiCheckCircle className="w-5 h-5" /></button>
                           <button onClick={() => deleteTask(task.id)} className="p-4 bg-rose-600 text-white rounded-xl hover:bg-black transition-all shadow-lg"><HiTrash className="w-5 h-5" /></button>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>

        <div className="space-y-10">
           <div className="bg-black text-white rounded-[2.5rem] border-[4px] border-blue-600 p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/5 pointer-events-none" />
              <h5 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
                 <HiCheckCircle className="w-5 h-5 text-emerald-500" /> Pending Audit Queue
              </h5>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                 {openQueue.length === 0 ? (
                    <div className="text-center py-10 opacity-30">
                       <HiTrendingUp className="w-12 h-12 mx-auto mb-3" />
                       <p className="text-[9px] font-black uppercase tracking-[0.2em]">Queue Synchronized</p>
                    </div>
                 ) : (
                    openQueue.map(v => (
                       <div key={v.id} className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all group">
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{v.platform} NODE</p>
                          <p className="text-xs font-black text-white uppercase leading-tight line-clamp-2">{v.taskTitle}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-2">BY {v.userName || 'Unknown'}</p>
                          <button onClick={() => approveVerification(v)} className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl shadow-emerald-600/20 transition-all">Authorize Payout</button>
                       </div>
                    ))
                 )}
              </div>
           </div>

           <div className="bg-white dark:bg-[#0e1225] rounded-[2.5rem] border-[3px] border-black dark:border-white/10 p-8 shadow-2xl overflow-hidden relative group">
              <h5 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                 <HiShieldCheck className="w-4 h-4 text-emerald-500" /> Recent Authorizations
              </h5>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                 {verifiedTasks.length === 0 ? (
                    <p className="text-[9px] font-bold text-slate-400 italic">Archive Empty...</p>
                 ) : (
                    verifiedTasks.map((v, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-100 dark:border-white/5">
                          <div className="min-w-0 flex-1">
                             <p className="text-[9px] font-black text-slate-900 dark:text-white truncate uppercase">{v.userName}</p>
                             <p className="text-[8px] font-bold text-slate-400 truncate uppercase mt-0.5">{v.taskTitle}</p>
                          </div>
                          <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded ml-2">DONE</span>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? 'OVERWRITE BROADCAST' : 'INITIALIZE BROADCAST'}>
         <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-[#0e1225]">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Broadcast Subject</label>
               <input required className="w-full bg-slate-50 dark:bg-black border-[3px] border-black dark:border-white/10 p-4 rounded-xl font-black text-xs focus:border-blue-600 transition-all outline-none" placeholder="EX: ENGAGE WITH SVTECH TELEGRAM..." value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Network Node</label>
                  <select className="w-full bg-slate-50 dark:bg-black border-[3px] border-black dark:border-white/10 p-4 rounded-xl font-black uppercase text-[10px] focus:border-blue-600 transition-all outline-none" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
                     {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest px-1">Yield (Br)</label>
                  <input type="number" className="w-full bg-emerald-50 dark:bg-black border-[3px] border-black dark:border-emerald-900/20 p-4 rounded-xl font-black text-emerald-600 text-xs focus:border-emerald-600 transition-all outline-none" value={form.reward} onChange={e => setForm({...form, reward: e.target.value})} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Target Threshold</label>
                  <input type="number" className="w-full bg-slate-50 dark:bg-black border-[3px] border-black dark:border-white/10 p-4 rounded-xl font-black text-xs focus:border-blue-600 transition-all outline-none" value={form.targetCount} onChange={e => setForm({...form, targetCount: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Link Protocol</label>
                  <input required className="w-full bg-slate-50 dark:bg-black border-[3px] border-black dark:border-white/10 p-4 rounded-xl font-black text-[10px] focus:border-blue-600 transition-all outline-none" placeholder="HTTPS://..." value={form.link} onChange={e => setForm({...form, link: e.target.value})} />
               </div>
            </div>

            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50" disabled={loading}>
               {loading ? 'TRANSMITTING...' : (editId ? 'OVERWRITE SEQUENCE' : 'ACTIVATE BROADCAST')}
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default SocialTaskPanel;
