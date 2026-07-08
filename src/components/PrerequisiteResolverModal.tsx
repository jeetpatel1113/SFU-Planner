import { useState, useEffect } from 'react';
import { useCourseStore } from '../store/useCourseStore';
import { fetchCourseDetails } from '../services/sfuApi';
import { type PrerequisiteNode } from '../types';
import { PrerequisiteRenderer } from './PrerequisiteRenderer';
import { Loader2, X, PlusCircle, CheckCircle2 } from 'lucide-react';

export const PrerequisiteResolverModal = () => {
  const { 
    resolvingPrereqsForCourseId, 
    setResolvingPrereqsForCourseId,
    allCourses,
    semesterPlan,
    completedCourses,
    waivedCourses,
    addCourseDynamically,
    batchAssignCoursesToSemester,
    toggleCourseWaiver,
    assignCourseToSemester
  } = useCourseStore();

  const [isLoading, setIsLoading] = useState(false);
  const [unresolvedOrGroups, setUnresolvedOrGroups] = useState<{ id: number, options: PrerequisiteNode[] }[]>([]);
  const [autoAddCourses, setAutoAddCourses] = useState<string[]>([]);
  const [selections, setSelections] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!resolvingPrereqsForCourseId) {
      setUnresolvedOrGroups([]);
      setAutoAddCourses([]);
      setSelections({});
      return;
    }

    const course = allCourses.find(c => c.id === resolvingPrereqsForCourseId);
    if (!course) {
      setResolvingPrereqsForCourseId(null);
      return;
    }

    const activeCourseIds = new Set([
      ...Object.values(semesterPlan).flat(),
      ...completedCourses,
      ...waivedCourses
    ]);

    const orGroups: { id: number, options: PrerequisiteNode[] }[] = [];
    const autoAdds = new Set<string>();

    const evaluateNodeSatisfied = (node: PrerequisiteNode): boolean => {
      if (typeof node === 'string') return activeCourseIds.has(node);
      if ('AND' in node) return node.AND.every(evaluateNodeSatisfied);
      if ('OR' in node) return node.OR.some(evaluateNodeSatisfied);
      return false;
    };

    const evaluateNode = (node: PrerequisiteNode) => {
      if (typeof node === 'string') {
        if (!activeCourseIds.has(node)) {
          autoAdds.add(node);
        }
      } else if ('OR' in node) {
        const options = node.OR;
        const satisfied = options.some(evaluateNodeSatisfied);
        if (!satisfied) {
          orGroups.push({ id: orGroups.length, options });
        }
      } else if ('AND' in node) {
        node.AND.forEach(evaluateNode);
      }
    };

    if (course.prerequisites) {
      course.prerequisites.forEach(evaluateNode);
    }

    if (orGroups.length === 0) {
      // Auto resolve immediately if there's nothing to ask
      handleResolve(Array.from(autoAdds), {});
    } else {
      setUnresolvedOrGroups(orGroups);
      setAutoAddCourses(Array.from(autoAdds));
      
      // Auto-select first option for convenience
      const initialSelections: Record<number, number> = {};
      orGroups.forEach(g => {
        initialSelections[g.id] = 0;
      });
      setSelections(initialSelections);
    }
  }, [resolvingPrereqsForCourseId, allCourses, semesterPlan, completedCourses, waivedCourses]);

  const handleResolve = async (autoAdd: string[], sels: Record<number, number>) => {
    setIsLoading(true);
    
    const extractStrings = (node: PrerequisiteNode): string[] => {
      if (typeof node === 'string') return [node];
      if ('AND' in node) return node.AND.flatMap(extractStrings);
      if ('OR' in node) return node.OR.flatMap(extractStrings); 
      return [];
    };

    let selectedStrings: string[] = [];
    unresolvedOrGroups.forEach(group => {
      const selectedIndex = sels[group.id];
      if (selectedIndex !== undefined && group.options[selectedIndex]) {
        selectedStrings = selectedStrings.concat(extractStrings(group.options[selectedIndex]));
      }
    });

    const finalCourseIds = new Set([...autoAdd, ...selectedStrings]);
    const validIds: string[] = [];

    try {
      // Ensure all these courses are fetched and in the store
      for (const cid of Array.from(finalCourseIds)) {
        if (!allCourses.some(c => c.id === cid)) {
          const parts = cid.split(' ');
          if (parts.length === 2) {
            const details = await fetchCourseDetails(parts[0], parts[1]);
            if (details) {
              addCourseDynamically(details);
              validIds.push(cid);
            }
          }
        } else {
          validIds.push(cid);
        }
      }

      if (validIds.length > 0) {
        // We pass the new course IDs and let the store handle appending them to Unassigned.
        batchAssignCoursesToSemester([...validIds, resolvingPrereqsForCourseId], "Unassigned");
      } else {
        assignCourseToSemester(resolvingPrereqsForCourseId, "Unassigned");
      }

      setResolvingPrereqsForCourseId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWaive = () => {
    if (!resolvingPrereqsForCourseId) return;
    
    // Add to waived courses list to unlock it
    if (!waivedCourses.includes(resolvingPrereqsForCourseId)) {
      toggleCourseWaiver(resolvingPrereqsForCourseId);
    }
    
    // Add it to the planner
    assignCourseToSemester(resolvingPrereqsForCourseId, "Unassigned");
    
    // Close modal
    setResolvingPrereqsForCourseId(null);
  };

  if (!resolvingPrereqsForCourseId || unresolvedOrGroups.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <PlusCircle className="text-indigo-400" />
            Resolve Prerequisites
          </h2>
          <button 
            onClick={() => setResolvingPrereqsForCourseId(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-sm text-slate-300 mb-6">
            <span className="font-bold text-indigo-300">{resolvingPrereqsForCourseId}</span> has flexible prerequisite options. Please select which courses you plan to take to satisfy them.
          </p>

          <div className="space-y-6">
            {unresolvedOrGroups.map(group => (
              <div key={group.id} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Choose one path</h3>
                <div className="space-y-2">
                  {group.options.map((opt, idx) => {
                    return (
                      <label 
                        key={idx}
                        htmlFor={`option-${group.id}-${idx}`}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border border-transparent hover:bg-slate-800"
                      >
                        <input 
                          type="radio" 
                          id={`option-${group.id}-${idx}`}
                          name={`group-${group.id}`} 
                          value={idx}
                          checked={selections[group.id] === idx}
                          onChange={() => setSelections(prev => ({ ...prev, [group.id]: idx }))}
                          aria-label={`Select option ${idx + 1}`}
                          className="w-4 h-4 text-indigo-500 bg-slate-900 border-slate-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                        />
                        <span className="text-slate-200 font-medium flex items-center flex-wrap gap-y-2">
                          <PrerequisiteRenderer node={opt} />
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {autoAddCourses.length > 0 && (
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Automatically Adding</h3>
                <div className="flex flex-wrap gap-2">
                  {autoAddCourses.map(c => (
                    <span key={c} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-sm font-medium flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-slate-800 bg-slate-900 flex justify-end gap-3 shrink-0">
          <div className="flex-1 flex justify-start">
            <button
              onClick={handleWaive}
              className="px-4 py-2 rounded-lg text-sm font-medium text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 transition-colors border border-amber-500/20 hover:border-amber-500/40"
            >
              Waive Prerequisites
            </button>
          </div>
          <button
            onClick={() => setResolvingPrereqsForCourseId(null)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleResolve(autoAddCourses, selections)}
            disabled={isLoading || unresolvedOrGroups.some(g => selections[g.id] === undefined)}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
};
