import { useState, useRef, useEffect } from 'react';
import { useCourseStore } from '../store/useCourseStore';
import { askAIAdvisor } from '../services/aiAdvisor';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

export const AIAdvisor = () => {
  const { allCourses, semesterPlan, completedCourses, batchAssignCoursesToSemester, setHighlightedCourses, aiContext, setAiContext, resetProgress, removeCourses, setCourseCompletion, applyPathway } = useCourseStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
    { role: 'ai', text: "Hi! I'm your SFU computing science AI Advisor. Looking to specialize in AI, Software Engineering, or Systems? Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const draftCourses = semesterPlan["Unassigned"] || [];
      const { reply, suggestedCourses, highlightedCourses, updatedAiContext, resetPlanner, removeCourses: coursesToRemove, markCompleted, unmarkCompleted, pathway } = await askAIAdvisor(userMsg, allCourses, draftCourses, completedCourses, aiContext);
      
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      
      if (updatedAiContext) {
        setAiContext(updatedAiContext);
        console.log("AI Memory Updated:", updatedAiContext);
      }
      
      if (highlightedCourses && highlightedCourses.length > 0) {
        setHighlightedCourses(highlightedCourses);
        
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = setTimeout(() => {
          setHighlightedCourses([]);
        }, 3000);
      } else {
        setHighlightedCourses([]); // clear highlights if the AI didn't specify any new ones
      }

      if (resetPlanner) {
        resetProgress();
        setMessages(prev => [...prev, { role: 'ai', text: `✨ I have completely cleared your planner as requested.` }]);
      } else {
        if (coursesToRemove && coursesToRemove.length > 0) {
          removeCourses(coursesToRemove);
          setMessages(prev => [...prev, { role: 'ai', text: `✨ I removed ${coursesToRemove.join(', ')} from your plan.` }]);
        }

        if (suggestedCourses && suggestedCourses.length > 0) {
          batchAssignCoursesToSemester(suggestedCourses, "Unassigned");
          setMessages(prev => [...prev, { role: 'ai', text: `✨ I automatically added ${suggestedCourses.join(', ')} to your drafting pool!` }]);
        }

        if (markCompleted && markCompleted.length > 0) {
          setCourseCompletion(markCompleted, true);
          setMessages(prev => [...prev, { role: 'ai', text: `✨ I marked ${markCompleted.join(', ')} as completed.` }]);
        }

        if (unmarkCompleted && unmarkCompleted.length > 0) {
          setCourseCompletion(unmarkCompleted, false);
          setMessages(prev => [...prev, { role: 'ai', text: `✨ I unmarked ${unmarkCompleted.join(', ')} from your completed courses.` }]);
        }

        if (pathway && pathway.length > 0) {
          applyPathway(pathway);
          setMessages(prev => [...prev, { role: 'ai', text: `✨ I have successfully generated and applied your full degree pathway!` }]);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          aria-label="Open AI Advisor"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all z-50 flex items-center justify-center group"
        >
          <MessageSquare size={24} className="group-hover:animate-pulse" />
        </button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden transform transition-all duration-300">
          <div className="p-4 bg-slate-800/80 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">AI Course Advisor</h3>
                <p className="text-[10px] text-emerald-400 font-medium">Online • Gemini 1.5</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setInput("Please generate my full degree pathway.");
                  setTimeout(() => document.querySelector<HTMLButtonElement>('button[aria-label="Send message"]')?.click(), 100);
                }}
                className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded"
              >
                Generate Pathway
              </button>
              <button aria-label="Close AI Advisor" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center border border-slate-700">
                  <Bot size={14} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 rounded-tl-none text-slate-400 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="relative">
              <input 
                type="text" 
                aria-label="Ask AI Advisor"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about AI, Systems, Math..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
              <button 
                aria-label="Send message"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
