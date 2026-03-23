import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChatAlt2, HiX, HiArrowRight, HiSparkles, HiChevronRight, HiSupport } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "HELLO! I AM YOUR SVTECH ACADEMY ASSISTANT. HOW CAN I HELP YOU WITH YOUR PROFESSIONAL TRAINING OR IT SUPPORT TODAY?", isBot: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const botResponses = {
    services: "WE PROVIDE PROFESSIONAL TECH TRAINING (PEACHTREE, QUICKBOOKS, IFRS), PREMIUM IT MAINTENANCE, AND ENTERPRISE NETWORK INSTALLATION.",
    repair: "TO SUBMIT A REPAIR REQUEST, PLEASE HEAD TO OUR SERVICES PAGE AND CLICK ON 'IT MAINTENANCE & REPAIR'. I CAN TAKE YOU THERE IF YOU LIKE!",
    contact: "YOU CAN REACH OUR HDQ HOTLINES AT 0913767842 OR 0997172338. WE ARE ALSO AVAILABLE AT SVACADEMY12M@GMAIL.COM.",
    about: "SVTECH ACADEMY IS ETHIOPIA'S ELITE CENTER FOR BUSINESS SOFTWARE EXPERTISE AND TECHNICAL RELIABILITY."
  };

  const handleAction = (type) => {
    setIsTyping(true);
    setTimeout(() => {
      let response = "";
      if (type === 'services') response = botResponses.services;
      if (type === 'repair') response = botResponses.repair;
      if (type === 'contact') response = botResponses.contact;
      
      setMessages(prev => [...prev, { id: Date.now(), text: response, isBot: true }]);
      setIsTyping(false);
    }, 1000);
  };

  const QuickActions = () => (
    <div className="flex flex-col gap-2 p-4">
      <button onClick={() => handleAction('services')} className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest transition-all text-left">
        Explore Services <HiChevronRight className="w-4 h-4" />
      </button>
      <button onClick={() => { setIsOpen(false); navigate('/services'); }} className="flex items-center justify-between p-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-[10px] font-black uppercase tracking-widest transition-all text-left">
        Submit Repair Request <HiChevronRight className="w-4 h-4" />
      </button>
      <button onClick={() => handleAction('contact')} className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest transition-all text-left">
        Get Contact Info <HiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 sm:bottom-8 sm:right-8 z-[100] w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 border-2 border-white/20"
      >
        <HiChatAlt2 className="w-8 h-8" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-[#0e1225] animate-pulse" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-8 right-6 sm:bottom-28 sm:right-8 z-[101] w-[350px] sm:w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-blue-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-[#121831] via-[#0e1225] to-[#0a0d1d] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                  <HiSparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-widest">SVTECH AI</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Always Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-[11px] font-bold tracking-tight leading-relaxed ${
                    m.isBot ? 'bg-white text-slate-800 shadow-sm border border-slate-100' : 'bg-blue-600 text-white shadow-xl'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Quick Actions */}
            <div className="border-t border-slate-100 bg-white">
              <div className="p-4 border-b border-slate-50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 px-2">Knowledge Directives</p>
                <QuickActions />
              </div>
              <div className="p-6 text-center">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">
                  Secure AI Protocol v4.0.2 • SV Tech Pro Systems
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
