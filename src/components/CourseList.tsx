import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useCourseStore } from '../store/useCourseStore';
import { isCourseUnlocked } from '../utils/courseLogic';
import { Check, Lock, BookOpen, Search, Loader2, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDraggable } from '@dnd-kit/core';
import { type Course } from '../types';
import { fetchDepartmentCourses, fetchCourseDetails, type SFUDepartmentCourse } from '../services/sfuApi';
import { PrerequisiteRenderer } from './PrerequisiteRenderer';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const DraggableCourseListCard = ({ 
  course, 
  isCompleted, 
  unlocked, 
  isHighlighted,
  isWaived,
  onContextMenu
}: { 
  course: Course, 
  isCompleted: boolean, 
  unlocked: boolean, 
  isHighlighted: boolean,
  isWaived: boolean,
  onContextMenu: (e: React.MouseEvent) => void
}) => {
  const { toggleCourseCompletion } = useCourseStore();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `list-${course.id}`,
    data: { courseId: course.id }
  });

  const nodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (nodeRef.current) {
      if (transform) {
        nodeRef.current.style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0)`;
      } else {
        nodeRef.current.style.transform = '';
      }
    }
  }, [transform]);

  return (
    <div 
      ref={(node) => {
        setNodeRef(node);
        nodeRef.current = node;
      }}
      {...listeners}
      {...attributes}
      data-course-id={course.id}
      className={cn(
        "p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group hover:shadow-lg",
        isHighlighted ? "animate-pulse ring-4 ring-orange-500/80 shadow-[0_0_15px_rgba(249,115,22,0.5)] border-orange-400 bg-orange-900/20 z-10" :
        isCompleted ? "bg-emerald-900/20 border-emerald-500/30 hover:border-emerald-500/60" :
        isWaived ? "bg-amber-900/20 border-amber-500/30 hover:border-amber-500/60" :
        unlocked ? "bg-slate-800/40 border-slate-700 hover:border-indigo-500/50" :
        "bg-slate-950/40 border-slate-800 opacity-60 cursor-not-allowed",
        isDragging && "opacity-50 ring-2 ring-indigo-500 z-50 shadow-xl scale-105"
      )}
      onClick={() => {
        if (unlocked || isCompleted) toggleCourseCompletion(course.id);
      }}
      onContextMenu={onContextMenu}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={cn(
          "font-bold text-sm",
          isCompleted ? "text-emerald-400" : isWaived ? "text-amber-400" : unlocked ? "text-indigo-300" : "text-slate-500"
        )}>
          {course.id}
        </span>
        
        <button aria-label="Toggle course completion" className="shrink-0 ml-2 mt-0.5">
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

      <div className="flex items-center gap-2 mt-auto flex-wrap">
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-slate-400">
          {course.credits} Credits
        </span>
        {course.prerequisites.length > 0 && !unlocked && (
          <div className="flex items-center gap-1.5 flex-wrap mt-1 w-full">
            <span className="text-[10px] text-rose-400 font-medium shrink-0">
              Prereqs:
            </span>
            <div className="flex flex-wrap items-center gap-1 scale-90 origin-left">
              {course.prerequisites.map((p, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  {idx > 0 && <span className="text-[10px] font-bold text-slate-500 uppercase">AND</span>}
                  <PrerequisiteRenderer node={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CourseList = () => {
  const { allCourses, completedCourses, waivedCourses, highlightedCourses, semesterPlan, setResolvingPrereqsForCourseId, addCourseDynamically, assignCourseToSemester } = useCourseStore();
  const [search, setSearch] = useState('');
  const [menu, setMenu] = useState<{ x: number, y: number, courseId: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (menuRef.current && menu) {
      menuRef.current.style.top = `${menu.y}px`;
      menuRef.current.style.left = `${menu.x}px`;
    }
  }, [menu]);
  
  // Async Search State
  const [suggestions, setSuggestions] = useState<SFUDepartmentCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Derive which courses should be visible in the left panel
  const activeCourseIds = new Set([
    ...Object.values(semesterPlan).flat(),
    ...completedCourses,
    ...waivedCourses,
    ...highlightedCourses
  ]);

  const visibleCourses = allCourses.filter(c => activeCourseIds.has(c.id));

  // Handle Search Input
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Improved regex: Department (2-4 letters) followed by optional space and any alphanumeric sequence
      const match = search.match(/^([a-zA-Z]{2,4})\s*([a-zA-Z0-9]*)$/);
      if (!match) {
        setSuggestions([]);
        setIsDropdownOpen(false);
        return;
      }

      const dept = match[1];
      const numFilter = match[2];

      setIsLoading(true);
      setIsDropdownOpen(true);
      
      const deptCourses = await fetchDepartmentCourses(dept);
      
      let filtered = deptCourses;
      if (numFilter) {
        filtered = deptCourses.filter(c => c.value.startsWith(numFilter.toLowerCase()) || c.title?.toLowerCase().includes(numFilter.toLowerCase()));
      }
      
      // Increased limit from 10 to 50 so you can scroll through more options
      setSuggestions(filtered.slice(0, 50)); 
      setIsLoading(false);
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [search]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCourse = async (dept: string, courseNum: string) => {
    setIsDropdownOpen(false);
    setSearch('');
    
    // Check if we already have it in allCourses
    const fullId = `${dept.toUpperCase()} ${courseNum.toUpperCase()}`;
    let courseData: Course | undefined | null = allCourses.find(c => c.id === fullId);
    
    if (!courseData) {
      courseData = await fetchCourseDetails(dept, courseNum);
      if (courseData) {
        addCourseDynamically(courseData);
      }
    }
    
    if (courseData) {
      assignCourseToSemester(fullId, "Unassigned");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      <div className="p-6 border-b border-slate-800 relative" ref={searchRef}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-400" />
            Your Courses
          </h2>
          <a 
            href="https://www.sfu.ca/students/calendar/courses.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            SFU Catalog
          </a>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? <Loader2 size={16} className="text-slate-400 animate-spin" /> : <Search size={16} className="text-slate-400" />}
          </div>
          <input 
            type="text" 
            aria-label="Search courses dynamically"
            placeholder="Search API (e.g., 'CMPT 120')" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setIsDropdownOpen(true); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Search Dropdown Overlay */}
        {isDropdownOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-6 right-6 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
            {suggestions.map((sugg) => {
              const match = search.match(/^([a-zA-Z]{2,4})/);
              const dept = match ? match[1].toUpperCase() : '';
              const fullId = `${dept} ${sugg.text}`;
              
              return (
                <button
                  key={sugg.value}
                  onClick={() => handleAddCourse(dept, sugg.value)}
                  className="w-full text-left px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-sm text-indigo-300">{fullId}</div>
                    {sugg.title && <div className="text-xs text-slate-400 truncate mt-0.5">{sugg.title}</div>}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                    <Plus size={14} /> Add
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {visibleCourses.length === 0 ? (
          <div className="text-center p-6 text-slate-500 text-sm">
            Your course list is empty. Search above to add courses from the SFU catalog!
          </div>
        ) : (
          visibleCourses.map(course => {
            const isCompleted = completedCourses.includes(course.id);
            const unlocked = isCourseUnlocked(course, completedCourses, waivedCourses);
            const isHighlighted = highlightedCourses.includes(course.id);
            const isWaived = waivedCourses.includes(course.id);

            return (
              <DraggableCourseListCard 
                key={course.id}
                course={course}
                isCompleted={isCompleted}
                unlocked={unlocked}
                isHighlighted={isHighlighted}
                isWaived={isWaived}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({ x: e.clientX, y: e.clientY, courseId: course.id });
                }}
              />
            );
          })
        )}
      </div>

      {menu && (
        <>
          <div 
            className="fixed inset-0 z-[999]" 
            onClick={() => setMenu(null)} 
            onContextMenu={(e) => { e.preventDefault(); setMenu(null); }} 
          />
          <div 
            ref={menuRef}
            className="fixed z-[1000] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 w-64 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-slate-800 bg-slate-800/50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{menu.courseId} Options</span>
            </div>
            
            <button 
              onClick={() => { 
                setResolvingPrereqsForCourseId(menu.courseId);
                setMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              Add Prerequisites
            </button>
          </div>
        </>
      )}
    </div>
  );
};
