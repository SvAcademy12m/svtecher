import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiUpload, HiDocumentText, HiCheckCircle } from 'react-icons/hi';
import { toast } from 'react-toastify';

const ApplicationModal = ({ isOpen, onClose, job }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null,
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, resume: e.target.files[0] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.resume) {
      toast.error('Please upload your resume document.');
      return;
    }
    
    // Simulate submission to email/SMS
    setStep(2);
    setTimeout(() => {
      toast.success('Application submitted successfully!');
      onClose();
      setStep(1);
      setFormData({ fullName: '', email: '', phone: '', coverLetter: '', resume: null });
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0e1225] border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/20 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-white/5 border-b border-white/10 p-6 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[50px]" />
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Apply Now</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{job?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors relative z-10"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Full Name</label>
                    <input
                      required
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-[#0a0d1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Phone</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-[#0a0d1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      placeholder="+251 911 234 567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#0a0d1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Cover Letter</label>
                  <textarea
                    required
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-[#0a0d1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium resize-none"
                    placeholder="Why are you a great fit?"
                  />
                </div>

                <div>
                   <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Required Document (Resume/CV)</label>
                   <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                     <input 
                       type="file" 
                       onChange={handleFileChange} 
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                       accept=".pdf,.doc,.docx"
                     />
                     <div className="flex flex-col items-center gap-2">
                       <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                         {formData.resume ? <HiDocumentText className="w-5 h-5" /> : <HiUpload className="w-5 h-5" />}
                       </div>
                       <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                         {formData.resume ? formData.resume.name : 'Click to Upload Resume'}
                       </p>
                       <p className="text-xs text-slate-500 font-medium">PDF, DOC, DOCX up to 10MB</p>
                     </div>
                   </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white text-sm font-black tracking-widest uppercase hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
                >
                  <HiCheckCircle className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <h4 className="text-2xl font-black text-white mb-2 tracking-tight">Application Sent!</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
                  Your application has been submitted to the employer via Email and SMS dashboard alerts. Good luck!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApplicationModal;
