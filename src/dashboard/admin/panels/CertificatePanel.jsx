import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { HiPlus, HiTrash, HiDownload, HiAcademicCap, HiEye, HiCheckCircle, HiPrinter, HiIdentification, HiPencilAlt } from 'react-icons/hi';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

const CertificatePanel = ({ users, courses }) => {
  const { t } = useLanguage();
  const [certificates, setCertificates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const initialForm = { studentName: '', studentId: '', courseName: '', courseId: '', grade: 'A', completionDate: new Date().toISOString().split('T')[0], customWord: '' };
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'certificates'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setCertificates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'certificates', editingId), {
           ...form,
           updatedAt: serverTimestamp(),
        });
        toast.success('Credential Updated & Re-signed');
      } else {
        const certId = `SV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        await addDoc(collection(db, 'certificates'), {
          ...form,
          certificateId: certId,
          issuedBy: 'SVTech Digital Technology',
          status: 'issued',
          createdAt: serverTimestamp(),
        });
        toast.success('Credential Issued & Digitally Signed');
      }
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
    } catch {
      toast.error('Registry operation failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteCert = async (id) => {
    if (!window.confirm('Revoke this credential?')) return;
    try { await deleteDoc(doc(db, 'certificates', id)); toast.success('Credential Revoked'); } catch { toast.error('Revocation failed'); }
  };

  const downloadCert = async (cert) => {
    try {
      const toastId = toast.loading('Rendering secure digital PDF...', { autoClose: false });
      const qrData = await QRCode.toDataURL(`https://svtech.digital/verify/${cert.certificateId}`, { margin: 1, width: 100 });
      
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const w = 297, h = 210;

      // White background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, w, h, 'F');

      // BLUE HEADER BAND
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, w, 46, 'F');
      pdf.setFillColor(217, 119, 6);
      pdf.rect(0, 44.5, w, 1.5, 'F');

      // Logo
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(13, 7, 30, 30, 4, 4, 'F');
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(20);
      pdf.setFont('times', 'italic');
      pdf.text('SV', 28, 27, { align: 'center' });

      // Title in header
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(21);
      pdf.setFont('times', 'bold');
      pdf.text('SVTech Academy', 55, 22, { align: 'left' });
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(147, 197, 253);
      pdf.text('INNOVATION & TRAINING HUB', 55, 31, { align: 'left' });

      // Badge
      pdf.setFillColor(6, 78, 59);
      pdf.roundedRect(w - 68, 11, 54, 10, 3, 3, 'F');
      pdf.setTextColor(52, 211, 153);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text('\u2714 VERIFIED CREDENTIAL', w - 41, 18, { align: 'center' });
      pdf.setTextColor(147, 197, 253);
      pdf.setFontSize(7);
      pdf.text('GLOBAL VALIDATION NODE', w - 41, 33, { align: 'center' });

      // Body borders
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(2.5);
      pdf.rect(8, 49, w - 16, h - 59, 'S');
      pdf.setDrawColor(217, 119, 6);
      pdf.setLineWidth(0.5);
      pdf.rect(11, 52, w - 22, h - 65, 'S');

      // Body header text
      pdf.setTextColor(96, 165, 250);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ACADEMIC ACHIEVEMENT AWARD', w / 2, 62, { align: 'center', charSpace: 2 });

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
      pdf.setFont('helvetica', 'normal');
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

      // BLUE FOOTER BAND
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

      // BOTTOM ROW y position
      const bY = 154;

      // LEFT - Signature
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

      // CENTER - Official Stamp
      const cx = w / 2, cy = bY + 14;
      const rOuter = 19.5, rInner = 13, rArc = 16.3;

      pdf.setFillColor(239, 246, 255);
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(1.5);
      pdf.circle(cx, cy, rOuter, 'FD');

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(1);
      pdf.circle(cx, cy, rInner, 'FD');

      // Arc text between outer and inner rings
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

      // Center SV text
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(16);
      pdf.setFont('times', 'italic');
      pdf.text('SV', cx, cy + 2, { align: 'center' });
      pdf.setFontSize(4);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 116, 139);
      pdf.text('CERTIFIED', cx, cy + 8, { align: 'center', charSpace: 1 });

      // RIGHT - QR Code
      const qx = w - 67, qy = bY + 1;
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(qx - 2, qy - 1, 30, 30, 2, 2, 'FD');
      pdf.addImage(qrData, 'PNG', qx, qy, 26, 26);
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text('SCAN TO VERIFY', qx + 13, qy - 3, { align: 'center' });
      pdf.setTextColor(30, 58, 138);
      pdf.setFontSize(6.5);
      pdf.setFont('courier', 'bold');
      pdf.text(cert.certificateId, qx + 13, qy + 29, { align: 'center' });
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.text(cert.completionDate, qx + 13, qy + 34, { align: 'center' });

      pdf.save(`SVTech_Certificate_${cert.studentName?.replace(/\s+/g, '_') || cert.certificateId}.pdf`);
      toast.dismiss(toastId);
      toast.success('Official Certificate Downloaded');
    } catch (e) {
      toast.error('Failed to generate PDF');
      console.error(e);
    }
  };


  const sortedCertificates = useMemo(() => {
    return [...certificates].sort((a, b) => {
      if (a.status !== 'paid' && b.status === 'paid') return -1;
      if (a.status === 'paid' && b.status !== 'paid') return 1;
      return a.courseName.localeCompare(b.courseName);
    });
  }, [certificates]);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header Registry */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h3 className="text-4xl font-black text-blue-900 dark:text-white tracking-tighter uppercase underline decoration-blue-600 decoration-4 underline-offset-8">Credential Registry</h3>
          <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.4em] mt-3">Authorized Academic Issuance Node</p>
        </div>
        <button 
          onClick={() => { setForm(initialForm); setEditingId(null); setShowForm(true); }} 
          className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-[2rem] shadow-2xl shadow-blue-900/40 hover:-translate-y-1 transition-all font-black tracking-widest text-[11px] uppercase "
        >
          <HiPlus className="w-6 h-6"/> Issue New Credential
        </button>
      </div>

      {/* Matrix Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white dark:bg-[#0e1225] border-[4px] border-black dark:border-white/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <HiAcademicCap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 group-hover:scale-110 transition-transform" />
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2">Total Issued</p>
            <h4 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{certificates.length}</h4>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
               <HiCheckCircle className="w-4 h-4" /> Authenticated Nodes
            </div>
         </div>

         <div className="bg-black text-white border-[4px] border-blue-600 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <HiPrinter className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform" />
            <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-2">Registry Programs</p>
            <h4 className="text-5xl font-black tracking-tighter">{courses.length}</h4>
            <p className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-60">Curriculum Matrix Active</p>
         </div>

         <div className="bg-white dark:bg-[#0e1225] border-[4px] border-black dark:border-white/20 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-center">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <HiCheckCircle className="w-8 h-8" />
               </div>
               <div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Verified System</h4>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Signature Node 100%</p>
               </div>
            </div>
         </div>
      </div>

      {/* Registry Matrix Table */}
      <div className="bg-white dark:bg-[#0e1225] rounded-xl overflow-hidden shadow-2xl">
         <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar p-1">
            <table className="w-full border-collapse border-[3px] border-slate-300 dark:border-slate-600 min-w-[900px]">
               <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white z-20">
                  <tr>
                    <th className="p-5 border-[3px] border-slate-300 dark:border-slate-600 text-left text-[11px] font-black uppercase tracking-widest">Credential ID</th>
                    <th className="p-5 border-[3px] border-slate-300 dark:border-slate-600 text-left text-[11px] font-black uppercase tracking-widest">Academic Holder</th>
                    <th className="p-5 border-[3px] border-slate-300 dark:border-slate-600 text-left text-[11px] font-black uppercase tracking-widest">Program Module</th>
                    <th className="p-5 border-[3px] border-slate-300 dark:border-slate-600 text-center text-[11px] font-black uppercase tracking-widest">Auth Status</th>
                    <th className="p-5 border-[3px] border-slate-300 dark:border-slate-600 text-center text-[11px] font-black uppercase tracking-widest">Operations</th>
                  </tr>
               </thead>
               <tbody className="bg-white dark:bg-[#0e1225]">
                  {sortedCertificates.map(cert => (
                    <tr key={cert.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                      <td className="p-5 border-[3px] border-slate-300 dark:border-slate-600">
                         <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-black font-mono border-2 border-black dark:border-blue-700/50">
                            {cert.certificateId}
                         </span>
                      </td>
                      <td className="p-5 border-[3px] border-slate-300 dark:border-slate-600">
                         <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{cert.studentName}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verified Identity</p>
                      </td>
                      <td className="p-5 border-[3px] border-slate-300 dark:border-slate-600">
                         <p className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">{cert.courseName}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[250px]">{cert.customWord || 'Core Technology Curriculum'}</p>
                      </td>
                      <td className="p-5 border-[3px] border-slate-300 dark:border-slate-600 text-center">
                         <div className="flex flex-col items-center gap-1">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-[3px] ${cert.status === 'paid' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-amber-50 border-amber-500 text-amber-600'}`}>
                               {cert.status === 'paid' ? 'Authenticated' : 'Pending Fee'}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Grade: {cert.grade}</span>
                         </div>
                      </td>
                      <td className="p-5 border-[3px] border-slate-300 dark:border-slate-600 text-center">
                         <div className="flex justify-center gap-2">
                            <button onClick={() => setPreviewCert(cert)} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg" title="View PDF">
                               <HiEye className="w-5 h-5" />
                            </button>
                            <button onClick={() => { setForm(cert); setEditingId(cert.id); setShowForm(true); }} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-black transition-all shadow-lg" title="Edit Credential">
                               <HiPencilAlt className="w-5 h-5" />
                            </button>
                            <button onClick={() => downloadCert(cert)} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-black transition-all" title="Download Official PDF">
                                <HiDownload className="w-5 h-5" />
                             </button>
                            <button onClick={() => deleteCert(cert.id)} className="p-3 bg-rose-600 text-white rounded-xl hover:bg-black transition-all shadow-lg" title="Revoke">
                               <HiTrash className="w-5 h-5" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Issuance Modal Overlay */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? "Registry Protocol: Edit Credential" : "Registry Protocol: Credential Issuance"} maxWidth="max-w-2xl">
         <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white dark:bg-[#0e1225]">
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Candidate Nominal</label>
                  <input required placeholder="FULL LEGAL NAME..." className="w-full bg-slate-50 dark:bg-black border-[3px] border-black dark:border-white/10 p-4 rounded-xl font-black text-xs outline-none focus:border-blue-600 transition-all" value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Identity Node Mapping</label>
                  <select className="w-full bg-slate-50 dark:bg-black border-[3px] border-black dark:border-white/10 p-4 rounded-xl font-black text-[10px] outline-none focus:border-blue-600 transition-all" onChange={e => {
                     const u = users.find(u => u.id === e.target.value);
                     if (u) setForm({...form, studentId: u.id, studentName: u.name});
                  }}>
                     <option value="">MANUAL OVERRIDE</option>
                     {users.filter(u => u.role === 'student').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Program Module</label>
                  <select required className="w-full bg-slate-50 dark:bg-black border-[3px] border-black dark:border-white/10 p-4 rounded-xl font-black text-[10px] outline-none focus:border-blue-600 transition-all" value={form.courseId} onChange={e => {
                     const c = courses.find(c => c.id === e.target.value);
                     if (c) setForm({...form, courseId: c.id, courseName: c.title});
                  }}>
                     <option value="">SELECT MODULE</option>
                     {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Clearance Level (Grade)</label>
                  <select className="w-full bg-slate-50 dark:bg-black border-[3px] border-black dark:border-white/10 p-4 rounded-xl font-black text-[10px] outline-none focus:border-blue-600 transition-all" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>
                     <option value="A+">A+ PLATINUM DISTINCTION</option>
                     <option value="A">A GOLD EXCELLENCE</option>
                     <option value="B+">B+ SILVER MERIT</option>
                     <option value="B">B BRONZE CREDIT</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Completion Timeline</label>
                  <input type="date" className="w-full bg-slate-50 dark:bg-black border-[3px] border-black dark:border-white/10 p-4 rounded-xl font-black text-xs outline-none" value={form.completionDate} onChange={e => setForm({...form, completionDate: e.target.value})} />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Protocol Headline</label>
                  <input placeholder="EX: SVTECH MASTER CLASS 2026..." className="w-full bg-slate-50 dark:bg-black border-[3px] border-black dark:border-white/10 p-4 rounded-xl font-black text-[10px] outline-none focus:border-blue-600 transition-all" value={form.customWord} onChange={e => setForm({...form, customWord: e.target.value})} />
               </div>
            </div>

            <button disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50">
               {loading ? 'PROCESSING...' : (editingId ? 'UPDATE CREDENTIAL' : 'AUTHORIZE & ISSUE CREDENTIAL')}
            </button>
         </form>
      </Modal>

      {/* Advanced Diploma Preview */}
      <Modal isOpen={!!previewCert} onClose={() => setPreviewCert(null)} title="Official Credential Visualization" maxWidth="max-w-4xl">
         {previewCert && (
            <div className="p-4 dark:p-8 bg-gray-100 dark:bg-black overflow-x-auto flex justify-center custom-scrollbar">
               <div id="certificate-print-node" className="w-[1123px] h-[794px] shrink-0 bg-white border-[8px] border-slate-900/10 rounded-xl relative shadow-2xl flex flex-col justify-between">
                  
                  {/* Premium Frame Decorations Background */}
                  <div className="absolute inset-0 border-[2px] border-blue-900/10 m-3 pointer-events-none z-0"></div>

                  {/* Top Blue Gradient Header */}
                  <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 px-10 py-8 flex justify-between items-center text-white relative z-20 shadow-lg border-b-4 border-amber-500">
                     <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl border-4 border-blue-400 transform -rotate-3 hover:rotate-0 transition-transform">
                           <span className="font-black text-5xl text-blue-950 tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>SV</span>
                        </div>
                        <div className="text-left">
                           <h2 className="text-4xl font-black tracking-tighter uppercase text-white drop-shadow-md" style={{ fontFamily: 'Times New Roman, serif' }}>SVTech Academy</h2>
                           <p className="text-xs font-black text-blue-300 tracking-[0.4em] uppercase mt-2">Innovation & Training Hub</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="inline-block px-5 py-2.5 bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 rounded-full text-[10px] font-black tracking-widest uppercase mb-3 shadow-inner">
                           âœ” VERIFIED CREDENTIAL
                        </span>
                        <p className="text-[10px] font-bold text-blue-200 tracking-[0.2em] uppercase">Global Validation Node</p>
                     </div>
                  </div>

                  {/* Main White Content Area */}
                  <div className="flex-1 bg-white p-16 text-center flex flex-col space-y-12 relative z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50 to-white">
                     
                     {/* Title Area */}
                     <div className="space-y-2">
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.6em] mb-4">Academic Achievement Award</h3>
                        <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight uppercase drop-shadow-sm" style={{ fontFamily: 'Times New Roman, serif' }}>Short Term & Advanced Certificate</h1>
                        <p className="text-xl font-bold text-slate-400 uppercase tracking-[0.4em] mt-4 italic">Official Completion Certificate</p>
                     </div>

                     {/* Student Name */}
                     <div className="py-8 space-y-4">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">This explicitly confirms the successful mastery of</p>
                        <h2 className="text-6xl font-black text-blue-950 tracking-tight drop-shadow-sm" style={{ fontFamily: 'Georgia, serif' }}>{previewCert.studentName}</h2>
                     </div>

                     {/* Course Info */}
                     <div className="max-w-3xl mx-auto space-y-6">
                        <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                           Has successfully fulfilled all mandatory academic protocols and practical assessments for the technical curriculum of:
                        </p>
                        <h3 className="text-4xl font-black text-blue-900 tracking-tight uppercase drop-shadow-sm">{previewCert.courseName}</h3>
                        
                        {/* Display Scored Grade prominently */}
                        <div className="mt-10 flex justify-center">
                           <div className="inline-flex items-center gap-8 px-10 py-5 bg-white border-[3px] border-slate-100 rounded-[2rem] shadow-xl">
                              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                                 <HiCheckCircle className="w-10 h-10" />
                              </div>
                              <div className="text-left">
                                 <p className="text-[11px] font-black tracking-[0.3em] text-slate-400 uppercase mb-1">Assessment Final Score</p>
                                 <p className="text-3xl font-black tracking-tighter text-slate-900">GRADE: <span className="text-emerald-600">{previewCert.grade || 'A'}</span></p>
                              </div>
                           </div>
                        </div>

                        <p className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mt-8">{previewCert.customWord || 'Authorized Program Completion'}</p>
                     </div>

                     {/* Signatures & Verification Matrix */}
                     <div className="pt-12 grid grid-cols-3 items-end gap-12">
                        {/* Signature 1 */}
                        <div className="text-center space-y-3">
                           <div className="h-20 flex items-end justify-center relative">
                              <span className="text-4xl italic text-blue-900 font-serif opacity-90" style={{ fontFamily: 'Georgia, serif' }}>Samuel Tegegn</span>
                              {/* Digital Stamp Overlay */}
                              <div className="absolute -top-6 w-20 h-20 border-2 border-blue-600/20 rounded-full flex items-center justify-center -rotate-12 bg-white/70 backdrop-blur-sm">
                                 <span className="text-[7px] font-black text-blue-600/60 uppercase text-center leading-tight tracking-widest">Digital<br/>Approved</span>
                              </div>
                           </div>
                           <div className="h-[2px] bg-slate-800 max-w-[200px] mx-auto rounded-full"></div>
                           <div>
                              <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Samuel Tegegn</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Founder & Executive Director</p>
                           </div>
                        </div>

                        {/* Static Double-Circle Modern Seal */}
                        <div className="flex flex-col items-center mb-4">
                           <div className="w-36 h-36 relative flex items-center justify-center rounded-full bg-white border-[4px] border-double border-blue-900 shadow-xl">
                              {/* Inner Circle Ring */}
                              <div className="absolute inset-4 rounded-full border-[2px] border-blue-900 bg-slate-50 flex items-center justify-center">
                                  <div className="absolute inset-1 rounded-full border-[1px] border-blue-900/10"></div>
                              </div>
                              
                              {/* Circular Text */}
                              <svg className="absolute w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-45deg)' }}>
                                 <path id="sealPathNew" fill="none" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                                 <text fontSize="6.5" fontWeight="900" fill="#1e3a8a" letterSpacing="1.5px">
                                    <textPath href="#sealPathNew" startOffset="0%" textAnchor="start">
                                       SVTECH TRAINING & CONSULTING â€¢ SVTECH VALIDATED â€¢ 
                                    </textPath>
                                 </text>
                              </svg>

                              {/* Center SV */}
                              <div className="relative z-10 text-blue-950 flex flex-col items-center justify-center mt-1">
                                 <span className="font-black text-4xl italic tracking-tighter drop-shadow-sm" style={{ fontFamily: 'Georgia, serif' }}>SV</span>
                                 <span className="text-[4px] font-black tracking-[0.3em] uppercase mt-1 text-slate-600">Certified</span>
                              </div>
                           </div>
                           <p className="text-[9px] font-black text-blue-950 uppercase tracking-[0.3em] mt-5 text-center bg-white">OFFICIAL REGISTRY SEAL</p>
                        </div>

                        {/* QR Code & ID */}
                        <div className="flex flex-col items-end gap-3 text-right">
                           {/* Real API Generated QR */}
                           <div className="p-2 bg-white border-[3px] border-slate-200 rounded-xl shadow-sm hover:scale-105 transition-transform">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://svtech.digital/verify/${previewCert.certificateId}&margin=0`} 
                                alt="Verification QR Code" 
                                className="w-16 h-16 opacity-90"
                                crossOrigin="anonymous"
                              />
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol ID</p>
                              <p className="text-xs font-black font-mono text-blue-600 bg-blue-50 py-1.5 px-3 rounded-lg border border-blue-100">{previewCert.certificateId}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date of Issuance</p>
                              <p className="text-sm font-black text-slate-900">{previewCert.completionDate}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Bottom Blue Gradient Footer */}
                  <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 px-10 py-6 flex justify-between items-center text-white relative z-20 border-t-4 border-amber-500">
                     <div className="flex items-center gap-3">
                        <HiIdentification className="w-5 h-5 text-blue-300" />
                        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-blue-200">VERIFICATION URL: SVTECH.DIGITAL/VERIFY</p>
                     </div>
                     <p className="text-[9px] font-black tracking-[0.3em] uppercase text-emerald-400">ARCHIVE SECURED BY SV-PROTOCOL</p>
                  </div>
               </div>

               <div className="mt-12 flex justify-center gap-6">
                  <button onClick={() => downloadCert(previewCert)} className="flex items-center gap-4 px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95">
                     <HiPrinter className="w-6 h-6" /> PRINT FULL DIPLOMA
                  </button>
                  <button onClick={() => setPreviewCert(null)} className="flex items-center gap-4 px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-rose-600 transition-all active:scale-95">
                     TERMINATE PREVIEW
                  </button>
               </div>
            </div>
         )}
      </Modal>


    </div>
  );
};

export default CertificatePanel;
