import React, { useState } from 'react';
import { db } from '../core/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { HiCheckCircle, HiCurrencyDollar, HiBriefcase, HiLightningBolt, HiMail, HiPhone, HiUser } from 'react-icons/hi';
import { toast } from 'react-toastify';
import Badge from './ui/Badge';

const ServiceOrderForm = ({ service, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectDesc: '',
    budget: '',
    referralCode: '',
    paymentStatus: 'pending'
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'service_orders'), {
        ...form,
        serviceType: service.type,
        serviceTitle: service.title,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success('Service Order Protocol Initialized!');
      setStep(4); // Success step
    } catch (err) {
      toast.error('Network failure in order transmission');
    } finally {
      setLoading(false);
    }
  };

  const handleMockPayment = () => {
    setLoading(true);
    setTimeout(() => {
      setForm(prev => ({ ...prev, paymentStatus: 'completed' }));
      setLoading(false);
      toast.success('Payment Authorization Successful');
      nextStep();
    }, 1500);
  };

  return (
    <div className="p-2">
      {/* Progress Bar */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-10 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all shadow-xl ${
                step >= i ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > i ? <HiCheckCircle className="w-6 h-6" /> : i}
              </div>
              {i < 3 && <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${step > i ? 'bg-blue-600' : 'bg-slate-100'}`} />}
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
           <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Identity & Context</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-10">We need your basic professional profile to initialize the project node.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-1">Full Identity</label>
                 <div className="relative">
                    <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold outline-none focus:border-blue-600 transition-all" placeholder="Enter Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-1">Digital Mail</label>
                 <div className="relative">
                    <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold outline-none focus:border-blue-600 transition-all" placeholder="user@domain.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-1">Contact Line</label>
                 <div className="relative">
                    <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold outline-none focus:border-blue-600 transition-all" placeholder="09..." value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-1">Enterprise Name</label>
                 <div className="relative">
                    <HiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold outline-none focus:border-blue-600 transition-all" placeholder="Optional" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
                 </div>
              </div>
           </div>
           
           <button onClick={nextStep} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-blue-700 transition-all">Proceed to Spec</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
           <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Project Spec</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Define the core mission and resource allocation.</p>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-1">Mission Description</label>
              <textarea required rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 font-bold outline-none focus:border-blue-600 transition-all resize-none" placeholder="What are we building?" value={form.projectDesc} onChange={e => setForm({...form, projectDesc: e.target.value})} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-1">Budget Allocation</label>
                 <div className="relative">
                    <HiCurrencyDollar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                    <input className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl pl-12 pr-6 py-4 font-black text-emerald-600 outline-none focus:border-emerald-500 transition-all" placeholder="Ex: 50,000 ETB" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-1">Referral / Sign-Code</label>
                 <div className="relative">
                    <HiLightningBolt className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-black text-slate-700 outline-none focus:border-blue-600 transition-all uppercase placeholder:normal-case" placeholder="If referred" value={form.referralCode} onChange={e => setForm({...form, referralCode: e.target.value})} />
                 </div>
              </div>
           </div>

           <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Back</button>
              <button onClick={nextStep} className="flex-[2] py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-blue-700 transition-all">Go to Payment</button>
           </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
           <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Secure Settlement</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Initialize the fiscal commitment for the project.</p>
           </div>

           <div className="p-8 bg-[#0a0a0a] rounded-[3rem] text-white relative overflow-hidden group shadow-3xl">
              <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Order Summary</p>
                    <Badge variant="primary">Level: Elite</Badge>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                       <span className="text-slate-400 text-[11px] font-bold uppercase">Requested Service</span>
                       <span className="text-white font-black uppercase text-sm">{service.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-slate-400 text-[11px] font-bold uppercase">Base Commitment</span>
                       <span className="text-cyan-400 font-black text-xl tabular-nums">{form.budget || 'Custom'}</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-10 border-4 border-dashed border-slate-100 rounded-[3rem] text-center space-y-4">
              <HiCurrencyDollar className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose px-8">This is a secure gateway. Clicking below will authorize a mock transaction to proceed with the registry.</p>
           </div>

           <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black uppercase tracking-widest text-[10px]">Modify Spec</button>
              <button 
                onClick={handleMockPayment} 
                className="flex-[2] py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" /> : 'Authorize & Submit Order'}
              </button>
           </div>
        </div>
      )}

      {step === 4 && (
        <div className="py-20 text-center animate-in zoom-in duration-500">
           <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/20">
              <HiCheckCircle className="w-12 h-12" />
           </div>
           <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">Registry Success!</h3>
           <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed uppercase text-[10px] tracking-widest">
              Your service request node has been successfully deployed to our administrative matrix. An elite team member will contact you within 24 hours.
           </p>
           <button onClick={onClose} className="mt-12 px-12 py-5 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-blue-600 transition-all">Close Protocol</button>
        </div>
      )}
    </div>
  );
};

export default ServiceOrderForm;
