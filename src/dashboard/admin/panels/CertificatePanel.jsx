import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { HiPlus, HiTrash, HiDownload, HiAcademicCap, HiPencil, HiEye } from 'react-icons/hi';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CertificatePanel = ({ users, courses }) => {
  const { t } = useLanguage();
  const [certificates, setCertificates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);
  const [form, setForm] = useState({ studentName: '', studentId: '', courseName: '', courseId: '', grade: 'A', completionDate: '', imageUrl: '', customWord: '' });
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
      const certId = `SVTECH-${Date.now().toString(36).toUpperCase()}`;
      await addDoc(collection(db, 'certificates'), {
        ...form,
        certificateId: certId,
        issuedBy: 'SVTech Academy',
        status: 'issued',
        createdAt: serverTimestamp(),
      });
      toast.success('Certificate issued!');
      setForm({ studentName: '', studentId: '', courseName: '', courseId: '', grade: 'A', completionDate: '', imageUrl: '', customWord: '' });
      setShowForm(false);
    } catch {
      toast.error('Failed to issue certificate');
    } finally {
      setLoading(false);
    }
  };

  const deleteCert = async (id) => {
    if (!window.confirm('Revoke this certificate?')) return;
    try { await deleteDoc(doc(db, 'certificates', id)); toast.success('Certificate revoked'); } catch { toast.error('Failed'); }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(certificates.map(c => ({
      ID: c.certificateId,
      StudentName: c.studentName || 'N/A',
      CourseName: c.courseName || 'N/A',
      Grade: c.grade || 'N/A',
      Status: c.status || 'N/A'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Certificates");
    XLSX.writeFile(wb, "Certificates_Export.xlsx");
  };

  const exportToPDF = () => {
    const docPdf = new jsPDF();
    docPdf.text('Certificates Report', 14, 15);
    docPdf.autoTable({
      head: [['Cert ID', 'Student', 'Course', 'Grade', 'Status']],
      body: certificates.map(c => [
        c.certificateId, c.studentName, c.courseName, c.grade, c.status
      ]),
      startY: 20,
    });
    docPdf.save('Certificates_Export.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Certificates</h3>
          <p className="text-sm font-bold text-slate-500 mt-1">Issue and manage customizable student certificates</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors border border-rose-200">
            <HiDownload className="w-4 h-4" /> PDF
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200">
            <HiDownload className="w-4 h-4" /> Excel
          </button>
          <Button icon={HiPlus} onClick={() => { setForm({ studentName: '', studentId: '', courseName: '', courseId: '', grade: 'A', completionDate: '', imageUrl: '', customWord: '' }); setShowForm(true); }}>Issue New</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200/40">
          <HiAcademicCap className="w-8 h-8 mb-2 text-white/60" />
          <p className="text-3xl font-black">{certificates.length}</p>
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mt-1">Total Issued</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-3xl font-black text-slate-900">{certificates.filter(c => c.status === 'issued').length}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Active</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-3xl font-black text-slate-900">{courses.length}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Eligible Courses</p>
        </div>
      </div>

      {/* Certificate list */}
      <div className="bg-[#0e1225] rounded-2xl border border-white/5 overflow-hidden shadow-xl shadow-indigo-500/10">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-[#1e2544]">
            <thead>
              <tr className="bg-[#0e1225]">
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-wider text-white border border-[#1e2544]">Certificate ID</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-wider text-white border border-[#1e2544]">Student</th>
                <th className="text-left p-4 text-[11px] font-black uppercase tracking-wider text-white border border-[#1e2544]">Course Details</th>
                <th className="text-center p-4 text-[11px] font-black uppercase tracking-wider text-white border border-[#1e2544]">Status/Grade</th>
                <th className="text-right p-4 text-[11px] font-black uppercase tracking-wider text-white border border-[#1e2544]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map(cert => (
                <tr key={cert.id} className="transition-all group bg-[#151a30] hover:bg-[#1e2544]">
                  <td className="p-4 align-top border border-[#1e2544]">
                    <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 border border-indigo-500/20 rounded-xl shadow-sm">{cert.certificateId}</span>
                  </td>
                  <td className="p-4 align-top text-sm font-black text-white border border-[#1e2544]">{cert.studentName}</td>
                  <td className="p-4 align-top border border-[#1e2544]">
                     <p className="text-sm font-black text-indigo-300">{cert.courseName}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{cert.customWord || 'Official Certificate'}</p>
                  </td>
                  <td className="p-4 align-top text-center border border-[#1e2544] bg-[#0e1225]/40">
                    <div className="flex flex-col items-center gap-1.5">
                      <Badge variant={cert.status === 'issued' ? 'success' : 'danger'} className="!px-3 !py-1 text-[9px] font-black uppercase">
                        {cert.status}
                      </Badge>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        cert.grade === 'A+' || cert.grade === 'A' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                      }`}>Grade: {cert.grade || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 align-top border border-[#1e2544]">
                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setPreviewCert(cert)} className="p-2 rounded-lg text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10 bg-[#0e1225]" title="View Design">
                        <HiEye className="w-5 h-5" />
                      </button>
                      <button onClick={() => deleteCert(cert.id)} className="p-2 rounded-lg text-red-400 border border-red-500/20 hover:bg-red-500/10 bg-[#0e1225]" title="Revoke">
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {certificates.length === 0 && <div className="text-center py-16 text-sm font-bold text-slate-400">No certificates issued yet</div>}
      </div>

      {/* Issue Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Issue Certificate" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Student Name</label>
              <input value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} required className="input-field" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Student ID</label>
              <select value={form.studentId} onChange={e => {
                const u = users.find(u => u.id === e.target.value);
                setForm({...form, studentId: e.target.value, studentName: u?.name || form.studentName});
              }} className="input-field">
                <option value="">Select student...</option>
                {users.filter(u => u.role === 'student').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Course</label>
              <select value={form.courseId} onChange={e => {
                const c = courses.find(c => c.id === e.target.value);
                setForm({...form, courseId: e.target.value, courseName: c?.title || form.courseName});
              }} className="input-field">
                <option value="">Select course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Grade</label>
              <select value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} className="input-field">
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Completion Date</label>
              <input type="date" value={form.completionDate} onChange={e => setForm({...form, completionDate: e.target.value})} className="w-full bg-slate-50 text-sm font-bold border border-slate-200 p-3 rounded-xl focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Custom Wording (Optional)</label>
              <input value={form.customWord} onChange={e => setForm({...form, customWord: e.target.value})} className="w-full bg-slate-50 text-sm font-bold border border-slate-200 p-3 rounded-xl focus:border-indigo-500 transition-colors" placeholder="e.g. Master Class 2026" />
            </div>
          </div>
          <div className="pt-2">
             <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Image URL Customization (Optional)</label>
             <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full bg-slate-50 text-sm font-bold border border-slate-200 p-3 rounded-xl focus:border-indigo-500 transition-colors" placeholder="https://example.com/custom-badge.png" />
          </div>
          <div className="pt-2 border-t border-slate-100">
             <Button type="submit" variant="primary" size="lg" className="w-full shadow-lg shadow-indigo-500/20" loading={loading}>
               Generate & Issue Certificate
             </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Certificate Modal */}
      <Modal isOpen={!!previewCert} onClose={() => setPreviewCert(null)} title="Certificate Preview" maxWidth="max-w-3xl">
        {previewCert && (
          <div className="bg-white rounded-xl overflow-hidden border-8 border-[#0e1225] p-10 relative">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-50 pointer-events-none"></div>
             
             {/* Certificate Content */}
             <div className="relative z-10 text-center space-y-6 flex flex-col items-center">
                {previewCert.imageUrl ? (
                   <img src={previewCert.imageUrl} alt="Badge" className="w-24 h-24 object-contain mx-auto" />
                ) : (
                   <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/30 mx-auto">
                     <HiAcademicCap className="w-12 h-12 text-white" />
                   </div>
                )}
                
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-widest mt-6">Certificate of Completion</h1>
                
                <p className="text-sm font-black text-indigo-600 uppercase tracking-widest">This explicitly certifies that</p>
                
                <h2 className="text-5xl font-black text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>{previewCert.studentName}</h2>
                
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
                  has successfully completed the intensive curriculum and requirements for the accredited course:
                </p>
                
                <h3 className="text-2xl font-black text-indigo-900">{previewCert.courseName}</h3>
                
                <p className="text-lg font-bold text-slate-600 italic">"{previewCert.customWord || 'Official Mastery Completion'}"</p>
                
                <div className="pt-8 w-full flex justify-between items-end border-t-2 border-slate-200 mt-8">
                   <div className="text-left">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Awarded Grade</p>
                     <p className="text-3xl font-black text-slate-800">{previewCert.grade || 'A'} <span className="text-xs text-indigo-500 align-top">DISTINCTION</span></p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Certificate Hash / ID</p>
                     <p className="text-sm font-mono font-black text-slate-900">{previewCert.certificateId}</p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CertificatePanel;
