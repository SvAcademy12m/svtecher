import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { HiDownload, HiAcademicCap, HiEye, HiCheckCircle, HiCurrencyDollar, HiInformationCircle, HiBadgeCheck, HiShieldCheck } from 'react-icons/hi';
import Modal from '../../../components/ui/Modal';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const StudentCertificates = () => {
  const { user, userData } = useAuth();
  const { t } = useLanguage();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState(null);
  
  // Payment Flow State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [targetCert, setTargetCert] = useState(null);
  const [referenceCode, setReferenceCode] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'certificates'), 
      where('studentId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setCertificates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!referenceCode.trim()) return toast.error("Please enter the reference number");
    
    setSubmittingPayment(true);
    try {
      await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        userName: userData?.name || 'Student',
        amount: 200, // Standard certificate fee or as per logic
        method: 'Manual Transfer',
        referenceCode: referenceCode.trim(),
        status: 'pending',
        type: 'certificate_fee',
        certificateId: targetCert.certificateId,
        certDocId: targetCert.id,
        timestamp: serverTimestamp(),
      });
      
      toast.success("Payment proof submitted! Admin will verify and unlock your official certificate soon.");
      setShowPaymentModal(false);
      setReferenceCode('');
    } catch (error) {
      toast.error("Failed to submit payment. Please try again.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const downloadOfficialCert = async (cert) => {
    try {
      const toastId = toast.loading('Generating your certificate PDF...');
      const qrData = await QRCode.toDataURL(`https://svtech.digital/verify/${cert.certificateId}`, { margin: 1, width: 100 });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const w = 297, h = 210;
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, w, h, 'F');
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, w, 46, 'F');
      pdf.setFillColor(217, 119, 6);
      pdf.rect(0, 44.5, w, 1.5, 'F');
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(13, 7, 30, 30, 4, 4, 'F');
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(20);
      pdf.setFont('times', 'italic');
      pdf.text('SV', 28, 27, { align: 'center' });
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(21);
      pdf.setFont('times', 'bold');
      pdf.text('SVTech Academy', 55, 22, { align: 'left' });
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(2.5);
      pdf.rect(8, 49, w - 16, h - 59, 'S');
      pdf.setDrawColor(217, 119, 6);
      pdf.setLineWidth(0.5);
      pdf.rect(11, 52, w - 22, h - 65, 'S');
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(30);
      pdf.setFont('times', 'bold');
      pdf.text('SHORT TERM & ADVANCED CERTIFICATE', w / 2, 74, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(148, 163, 184);
      pdf.text('O F   P R O F E S S I O N A L   A C H I E V E M E N T', w / 2, 82, { align: 'center' });
      pdf.setFillColor(217, 119, 6);
      pdf.rect(w / 2 - 28, 85.5, 56, 0.6, 'F');
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8.5);
      pdf.text('THIS DOCUMENT SERVES TO OFFICIALLY RECOGNIZE THAT', w / 2, 95, { align: 'center' });
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(36);
      pdf.setFont('times', 'italic');
      pdf.text(cert.studentName.toUpperCase(), w / 2, 112, { align: 'center' });
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text('HAS SUCCESSFULLY DEMONSTRATED PROFICIENCY AND EXCELLENCE IN', w / 2, 124, { align: 'center' });
      pdf.setTextColor(30, 58, 138);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(cert.courseName.toUpperCase(), w / 2, 133, { align: 'center' });
      pdf.setFillColor(254, 243, 199);
      pdf.setDrawColor(253, 230, 138);
      pdf.roundedRect(w / 2 - 36, 138, 72, 9, 2, 2, 'FD');
      pdf.setTextColor(180, 83, 9);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`FINAL GRADE SCORE:  ${cert.grade || 'A'}`, w / 2, 144.5, { align: 'center' });
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, h - 21, w, 21, 'F');
      pdf.setFillColor(217, 119, 6);
      pdf.rect(0, h - 21, w, 1.5, 'F');
      pdf.setTextColor(147, 197, 253);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text('VERIFICATION URL: SVTECH.DIGITAL/VERIFY', 18, h - 8, { align: 'left' });
      pdf.setTextColor(52, 211, 153);
      pdf.text('ARCHIVE SECURED BY SV-PROTOCOL', w - 18, h - 8, { align: 'right' });
      const bY = 154;
      pdf.setTextColor(30, 58, 138);
      pdf.setFontSize(20);
      pdf.setFont('times', 'italic');
      pdf.text('Samuel Tegegn', 47, bY + 8, { align: 'center' });
      pdf.setDrawColor(100, 116, 139);
      pdf.setLineWidth(0.5);
      pdf.line(18, bY + 12, 76, bY + 12);
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SAMUEL TEGEGN', 47, bY + 17, { align: 'center' });
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(6.5);
      pdf.text('FOUNDER & EXECUTIVE DIRECTOR', 47, bY + 22, { align: 'center' });
      const cx = w / 2, cy = bY + 14, rOuter = 19.5, rInner = 13, rArc = 16.3;
      pdf.setFillColor(239, 246, 255);
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(1.5);
      pdf.circle(cx, cy, rOuter, 'FD');
      pdf.setFillColor(255, 255, 255);
      pdf.setLineWidth(1);
      pdf.circle(cx, cy, rInner, 'FD');
      const stampText = 'SVTECH TRAINING & CONSULTING  \u2022  SVTECH VALIDATED  \u2022';
      const nChars = stampText.length;
      pdf.setTextColor(30, 58, 138);
      pdf.setFontSize(4.3);
      pdf.setFont('helvetica', 'bold');
      for (let i = 0; i < nChars; i++) {
        const angle = (-Math.PI / 2) + (2 * Math.PI * i) / nChars;
        const tx = cx + rArc * Math.cos(angle);
        const ty = cy + rArc * Math.sin(angle);
        const deg = (angle * 180 / Math.PI) + 90;
        pdf.text(stampText[i], tx, ty, { angle: -deg, align: 'center', baseline: 'middle' });
      }
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(16);
      pdf.setFont('times', 'italic');
      pdf.text('SV', cx, cy + 2, { align: 'center' });
      const qx = w - 67, qy = bY + 1;
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(qx - 2, qy - 1, 30, 30, 2, 2, 'FD');
      pdf.addImage(qrData, 'PNG', qx, qy, 26, 26);
      pdf.setTextColor(30, 58, 138);
      pdf.setFontSize(6.5);
      pdf.setFont('courier', 'bold');
      pdf.text(cert.certificateId, qx + 13, qy + 29, { align: 'center' });
      pdf.save(`SVTech_Certificate_${cert.studentName?.replace(/\s+/g, '_') || cert.certificateId}.pdf`);
      toast.dismiss(toastId);
      toast.success('Certificate Downloaded!');
    } catch (err) {
      toast.error('Download failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="pb-6 border-b border-blue-50 dark:border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-blue-900 dark:text-white tracking-tighter uppercase whitespace-nowrap underline decoration-blue-600 decoration-4 underline-offset-8">My Credentials</h2>
          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-4">Verified Academic Matrix</p>
        </div>
        <div className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-2xl flex items-center gap-3">
           <HiInformationCircle className="w-5 h-5 text-blue-600 shrink-0" />
           <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 uppercase leading-relaxed"> Official certificates require a one-time processing fee for digital signature & archiving. </p>
        </div>
      </div>

      {loading ? (
        <div className="p-24 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing Registry...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white dark:bg-[#0e1225] p-24 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-center shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-white/5 mx-auto flex items-center justify-center mb-6">
            <HiAcademicCap className="w-10 h-10 text-blue-200 dark:text-white/20" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">No Certificates Yet</h3>
          <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto mb-8 uppercase tracking-widest leading-loose">Complete your courses to receive official academic credentials.</p>
          <button className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-900 transition-all">Explore Courses</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {certificates.map(cert => (
            <div key={cert.id} className="group bg-white dark:bg-[#0e1225] rounded-3xl border-2 border-slate-100 dark:border-white/5 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative">
              {/* Card header gradient */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl" />
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <HiAcademicCap className="w-7 h-7" />
                </div>
                <span className={`px-3 py-1.5 text-[9px] font-black rounded-xl uppercase tracking-widest border ${
                  cert.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  {cert.status === 'paid' ? '✓ Official' : 'Sample'}
                </span>
              </div>

              <div className="space-y-1 mb-6">
                <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-[0.2em]">{cert.certificateId}</p>
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">{cert.courseName}</h4>
                <p className="text-xs font-bold text-slate-400">{cert.completionDate}</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 mb-6">
                <HiBadgeCheck className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-wide">Final Grade: <span className="text-amber-600">{cert.grade || 'A'}</span></span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {cert.status === 'paid' ? (
                  <button
                    onClick={() => downloadOfficialCert(cert)}
                    className="col-span-2 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:brightness-110 transition-all active:scale-95"
                  >
                    <HiDownload className="w-5 h-5" /> Download Official PDF
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => toast.info('Sample preview coming soon')}
                      className="flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black dark:hover:bg-white/20 transition-all"
                    >
                      <HiEye className="w-4 h-4" /> Preview
                    </button>
                    <button
                      onClick={() => { setTargetCert(cert); setShowPaymentModal(true); }}
                      className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                    >
                      <HiCurrencyDollar className="w-4 h-4" /> Unlock
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Unlock Official Credential" maxWidth="max-w-xl">
         <div className="p-8 space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
               <h4 className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest mb-4">Payment Methods</h4>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 dark:text-slate-300">
                     <span>Commercial Bank (CBE)</span>
                     <span className="font-black text-blue-600">1000123456789</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 dark:text-slate-300">
                     <span>Telebirr / Mobile Money</span>
                     <span className="font-black text-blue-600">0912 34 56 78</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 dark:text-slate-300">
                     <span>Payment Amount</span>
                     <span className="font-black text-emerald-600">200 ETB / 5 USD</span>
                  </div>
               </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block">Transaction Reference Number</label>
                  <input 
                    required
                    placeholder="Enter Reference (e.g. 1A2B3C...)"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 rounded-xl font-black text-sm outline-none focus:border-blue-500 transition-all dark:text-white"
                    value={referenceCode}
                    onChange={e => setReferenceCode(e.target.value)}
                  />
                  <p className="text-[9px] font-bold text-slate-400 mt-2 italic px-1">Please enter the exact reference number provided by your bank or telebirr.</p>
               </div>

               <button 
                 disabled={submittingPayment}
                 className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
               >
                  {submittingPayment ? 'Submitting proof...' : 'Submit Verification Request'}
               </button>
            </form>
         </div>
      </Modal>
    </div>
  );
};

export default StudentCertificates;
