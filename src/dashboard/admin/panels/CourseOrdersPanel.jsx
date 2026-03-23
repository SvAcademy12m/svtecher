import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, getDoc, increment, addDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { HiCheckCircle, HiTrash, HiCreditCard, HiTrendingUp, HiBadgeCheck } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useCurrency } from '../../../contexts/CurrencyContext';

const CourseOrdersPanel = () => {
  const [enrollments, setEnrollments] = useState([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const q = query(collection(db, 'enrollments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setEnrollments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const pendingOrders = enrollments.filter(e => e.status === 'pending');
  const activeOrders = enrollments.filter(e => e.status === 'active');

  const authorizeCourse = async (id) => {
    try {
      const enrollRef = doc(db, 'enrollments', id);
      const enrollSnap = await getDoc(enrollRef);
      if (!enrollSnap.exists()) return toast.error("Record missing.");
      
      const enrollment = enrollSnap.data();
      if (enrollment.status === 'active') return;

      // 1. Authorize enrollment
      await updateDoc(enrollRef, {
        status: 'active',
        updatedAt: serverTimestamp()
      });

      // 2. Resolve Referrer Commission
      const studentSnap = await getDoc(doc(db, 'users', enrollment.studentId));
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        if (studentData.referredBy) {
          const coursePrice = parseFloat(enrollment.price || 0);
          const commissionAmount = parseFloat((coursePrice * 0.20).toFixed(2));
          
          if (commissionAmount > 0) {
            const referrerRef = doc(db, 'users', studentData.referredBy);
            await updateDoc(referrerRef, {
              walletBalance: increment(commissionAmount),
              commissionBalance: increment(commissionAmount),
              updatedAt: serverTimestamp()
            });
            await addDoc(collection(db, 'transactions'), {
              userId: studentData.referredBy,
              type: 'referral_commission',
              amount: commissionAmount,
              currency: 'ETB',
              method: 'system',
              status: 'completed',
              description: `20% Commission for ${enrollment.studentName}'s Module Unlock`,
              createdAt: serverTimestamp()
            });
          }
        }
      }
      toast.success("Authorized & Matrices Updated!");
    } catch (err) {
      console.error(err);
      toast.error("Authorization matrix failed.");
    }
  };

  const rejectCourse = async (id) => {
    if(!window.confirm("Reject and delete this enrollment request?")) return;
    try {
      await deleteDoc(doc(db, 'enrollments', id));
      toast.success("Enrollment purged.");
    } catch {
      toast.error("Operation failed.");
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div>
        <h3 className="text-4xl font-black text-blue-900 dark:text-white tracking-tighter uppercase underline decoration-blue-600 decoration-4 underline-offset-8">Course Requisitions</h3>
        <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-3">Offline Payment Audit Console</p>
      </div>

      <div className="bg-white dark:bg-[#0e1225] rounded-[2.5rem] border border-blue-50 dark:border-white/5 overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-blue-50 dark:border-white/5 flex justify-between items-center bg-blue-50/30 dark:bg-white/5">
            <h4 className="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
               <HiCreditCard className="text-blue-600" /> Pending Authorizations
            </h4>
            <span className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{pendingOrders.length} Pending</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="bg-slate-50 dark:bg-black/20">
                     <th className="text-left p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                     <th className="text-left p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Module</th>
                     <th className="text-center p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Meta</th>
                     <th className="text-center p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield</th>
                     <th className="text-right p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {pendingOrders.map(order => (
                     <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black uppercase shadow-inner">
                                 {order.studentName?.[0] || '?'}
                              </div>
                              <div>
                                 <p className="font-black text-sm text-slate-900 dark:text-white leading-none mb-1">{order.studentName}</p>
                                 <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">ID: {order.studentId.slice(0, 6)}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-6 font-black text-slate-900 dark:text-white text-xs uppercase">{order.courseTitle}</td>
                        <td className="p-6">
                           <div className="flex flex-col items-center gap-1">
                              <span className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[9px] font-black rounded-lg uppercase tracking-widest">{order.paymentMethod}</span>
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">REF: {order.refId}</span>
                           </div>
                        </td>
                        <td className="p-6 text-center font-black text-emerald-600">{formatPrice(order.price)}</td>
                        <td className="p-6">
                           <div className="flex items-center justify-end gap-2">
                              <button onClick={() => authorizeCourse(order.id)} className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm" title="Authorize Setup">
                                 <HiCheckCircle className="w-5 h-5" />
                              </button>
                              <button onClick={() => rejectCourse(order.id)} className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm" title="Reject Request">
                                 <HiTrash className="w-5 h-5" />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {pendingOrders.length === 0 && (
            <div className="p-16 text-center">
               <HiTrendingUp className="w-16 h-16 text-slate-200 dark:text-white/5 mx-auto mb-4" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No pending requisitions</p>
            </div>
         )}
      </div>

      <div className="bg-white dark:bg-[#0e1225] rounded-[2.5rem] border border-blue-50 dark:border-white/5 overflow-hidden shadow-sm">
         <div className="p-8 border-b border-blue-50 dark:border-white/5">
            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
               <HiBadgeCheck className="text-emerald-500" /> Recent Authorizations
            </h4>
         </div>
         <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOrders.slice(0, 6).map(order => (
               <div key={order.id} className="p-6 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 rounded-lg">Authorized</span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.paymentMethod}</span>
                  </div>
                  <h5 className="font-black text-slate-900 dark:text-white text-sm uppercase leading-tight line-clamp-1 mb-2">{order.courseTitle}</h5>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student: {order.studentName}</p>
               </div>
            ))}
            {activeOrders.length === 0 && <p className="col-span-full py-10 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">Log Empty</p>}
         </div>
      </div>
    </div>
  );
};

export default CourseOrdersPanel;
