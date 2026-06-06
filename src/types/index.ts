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
  offeredIn?: string[]; // E.g. ["Fall 2026", "Spring 2027"]
  instructor?: string;
  availabilityStatus?: 'Open' | 'Waitlist' | 'Closed';
}

export interface UserProfile {
  name: string;
  university: string;
  major: string;
  minor?: string;
  concentration?: string;
  enrollmentYear: number;
  expectedGraduation?: string;
}

export type SemesterId = string;

export interface PlannerState {
  profile: UserProfile | null;
  completedCourses: string[];
  semesterPlan: Record<string, string[]>; // Map semester ID to list of course IDs
  allCourses: Course[];
  highlightedCourses: string[];
  aiContext: string;

  // Actions
  setProfile: (profile: UserProfile) => void;
  toggleCourseCompletion: (courseId: string) => void;
  assignCourseToSemester: (courseId: string, semesterId: SemesterId) => void;
  assignCourseWithPrereqsToSemester: (courseId: string, semesterId: SemesterId) => void;
  batchAssignCoursesToSemester: (courseIds: string[], semesterId: SemesterId) => void;
  setHighlightedCourses: (courseIds: string[]) => void;
  setAiContext: (context: string) => void;
  removeCourseFromSemester: (courseId: string, semesterId: SemesterId) => void;
  removeCourses: (courseIds: string[]) => void;
  setCourseCompletion: (courseIds: string[], completed: boolean) => void;
  initializeCourses: (courses: Course[]) => void;
  seedDraft: (courseIds: string[]) => void;
  resetProgress: () => void;
}

export interface DegreeTemplate {
  major: string;
  coreRequirements: string[]; // List of specific courses required
  electiveCreditsCount: number;
}
