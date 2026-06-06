import { useState } from 'react';
import { useCourseStore } from '../store/useCourseStore';
import { type SemesterId } from '../types';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Calendar, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getFutureSemesters } from '../utils/dateUtils';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Draggable Course Item
const DraggableCourse = ({ courseId }: { courseId: string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: courseId,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3 mb-2 rounded-lg bg-slate-800 border border-slate-700 shadow-sm cursor-grab active:cursor-grabbing text-sm font-medium text-slate-200 transition-colors hover:border-indigo-500",
        isDragging && "opacity-50 ring-2 ring-indigo-500 z-50"
      )}
    >
      {courseId}
    </div>
  );
};

// Droppable Semester Column
const SemesterColumn = ({ semesterId, courseIds }: { semesterId: SemesterId; courseIds: string[] }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: semesterId,
  });
  const { removeCourseFromSemester } = useCourseStore();

  return (
    <div className="h-full w-full bg-slate-900/80 rounded-xl border border-slate-800 p-3 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 shrink-0">
        <h3 className="font-bold text-slate-300 text-sm flex items-center gap-2">
          <Calendar size={14} className="text-indigo-400" />
          {semesterId}
        </h3>
        <span className="text-xs font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full">
          {courseIds.length}
        </span>
      </div>

      <div 
        ref={setNodeRef} 
        className={cn(
          "flex-1 overflow-y-auto custom-scrollbar p-1 rounded-lg transition-colors border-2 border-transparent min-h-0",
          isOver && "border-indigo-500/50 bg-indigo-500/5"
        )}
      >
        {courseIds.map(id => (
          <div key={id} className="relative group">
            <DraggableCourse courseId={id} />
            <button 
              onClick={() => removeCourseFromSemester(id, semesterId)}
              className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {courseIds.length === 0 && (
          <div className="text-xs text-center text-slate-600 font-medium py-4">
            Drag courses here
          </div>
        )}
      </div>
    </div>
  );
};

export const SemesterPlanner = () => {
  const { semesterPlan, assignCourseWithPrereqsToSemester, allCourses } = useCourseStore();

  const assignedCourses = Object.values(semesterPlan).flat();
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleAddCourse = (id: string) => {
    if (!id) return;
    assignCourseWithPrereqsToSemester(id, "Unassigned");
    setSelectedCourse('');
  };

  const semestersToRender: string[] = getFutureSemesters(4);

  return (
    <div className="flex flex-col h-full bg-slate-900/50 p-6 overflow-hidden">
      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4 shrink-0">
        <Calendar size={18} className="text-pink-400" />
        Semester Planner
      </h2>

      <div className="mb-4 flex gap-2 shrink-0">
        <select 
          value={selectedCourse} 
          onChange={e => setSelectedCourse(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="" disabled>Add course to planner...</option>
          {allCourses.map(c => (
            <option key={c.id} value={c.id} disabled={assignedCourses.includes(c.id)}>
              {c.id} - {c.title}
            </option>
          ))}
        </select>
        <button 
          onClick={() => handleAddCourse(selectedCourse)}
          disabled={!selectedCourse}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
        >
          Add
        </button>
      </div>



      {/* Unassigned Pool */}
      <div className="mb-4 h-32 shrink-0">
        <SemesterColumn semesterId={"Unassigned"} courseIds={semesterPlan["Unassigned"] || []} />
      </div>

      {/* Semesters Grid */}
      <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1 min-h-0">
        {semestersToRender.map(semId => (
          <SemesterColumn key={semId} semesterId={semId} courseIds={semesterPlan[semId] || []} />
        ))}
      </div>
    </div>
  );
};
