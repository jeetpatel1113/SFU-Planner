import { type Course } from '../types';

/**
 * Checks if a course is unlocked based on completed courses.
 * Realistically, SFU has complex prerequisite rules (e.g. "CMPT 125 OR CMPT 135").
 * For this MVP, we assume `prerequisites` is an array of IDs that ALL must be completed (AND condition).
 */
export const isCourseUnlocked = (course: Course, completedCourseIds: string[]): boolean => {
  if (!course.prerequisites || course.prerequisites.length === 0) {
    return true;
  }
  
  // AND condition for all listed pre-reqs
  return course.prerequisites.every(prereqId => completedCourseIds.includes(prereqId));
};

export const getAvailableCourses = (allCourses: Course[], completedCourseIds: string[]): Course[] => {
  return allCourses.filter(course => 
    !completedCourseIds.includes(course.id) && isCourseUnlocked(course, completedCourseIds)
  );
};
