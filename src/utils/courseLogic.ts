import { type Course, type PrerequisiteNode } from '../types';

export const evaluatePrerequisiteNode = (node: PrerequisiteNode, completedCourseIds: string[]): boolean => {
  if (typeof node === 'string') {
    return completedCourseIds.includes(node);
  }
  if ('OR' in node) {
    return node.OR.some(n => evaluatePrerequisiteNode(n, completedCourseIds));
  }
  if ('AND' in node) {
    return node.AND.every(n => evaluatePrerequisiteNode(n, completedCourseIds));
  }
  return false;
};

export const extractAllCoursesFromNode = (node: PrerequisiteNode): string[] => {
  if (typeof node === 'string') return [node];
  if ('OR' in node) return node.OR.flatMap(extractAllCoursesFromNode);
  if ('AND' in node) return node.AND.flatMap(extractAllCoursesFromNode);
  return [];
};

/**
 * Checks if a course is unlocked based on completed courses.
 */
export const isCourseUnlocked = (course: Course, completedCourseIds: string[], waivedCourseIds: string[] = []): boolean => {
  if (waivedCourseIds.includes(course.id)) {
    return true;
  }
  
  if (!course.prerequisites || course.prerequisites.length === 0) {
    return true;
  }
  
  // Top level is implicitly an AND list
  return course.prerequisites.every(node => evaluatePrerequisiteNode(node, completedCourseIds));
};

export const getAvailableCourses = (allCourses: Course[], completedCourseIds: string[], waivedCourseIds: string[] = []): Course[] => {
  return allCourses.filter(course => 
    !completedCourseIds.includes(course.id) && isCourseUnlocked(course, completedCourseIds, waivedCourseIds)
  );
};
