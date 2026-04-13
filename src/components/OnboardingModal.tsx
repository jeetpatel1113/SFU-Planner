import React, { useState } from 'react';
import { useCourseStore } from '../store/useCourseStore';
import { motion } from 'framer-motion';

export const OnboardingModal = () => {
  const { setProfile } = useCourseStore();
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !major) return;
    
    setProfile({
      name,
      university: "Simon Fraser University",
      major,
      enrollmentYear: new Date().getFullYear(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to your AI Advisor</h2>
        <p className="text-slate-400 mb-6 text-sm">Let's set up your profile to build a custom academic path.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Your Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Concentration / Major</label>
            <select 
              value={major}
              onChange={e => setMajor(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
            >
              <option value="" disabled>Select your path</option>
              <option value="Computing Science BSc">Computing Science BSc</option>
              <option value="Open Space">Open Data / Custom</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={!name || !major}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/25"
          >
            Start Planning
          </button>
        </form>
      </motion.div>
    </div>
  );
};
