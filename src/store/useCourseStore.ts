import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type PlannerState, type Course, type SemesterId, type UserProfile } from '../types';
import { getFutureSemesters } from '../utils/dateUtils';

const initialSemesters = getFutureSemesters(4);

export const useCourseStore = create<PlannerState>()(
  persist(
    (set) => ({
      profile: null,
      completedCourses: [],
      allCourses: [],
      highlightedCourses: [],
      aiContext: "",
      semesterPlan: {
        [initialSemesters[0]]: [],
        [initialSemesters[1]]: [],
        [initialSemesters[2]]: [],
        [initialSemesters[3]]: [],
        "Unassigned": [],
      },
      
      setProfile: (profile: UserProfile) => set({ profile }),
      setHighlightedCourses: (courseIds: string[]) => set({ highlightedCourses: courseIds }),
      setAiContext: (context: string) => set({ aiContext: context }),
      
      initializeCourses: (courses: Course[]) => set({ allCourses: courses }),
      
      seedDraft: (courseIds: string[]) => set((state) => {
        const totalAssigned = Object.values(state.semesterPlan).flat().length;
        if (totalAssigned > 0) return state;
        const newPlan = { ...state.semesterPlan };
        newPlan["Unassigned"] = courseIds.filter(id => state.allCourses.some(c => c.id === id));
        return { semesterPlan: newPlan };
      }),

      toggleCourseCompletion: (courseId: string) => set((state) => {
        const isCompleted = state.completedCourses.includes(courseId);
        if (isCompleted) {
          // If un-completing, we should probably also recursively un-complete anything that relied on it? 
          // For now, just toggle off.
          return {
            completedCourses: state.completedCourses.filter(id => id !== courseId)
          };
        } else {
          return {
            completedCourses: [...state.completedCourses, courseId]
          };
        }
      }),

      assignCourseToSemester: (courseId: string, semesterId: SemesterId) => set((state) => {
        const newPlan = { ...state.semesterPlan };
        // Remove from any existing semester
        Object.keys(newPlan).forEach(key => {
          newPlan[key as SemesterId] = (newPlan[key as SemesterId] || []).filter(id => id !== courseId);
        });
        // Add to new semester
        newPlan[semesterId] = [...(newPlan[semesterId] || []), courseId];
        return { semesterPlan: newPlan };
      }),

      assignCourseWithPrereqsToSemester: (courseId: string, semesterId: SemesterId) => set((state) => {
        const newPlan = { ...state.semesterPlan };
        
        const getAllPrereqs = (cid: string, visited: Set<string> = new Set()): string[] => {
          if (visited.has(cid)) return [];
          visited.add(cid);
          
          const course = state.allCourses.find(c => c.id === cid);
          if (!course) return [];
          
          let prereqs: string[] = [];
          for (const p of course.prerequisites) {
            prereqs.push(p);
            prereqs = prereqs.concat(getAllPrereqs(p, visited));
          }
          return prereqs;
        };

        const allPrereqs = Array.from(new Set(getAllPrereqs(courseId)));
        
        Object.keys(newPlan).forEach(key => {
          newPlan[key as SemesterId] = (newPlan[key as SemesterId] || []).filter(id => id !== courseId);
        });
        newPlan[semesterId] = [...(newPlan[semesterId] || []), courseId];
        
        const assignedCourses = Object.values(newPlan).flat();
        const prereqsToAdd = allPrereqs.filter(p => 
          !assignedCourses.includes(p) && 
          !state.completedCourses.includes(p) &&
          state.allCourses.some(c => c.id === p)
        );
        
        if (prereqsToAdd.length > 0) {
          newPlan["Unassigned"] = Array.from(new Set([...(newPlan["Unassigned"] || []), ...prereqsToAdd]));
        }
        
        return { semesterPlan: newPlan };
      }),

      batchAssignCoursesToSemester: (courseIds: string[], semesterId: SemesterId) => set((state) => {
        const newPlan = { ...state.semesterPlan };
        // Remove from any existing semester
        Object.keys(newPlan).forEach(key => {
          newPlan[key as SemesterId] = (newPlan[key as SemesterId] || []).filter(id => !courseIds.includes(id));
        });
        // Add to new semester (filtering valid courses just in case)
        const validIds = courseIds.filter(id => state.allCourses.some(c => c.id === id));
        newPlan[semesterId] = [...(newPlan[semesterId] || []), ...validIds];
        return { semesterPlan: newPlan };
      }),

      removeCourseFromSemester: (courseId: string, semesterId: SemesterId) => set((state) => {
        const newPlan = { ...state.semesterPlan };
        newPlan[semesterId] = (newPlan[semesterId] || []).filter(id => id !== courseId);
        return { semesterPlan: newPlan };
      }),

      removeCourses: (courseIds: string[]) => set((state) => {
        const newPlan = { ...state.semesterPlan };
        Object.keys(newPlan).forEach(key => {
          newPlan[key as SemesterId] = (newPlan[key as SemesterId] || []).filter(id => !courseIds.includes(id));
        });
        return { semesterPlan: newPlan };
      }),

      setCourseCompletion: (courseIds: string[], completed: boolean) => set((state) => {
        let newCompleted = [...state.completedCourses];
        if (completed) {
          courseIds.forEach(id => {
            if (!newCompleted.includes(id)) newCompleted.push(id);
          });
        } else {
          newCompleted = newCompleted.filter(id => !courseIds.includes(id));
        }
        return { completedCourses: newCompleted };
      }),

      resetProgress: () => set({
        profile: null,
        completedCourses: [],
        aiContext: "",
        semesterPlan: {
          [initialSemesters[0]]: [],
          [initialSemesters[1]]: [],
          [initialSemesters[2]]: [],
          [initialSemesters[3]]: [],
          "Unassigned": [],
        }
      })
    }),
    {
      name: 'course-planner-storage',
    }
  )
);
