export interface Course {
  id: string; // e.g. "CMPT 120"
  title: string;
  credits: number;
  description?: string;
  prerequisitesRaw?: string;
  prerequisites: string[]; // Lists of course IDs that must be completed
  corequisites?: string[];
  department: string;
  level: number;
}

export interface UserProfile {
  name: string;
  university: string;
  major: string;
  enrollmentYear: number;
}

export type SemesterId = "Fall 2024" | "Spring 2025" | "Summer 2025" | "Fall 2025" | "Spring 2026" | "Unassigned";

export interface PlannerState {
  profile: UserProfile | null;
  completedCourses: string[];
  semesterPlan: Record<SemesterId, string[]>; // Map semester ID to list of course IDs
  allCourses: Course[];
  highlightedCourses: string[];
  aiContext: string;

  // Actions
  setProfile: (profile: UserProfile) => void;
  toggleCourseCompletion: (courseId: string) => void;
  assignCourseToSemester: (courseId: string, semesterId: SemesterId) => void;
  batchAssignCoursesToSemester: (courseIds: string[], semesterId: SemesterId) => void;
  setHighlightedCourses: (courseIds: string[]) => void;
  setAiContext: (context: string) => void;
  removeCourseFromSemester: (courseId: string, semesterId: SemesterId) => void;
  initializeCourses: (courses: Course[]) => void;
  seedDraft: (courseIds: string[]) => void;
  resetProgress: () => void;
}

export interface DegreeTemplate {
  major: string;
  coreRequirements: string[]; // List of specific courses required
  electiveCreditsCount: number;
}
