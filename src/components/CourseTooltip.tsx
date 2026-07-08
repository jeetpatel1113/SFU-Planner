import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCourseStore } from '../store/useCourseStore';
import { PrerequisiteRenderer } from './PrerequisiteRenderer';

const tooltipCache: Record<string, string> = {};

export const CourseTooltipProvider = ({ children }: { children: React.ReactNode }) => {
  const [hoverState, setHoverState] = useState<{ id: string, x: number, y: number } | null>(null);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Also check parents up to 3 levels to ensure we catch components accurately
      const courseEl = target.closest('[data-course-id]');
      if (courseEl) {
        const id = courseEl.getAttribute('data-course-id');
        if (id) {
          setHoverState({ id, x: e.clientX, y: e.clientY });
          return;
        }
      }
      setHoverState(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setHoverState(prev => {
        if (!prev) return null;
        // Optimization: only update if mouse moved significantly or just pass through
        return { ...prev, x: e.clientX, y: e.clientY };
      });
    };

    let timeout: ReturnType<typeof setTimeout>;
    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const related = e.relatedTarget as HTMLElement;
      if (target.closest('[data-course-id]') && !related?.closest('[data-course-id]')) {
        timeout = setTimeout(() => setHoverState(null), 50);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseout', handleMouseOut);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      {children}
      {hoverState && createPortal(
        <TooltipContent courseId={hoverState.id} x={hoverState.x} y={hoverState.y} />,
        document.body
      )}
    </>
  );
};

const TooltipContent = ({ courseId, x, y }: { courseId: string, x: number, y: number }) => {
  const [description, setDescription] = useState<string | null>(tooltipCache[courseId] || null);
  const [loading, setLoading] = useState(!tooltipCache[courseId]);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Get course data from store for prerequisites
  const courseData = useCourseStore(state => state.allCourses.find(c => c.id === courseId));

  useEffect(() => {
    if (tooltipCache[courseId]) {
      setDescription(tooltipCache[courseId]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchDesc = async () => {
      const [dept, num] = courseId.toLowerCase().split(' ');
      try {
        const res = await fetch(`https://www.sfu.ca/bin/wcm/academic-calendar?2024/fall/courses/${dept}/${num}`);
        if (res.ok) {
          const data = await res.json();
          const desc = data.description || "No specific description available.";
          if (isMounted) {
            setDescription(desc);
            tooltipCache[courseId] = desc;
            setLoading(false);
          }
        } else {
          throw new Error('Not found');
        }
      } catch {
        if (isMounted) {
          setDescription("Description could not be loaded from SFU records.");
          setLoading(false);
          // Don't cache errors so we can retry later
        }
      }
    };

    const timer = setTimeout(fetchDesc, 400); // 400ms hover delay before fetching
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [courseId]);

  // Prevent overlapping screen boundaries
  const safeX = Math.min(x + 20, window.innerWidth - 340);
  const safeY = Math.min(y + 20, window.innerHeight - 150);

  useLayoutEffect(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${safeX}px`;
      tooltipRef.current.style.top = `${safeY}px`;
    }
  }, [safeX, safeY]);

  return (
    <div 
      ref={tooltipRef}
      className="fixed z-[9999] pointer-events-none w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-xl p-4 text-sm text-slate-200 transition-opacity duration-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-bold text-indigo-400">{courseId}</h4>
        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 border border-slate-700">Live Info</span>
      </div>
      
      {loading ? (
        <div className="animate-pulse space-y-2 mt-2">
          <div className="h-2.5 bg-slate-700 rounded-full w-full"></div>
          <div className="h-2.5 bg-slate-700 rounded-full w-5/6"></div>
          <div className="h-2.5 bg-slate-700 rounded-full w-4/6"></div>
        </div>
      ) : (
        <p className="leading-relaxed line-clamp-5 text-xs text-slate-300">
          {description}
        </p>
      )}

      {courseData && courseData.prerequisites && courseData.prerequisites.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Prerequisites</h5>
          <div className="flex flex-wrap items-center gap-1 scale-90 origin-left">
            {courseData.prerequisites.map((p, idx) => (
              <div key={idx} className="flex items-center gap-1">
                {idx > 0 && <span className="text-[10px] font-bold text-slate-500 uppercase">AND</span>}
                <PrerequisiteRenderer node={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
