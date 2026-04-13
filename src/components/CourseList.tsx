import { useState } from 'react';
import { useCourseStore } from '../store/useCourseStore';
import { isCourseUnlocked } from '../utils/courseLogic';
import { Check, Lock, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const CourseList = () => {
  const { allCourses, completedCourses, toggleCourseCompletion, highlightedCourses } = useCourseStore();
  const [search, setSearch] = useState('');

  const filteredCourses = allCourses.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) || 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-indigo-400" />
          Course Catalog
        </h2>
        <input 
          type="text" 
          placeholder="Search by ID or Title..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredCourses.map(course => {
          const isCompleted = completedCourses.includes(course.id);
          const unlocked = isCourseUnlocked(course, completedCourses);
          const isHighlighted = highlightedCourses.includes(course.id);

          return (
            <div 
              key={course.id}
              data-course-id={course.id}
              className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group",
                isHighlighted ? "animate-pulse ring-4 ring-pink-500/80 shadow-[0_0_15px_rgba(236,72,153,0.5)] border-pink-400 bg-pink-900/20 z-10" :
                isCompleted ? "bg-emerald-900/20 border-emerald-500/30 hover:border-emerald-500/60" :
                unlocked ? "bg-slate-800/40 border-slate-700 hover:border-indigo-500/50" :
                "bg-slate-950/40 border-slate-800 opacity-60 cursor-not-allowed"
              )}
              onClick={() => {
                if (unlocked || isCompleted) toggleCourseCompletion(course.id);
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "font-bold text-sm",
                  isCompleted ? "text-emerald-400" : unlocked ? "text-indigo-300" : "text-slate-500"
                )}>
                  {course.id}
                </span>
                
                <button className="shrink-0 ml-2 mt-0.5">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  ) : !unlocked ? (
                    <div className="text-slate-600">
                      <Lock size={14} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-indigo-500/50 transition-colors" />
                  )}
                </button>
              </div>
              
              <h3 className="text-xs font-medium text-slate-300 mb-2 line-clamp-2 leading-relaxed">
                {course.title}
              </h3>

              <div className="flex items-center gap-2 mt-auto">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-slate-400">
                  {course.credits} Credits
                </span>
                {course.prerequisites.length > 0 && !unlocked && (
                  <span className="text-[10px] text-rose-400 font-medium">
                    Prereqs required
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
