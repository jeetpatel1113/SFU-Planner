import React from 'react';
import { Trash2, Unlock } from 'lucide-react';

interface NodeContextMenuProps {
  x: number;
  y: number;
  courseId: string;
  onRemove: (courseId: string) => void;
  onRemoveWithChildren: (courseId: string) => void;
  onWaive: (courseId: string) => void;
  onAddWithPrereqs: (courseId: string) => void;
  onClose: () => void;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({ x, y, courseId, onRemove, onRemoveWithChildren, onWaive, onAddWithPrereqs, onClose }) => {
  return (
    <div 
      className="fixed z-[1000] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 w-64 overflow-hidden"
      style={{ top: y, left: x }}
    >
      <div className="px-3 py-2 border-b border-slate-800 bg-slate-800/50">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{courseId} Options</span>
      </div>
      
      <button 
        onClick={() => { onWaive(courseId); onClose(); }}
        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
      >
        <Unlock size={14} className="text-amber-400" />
        Toggle Prerequisite Waiver
      </button>

      <button 
        onClick={() => { onAddWithPrereqs(courseId); onClose(); }}
        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 border-t border-slate-800/50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        Add Prerequisites
      </button>

      <button 
        onClick={() => { onRemove(courseId); onClose(); }}
        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
      >
        <Trash2 size={14} className="text-rose-400" />
        Remove Course
      </button>
      
      <button 
        onClick={() => { onRemoveWithChildren(courseId); onClose(); }}
        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 border-t border-slate-800/50"
      >
        <Trash2 size={14} className="text-rose-600" />
        Remove with Child Courses
      </button>
    </div>
  );
};
