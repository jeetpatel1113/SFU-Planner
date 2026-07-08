import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type PlannerState, type Course, type SemesterId, type UserProfile } from '../types';
import { getFutureSemesters } from '../utils/dateUtils';
import { extractAllCoursesFromNode } from '../utils/courseLogic';

const initialSemesters = getFutureSemesters(4);

export const useCourseStore = create<PlannerState>()(
  persist(
    (set) => ({
      profile: null,
      completedCourses: [],
      waivedCourses: [],
      allCourses: [],
      highlightedCourses: [],
      removedCoreCourses: [],
      aiContext: "",
      semesterPlan: {
        [initialSemesters[0]]: [],
        [initialSemesters[1]]: [],
        [initialSemesters[2]]: [],
        [initialSemesters[3]]: [],
        "Unassigned": [],
      },
      resolvingPrereqsForCourseId: null,
      
      setProfile: (profile: UserProfile) => set((state) => {
        const newSemesters = getFutureSemesters(8, profile.enrollmentYear, profile.startingSeason);
        const newPlan: Record<string, string[]> = { "Unassigned": state.semesterPlan["Unassigned"] || [] };
        newSemesters.forEach(sem => newPlan[sem] = state.semesterPlan[sem] || []);
        
        return { profile, semesterPlan: newPlan };
      }),
      setHighlightedCourses: (courseIds: string[]) => set({ highlightedCourses: courseIds }),
      setAiContext: (context: string) => set({ aiContext: context }),
      
      setResolvingPrereqsForCourseId: (courseId: string | null) => set({ resolvingPrereqsForCourseId: courseId }),
      
      initializeCourses: (courses: Course[]) => set({ allCourses: courses }),
      
      addCourseDynamically: (course: Course) => set((state) => {
        if (state.allCourses.some(c => c.id === course.id)) return state;
        return { allCourses: [...state.allCourses, course] };
      }),
      
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

      toggleCourseWaiver: (courseId: string) => set((state) => {
        const isWaived = state.waivedCourses.includes(courseId);
        if (isWaived) {
          return { waivedCourses: state.waivedCourses.filter(id => id !== courseId) };
        } else {
          return { waivedCourses: [...state.waivedCourses, courseId] };
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

      assignCourseWithPrereqsToSemester: () => {
        // Obsolete - functionality moved to PrerequisiteResolverModal
      },

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
        const newRemovedCore = Array.from(new Set([...state.removedCoreCourses, ...courseIds]));
        return { semesterPlan: newPlan, removedCoreCourses: newRemovedCore };
      }),

      removeCourseWithChildren: (courseId: string) => set((state) => {
        const newPlan = { ...state.semesterPlan };
        
        // Find all courses currently in the planner or graph that have `courseId` as a prerequisite
        const coursesToRemove = new Set<string>([courseId]);
        let changed = true;

        while (changed) {
          changed = false;
          // Look through all assigned courses + required core courses that haven't been removed yet
          // (Actually degreeTemplates isn't imported here, so let's just search the ENTIRE catalog)
          
          state.allCourses.forEach(courseData => {
            if (coursesToRemove.has(courseData.id)) return;
            
            const hasRemovedPrereq = courseData.prerequisites.some(p => 
              extractAllCoursesFromNode(p).some(pid => coursesToRemove.has(pid))
            );
            if (hasRemovedPrereq) {
              coursesToRemove.add(courseData.id);
              changed = true;
            }
          });
        }

        // Now remove all these courses from the plan
        Object.keys(newPlan).forEach(key => {
          newPlan[key as SemesterId] = (newPlan[key as SemesterId] || []).filter(id => !coursesToRemove.has(id));
        });
        
        const newRemovedCore = Array.from(new Set([...state.removedCoreCourses, ...Array.from(coursesToRemove)]));

        return { semesterPlan: newPlan, removedCoreCourses: newRemovedCore };
      }),

      applyPathway: (pathway: string[][]) => set((state) => {
        const newPlan = { ...state.semesterPlan };
        const semesters = Object.keys(newPlan).filter(k => k !== "Unassigned");
        
        const allPathwayCourses = pathway.flat();
        newPlan["Unassigned"] = (newPlan["Unassigned"] || []).filter(c => !allPathwayCourses.includes(c));

        pathway.forEach((courses, idx) => {
          if (idx < semesters.length) {
            newPlan[semesters[idx]] = Array.from(new Set([...(newPlan[semesters[idx]] || []), ...courses.filter(c => state.allCourses.some(ac => ac.id === c))]));
          }
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
        waivedCourses: [],
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
