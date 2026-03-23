import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiCheckCircle, HiLockClosed, HiCreditCard, HiArrowRight, HiShieldCheck } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Modal from '../../../components/ui/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../core/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const StudentCourses = ({ enrollments, suggestedCourses, formatPrice }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('enrolled');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollForm, setEnrollForm] = useState({ method: 'telebirr', refId: '' });
  const [enrollLoading, setEnrollLoading] = useState(false);

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setShowEnrollModal(true);
  };

  const submitEnrollment = async (e) => {
    e.preventDefault();
    if (!user || !selectedCourse) return toast.error("Session missing");
    setEnrollLoading(true);
    try {
      await addDoc(collection(db, 'enrollments'), {
        studentId: user.uid,
        studentName: user.name || 'Student',
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        status: 'pending',
        paymentMethod: enrollForm.method,
        refId: enrollForm.refId.trim(),
        price: selectedCourse.price,
        progress: 0,
        createdAt: serverTimestamp()
      });
      toast.success("Validation request transmitted! Awaiting Admin audit.");
      setShowEnrollModal(false);
      setEnrollForm({ method: 'telebirr', refId: '' });
      setActiveTab('enrolled');
    } catch {
      toast.error("Transmission failed");
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-2">Technical Archive</h3>
           <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter  uppercase leading-none">Training <span className="text-blue-700">Programs</span></h2>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
           <TabBtn active={activeTab === 'enrolled'} onClick={() => setActiveTab('enrolled')}>Enrolled</TabBtn>
           <TabBtn active={activeTab === 'discover'} onClick={() => setActiveTab('discover')}>Discover Hub</TabBtn>
        </div>
      </div>

      {activeTab === 'enrolled' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments.length > 0 ? (
            enrollments.map((e, idx) => (
              <CourseTechCard key={e.id} enrollment={e} delay={idx * 0.1} />
            ))
          ) : (
            <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
              <HiLockClosed className="w-16 h-16 text-slate-200 mb-6 shadow-inner rounded-full p-4" />
              <p className="text-xl font-black text-slate-900 uppercase ">No Active Courses</p>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest mb-10">You have not initialized any training modules yet.</p>
              <button onClick={() => setActiveTab('discover')} className="px-10 py-4 bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-blue-800 transition-all active:scale-95">
                Browse Repository
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {suggestedCourses.map((c, idx) => (
             <MarketCourseCard key={c.id} course={c} delay={idx * 0.1} formatPrice={formatPrice} onEnroll={() => handleEnrollClick(c)} />
           ))}
        </div>
      )}

      {/* Enrollment Verification Modal */}
      <Modal isOpen={showEnrollModal} onClose={() => setShowEnrollModal(false)} title="Initialize Enrollment">
        {selectedCourse && (
          <form onSubmit={submitEnrollment} className="p-8 space-y-8 bg-white dark:bg-[#0e1225]">
            <div className="bg-blue-50 dark:bg-black/20 p-6 rounded-2xl border border-blue-100 dark:border-white/5">
               <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Target Module</p>
               <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">{selectedCourse.title}</h4>
               <p className="text-emerald-600 font-black mt-3 text-lg">{formatPrice(selectedCourse.price)}</p>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Payment Channel</label>
                  <select value={enrollForm.method} onChange={e => setEnrollForm({...enrollForm, method: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 uppercase text-xs">
                     <option value="telebirr">Telebirr (0911223344)</option>
                     <option value="cbe">Commercial Bank (100012345678)</option>
                     <option value="awash">Awash Bank (0132334455)</option>
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Transaction Ref ID</label>
                  <input required type="text" value={enrollForm.refId} onChange={e => setEnrollForm({...enrollForm, refId: e.target.value})} className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 uppercase text-sm" placeholder="e.g. FT23456789" />
                  <p className="text-[9px] font-bold text-slate-400 mt-2 px-1">Enter the reference code from your payment receipt to verify.</p>
               </div>
            </div>

            <button disabled={enrollLoading} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-black transition-all">
               {enrollLoading ? 'Transmitting...' : 'Submit Verification Request'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {children}
  </button>
);

const CourseTechCard = ({ enrollment, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group"
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${enrollment.status === 'pending' ? 'bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-700 group-hover:text-white'}`}>
             <HiPlus className="w-8 h-8 rotate-45" />
          </div>
          <div className="flex flex-col items-end gap-2">
             <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest ${enrollment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-600'}`}>{enrollment.status === 'pending' ? 'Audit Pending' : 'Authorized'}</span>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {enrollment.id.slice(0, 8)}</span>
          </div>
        </div>

        <h4 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter group-hover:text-blue-700 transition-colors">{enrollment.courseTitle}</h4>
        <p className={`text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-2 ${enrollment.status === 'pending' ? 'text-amber-500' : 'text-emerald-500'}`}>
          <HiShieldCheck /> Technical Training System 1.0
        </p>

        <div className="mt-10 pt-8 border-t border-slate-50">
          <div className="flex justify-between items-center mb-4">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Progress</span>
             <span className="text-sm font-black text-blue-700 ">45%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '45%' }}
               className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/20"
             />
          </div>
        </div>

        <button disabled={enrollment.status === 'pending'} className={`w-full mt-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl border-b-4 ${enrollment.status === 'pending' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-700 active:scale-95 group/btn border-slate-950'}`}>
          {enrollment.status === 'pending' ? 'Restricted Access' : 'Resume Processing'} {enrollment.status !== 'pending' && <HiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />}
        </button>
      </div>
    </motion.div>
  );
};

const MarketCourseCard = ({ course, delay, formatPrice, onEnroll }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all group flex flex-col"
    >
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6">
           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black  shadow-xl">SV</div>
           <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-lg uppercase tracking-widest">Premium Module</span>
              <span className="text-sm font-black text-blue-700  uppercase leading-none">CBE Verified</span>
           </div>
        </div>

        <h4 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter mb-4 group-hover:text-blue-700 transition-colors">{course.title}</h4>
        
        <div className="flex items-center gap-4 mb-8">
           <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xl font-black text-slate-900">{formatPrice(course.price)}</span>
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Single Access Node</span>
        </div>

        <div className="mt-auto pt-8 border-t border-slate-50 flex items-center gap-3">
           <button 
             onClick={onEnroll}
             className="flex-1 py-4 bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
           >
             <HiCreditCard className="w-4 h-4" /> Secure Unlock
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentCourses;
