import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type PlannerState, type Course, type SemesterId, type UserProfile } from '../types';

export const useCourseStore = create<PlannerState>()(
  persist(
    (set) => ({
      profile: null,
      completedCourses: [],
      allCourses: [],
      highlightedCourses: [],
      semesterPlan: {
        "Fall 2024": [],
        "Spring 2025": [],
        "Summer 2025": [],
        "Fall 2025": [],
        "Spring 2026": [],
        "Unassigned": [],
      },
      
      setProfile: (profile: UserProfile) => set({ profile }),
      setHighlightedCourses: (courseIds: string[]) => set({ highlightedCourses: courseIds }),
      
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
          newPlan[key as SemesterId] = newPlan[key as SemesterId].filter(id => id !== courseId);
        });
        // Add to new semester
        newPlan[semesterId] = [...newPlan[semesterId], courseId];
        return { semesterPlan: newPlan };
      }),

      batchAssignCoursesToSemester: (courseIds: string[], semesterId: SemesterId) => set((state) => {
        const newPlan = { ...state.semesterPlan };
        // Remove from any existing semester
        Object.keys(newPlan).forEach(key => {
          newPlan[key as SemesterId] = newPlan[key as SemesterId].filter(id => !courseIds.includes(id));
        });
        // Add to new semester (filtering valid courses just in case)
        const validIds = courseIds.filter(id => state.allCourses.some(c => c.id === id));
        newPlan[semesterId] = [...newPlan[semesterId], ...validIds];
        return { semesterPlan: newPlan };
      }),

      removeCourseFromSemester: (courseId: string, semesterId: SemesterId) => set((state) => {
        const newPlan = { ...state.semesterPlan };
        newPlan[semesterId] = newPlan[semesterId].filter(id => id !== courseId);
        return { semesterPlan: newPlan };
      }),

      resetProgress: () => set({
        completedCourses: [],
        semesterPlan: {
          "Fall 2024": [],
          "Spring 2025": [],
          "Summer 2025": [],
          "Fall 2025": [],
          "Spring 2026": [],
          "Unassigned": [],
        }
      })
    }),
    {
      name: 'course-planner-storage',
    }
  )
);
