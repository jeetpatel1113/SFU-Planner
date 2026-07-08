import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type ReactFlowInstance,
  Position,
  Handle
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCourseStore } from '../store/useCourseStore';
import { isCourseUnlocked, extractAllCoursesFromNode } from '../utils/courseLogic';
import { type Course } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check, Lock, Star, Unlock } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { degreeTemplates } from '../data/degreeTemplates';
import { NodeContextMenu } from './NodeContextMenu';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Custom Node Component
const CourseNode = ({ data }: { data: { course: Course, isCompleted: boolean, isUnlocked: boolean, isWaived?: boolean, isHighlighted?: boolean, isRequired?: boolean, toggleCompletion: (id: string) => void } }) => {
  const { course, isCompleted, isUnlocked, isWaived, isHighlighted, isRequired, toggleCompletion } = data;

  return (
    <div 
      data-course-id={course.id}
      className={cn(
        "px-4 py-3 rounded-xl border min-w-[180px] transition-all shadow-lg backdrop-blur-md",
        isHighlighted ? "animate-pulse ring-4 ring-orange-500/80 shadow-[0_0_20px_rgba(249,115,22,0.6)] border-orange-400 bg-orange-900/40 text-orange-100 z-50 transform scale-110" :
        isCompleted ? "bg-emerald-900/80 border-emerald-500/50 text-emerald-100" :
        isWaived ? "bg-amber-900/80 border-amber-500/50 text-amber-100" :
        isUnlocked ? "bg-slate-800/90 border-indigo-500/50 text-slate-100 cursor-pointer hover:border-indigo-400" :
        "bg-slate-900/80 border-slate-700 text-slate-500 opacity-80"
      )}
      onClick={() => {
        if (isUnlocked || isCompleted) toggleCompletion(course.id);
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-600 !w-2 !h-2 !border-none" />
      
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-sm tracking-wide flex items-center gap-1.5">
          {course.id}
          {isRequired && <Star size={12} className="text-amber-400 fill-amber-400" aria-label="Required Course" />}
        </span>
        {isCompleted ? <Check size={14} className="text-emerald-400" /> : isWaived ? <Unlock size={12} className="text-amber-400" /> : !isUnlocked ? <Lock size={12} className="text-slate-600" /> : null}
      </div>
      
      <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">
        {course.credits} Cr
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-2 !h-2 !border-none" />
    </div>
  );
};

const nodeTypes = {
  courseNode: CourseNode,
};

export const CourseGraph = () => {
  const { profile, allCourses, completedCourses, waivedCourses, toggleCourseWaiver, toggleCourseCompletion, semesterPlan, highlightedCourses, removeCourses, removeCourseWithChildren, removedCoreCourses, setResolvingPrereqsForCourseId } = useCourseStore();

  const [menu, setMenu] = React.useState<{ x: number, y: number, courseId: string } | null>(null);

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const plannerCourseIds = Object.values(semesterPlan).flat();
    const userMajor = profile?.major;
    const template = userMajor ? degreeTemplates[userMajor] : null;
    const requiredCore = template?.coreRequirements || [];

    const coursesToRender = allCourses.filter(c => 
      (!removedCoreCourses.includes(c.id) && requiredCore.includes(c.id)) || 
      plannerCourseIds.includes(c.id) || 
      completedCourses.includes(c.id)
    );

    // Group courses by level for basic layout
    const levels: Record<number, Course[]> = {};
    coursesToRender.forEach(c => {
      levels[c.level] = levels[c.level] || [];
      levels[c.level].push(c);
    });

    Object.keys(levels).forEach((levelStr, levelIndex) => {
      const levelCourses = levels[Number(levelStr)];
      levelCourses.forEach((course, courseIndex) => {
        
        const isCompleted = completedCourses.includes(course.id);
        const isUnlocked = isCourseUnlocked(course, completedCourses, waivedCourses);
        const isWaived = waivedCourses.includes(course.id);
        const isHighlighted = highlightedCourses.includes(course.id);
        const isRequired = requiredCore.includes(course.id);

        nodes.push({
          id: course.id,
          type: 'courseNode',
          position: { 
            x: courseIndex * 220 + 50, 
            y: levelIndex * 150 + 50
          },
          data: { 
            course,
            isCompleted,
            isUnlocked,
            isWaived,
            isHighlighted,
            isRequired,
            toggleCompletion: toggleCourseCompletion
          },
        });

        const allPrereqIds = course.prerequisites.flatMap(p => extractAllCoursesFromNode(p));
        allPrereqIds.forEach(prereqId => {
          edges.push({
            id: `e-${prereqId}-${course.id}`,
            source: prereqId,
            target: course.id,
            animated: true,
            style: { 
              stroke: completedCourses.includes(prereqId) ? '#10b981' : '#6366f1', 
              strokeWidth: 2 
            },
          });
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [allCourses, completedCourses, waivedCourses, toggleCourseCompletion, semesterPlan, highlightedCourses]);

  // We can use state tracking to allow dragging nodes, but for simplicity we rely on useMemo overriding to redraw completion states
  // Actually, standard react-flow needs nodes state to enable dragging
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = React.useState<ReactFlowInstance | null>(null);

  // Sync state when dependencies change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  React.useEffect(() => {
    if (rfInstance && highlightedCourses.length > 0) {
      const highlightedNodes = nodes.filter(n => highlightedCourses.includes(n.id));
      if (highlightedNodes.length > 0) {
        rfInstance.fitView({ nodes: highlightedNodes, duration: 800, padding: 0.2 });
      }
    }
  }, [highlightedCourses, rfInstance, nodes]);

  const { setNodeRef, isOver } = useDroppable({
    id: 'Graph',
  });

  const onNodeContextMenu = React.useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        courseId: node.id,
      });
    },
    []
  );

  const onPaneClick = React.useCallback(() => {
    setMenu(null);
  }, []);

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "w-full h-full relative transition-colors border-4 border-transparent",
        isOver && "border-indigo-500/50 bg-indigo-500/5"
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        fitView
        className="bg-slate-950"
      >
        <Controls className="bg-slate-900 border-slate-800 fill-slate-300" />
        <MiniMap 
          nodeColor={(n) => {
            if (n.data.isCompleted) return '#10b981';
            if (n.data.isUnlocked) return '#6366f1';
            return '#334155';
          }}
          maskColor="rgba(2, 6, 23, 0.8)"
          className="bg-slate-900"
        />
        <Background color="#334155" gap={16} size={1} />
      </ReactFlow>
      
      {menu && (
        <NodeContextMenu
          x={menu.x}
          y={menu.y}
          courseId={menu.courseId}
          onClose={() => setMenu(null)}
          onRemove={(id) => removeCourses([id])}
          onRemoveWithChildren={(id) => removeCourseWithChildren(id)}
          onWaive={(id) => toggleCourseWaiver(id)}
          onAddWithPrereqs={(id) => setResolvingPrereqsForCourseId(id)}
        />
      )}
    </div>
  );
};
