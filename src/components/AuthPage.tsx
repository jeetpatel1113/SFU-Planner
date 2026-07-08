import React, { useState } from 'react';
import { useCourseStore } from '../store/useCourseStore';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '../services/firebase';
import { degreeTemplates } from '../data/degreeTemplates';
import { GraduationCap, Sparkles, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AuthPage = () => {
  const { setProfile } = useCourseStore();
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [season, setSeason] = useState<'Spring' | 'Summer' | 'Fall'>('Fall');
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !major) return;
    
    setProfile({
      name,
      university: "Simon Fraser University",
      major,
      enrollmentYear: parseInt(year) || new Date().getFullYear(),
      startingSeason: season,
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      const user = await signInWithGoogle();
      
      const { loadPlannerFromFirebase } = await import('../services/firebase');
      const cloudData = await loadPlannerFromFirebase(user.uid);
      
      setTimeout(() => {
        const state = useCourseStore.getState();
        
        if (cloudData && cloudData.profile) {
          // Hydrate store with cloud data
          useCourseStore.setState({
            ...cloudData,
            // Keep allCourses intact as it comes from JSON/API, not user data
            allCourses: state.allCourses
          });
        } else if (!state.profile) {
          setProfile({
            name: user.displayName || "SFU Student",
            university: "Simon Fraser University",
            major: "Computing Science BSc",
            enrollmentYear: new Date().getFullYear(),
            startingSeason: "Fall",
          });
        }
      }, 500);
    } catch (err: unknown) {
      console.error(err);
      setIsLoading(false);
      
      const errorCode = (err as { code?: string })?.code;
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request' ||
        errorMessage.includes('auth/popup-closed-by-user')
      ) {
        setError('');
        return;
      }
      
      setError(errorMessage || 'Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-indigo-600/20 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-pink-600/20 blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        {/* Left column: Hero */}
        <div className="text-left space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 font-medium text-sm shadow-xl">
            <Sparkles size={16} />
            <span>AI-Powered Degree Planning</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight leading-tight">
            Get Your Planner Ready.
          </h1>
          
          <p className="text-slate-400 text-lg lg:text-xl max-w-xl leading-relaxed">
            The intelligent way to schedule your SFU courses, track your degree progress, and get AI-driven advice for your academic journey.
          </p>

          <div className="space-y-4">
            {[
              "Visualize prerequisites instantly",
              "Drag & Drop semester building",
              "Real-time SFU course catalog integration"
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                key={i} 
                className="flex items-center gap-3 text-slate-300"
              >
                <CheckCircle2 size={20} className="text-emerald-400" />
                <span className="font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column: Auth Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20 shadow-inner">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">SFU Planner AI</h2>
          </div>

          {!isLocalMode ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 border border-slate-200 disabled:opacity-70 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>

              <button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-3 disabled:opacity-70 group"
              >
                <span>Log in to existing account</span>
                <ArrowRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-semibold uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button 
                onClick={() => setIsLocalMode(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium py-3.5 rounded-xl transition-all border border-slate-800 flex items-center justify-center gap-2"
              >
                <BookOpen size={18} className="text-slate-400" />
                <span>Try it first (No save)</span>
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setIsLocalMode(false)}
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
                >
                  &larr; Back
                </button>
              </div>

              <div className="mb-8 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Setup Your Profile</h3>
                <p className="text-sm text-slate-400">Personalize your AI advisor without creating an account.</p>
              </div>

              <form onSubmit={handleLocalSubmit} className="space-y-5">
                <div>
                  <label htmlFor="first-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">First Name</label>
                  <input 
                    id="first-name"
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="major-select" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Major / Program</label>
                  <select 
                    id="major-select"
                    value={major}
                    onChange={e => setMajor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                  >
                    <option value="" disabled>Select your program...</option>
                    {Object.keys(degreeTemplates).map(m => (
                      <option key={m} value={m}>{degreeTemplates[m].name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="enrollment-year" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Starting Year</label>
                    <input 
                      id="enrollment-year"
                      type="number" 
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label htmlFor="enrollment-season" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Term</label>
                    <select 
                      id="enrollment-season"
                      value={season}
                      onChange={e => setSeason(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
                    >
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Fall">Fall</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!name || !major}
                  className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:from-indigo-600 disabled:to-purple-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  Launch Planner
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
