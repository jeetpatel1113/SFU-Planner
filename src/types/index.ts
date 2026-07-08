export type PrerequisiteNode = 
  | string 
  | { OR: PrerequisiteNode[] }
  | { AND: PrerequisiteNode[] };

export interface Course {
  id: string; // e.g. "CMPT 120"
  title: string;
  credits: number;
  description?: string;
  prerequisitesRaw?: string;
  prerequisites: PrerequisiteNode[]; // Lists of course IDs that must be completed. Top level is implicitly AND.
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
  startingSeason?: 'Spring' | 'Summer' | 'Fall';
  expectedGraduation?: string;
}

export type SemesterId = string;

export interface PlannerState {
  profile: UserProfile | null;
  completedCourses: string[];
  waivedCourses: string[];
  semesterPlan: Record<string, string[]>; // Map semester ID to list of course IDs
  allCourses: Course[];
  highlightedCourses: string[];
  removedCoreCourses: string[];
  aiContext: string;

  // Actions
  setProfile: (profile: UserProfile) => void;
  toggleCourseCompletion: (courseId: string) => void;
  toggleCourseWaiver: (courseId: string) => void;
  assignCourseToSemester: (courseId: string, semesterId: SemesterId) => void;
  assignCourseWithPrereqsToSemester: (courseId: string, semesterId: SemesterId) => void;
  batchAssignCoursesToSemester: (courseIds: string[], semesterId: SemesterId) => void;
  setHighlightedCourses: (courseIds: string[]) => void;
  setAiContext: (context: string) => void;
  removeCourseFromSemester: (courseId: string, semesterId: SemesterId) => void;
  removeCourses: (courseIds: string[]) => void;
  removeCourseWithChildren: (courseId: string) => void;
  applyPathway: (pathway: string[][]) => void;
  setCourseCompletion: (courseIds: string[], completed: boolean) => void;
  initializeCourses: (courses: Course[]) => void;
  seedDraft: (courseIds: string[]) => void;
  resetProgress: () => void;
  addCourseDynamically: (course: Course) => void;
  resolvingPrereqsForCourseId: string | null;
  setResolvingPrereqsForCourseId: (courseId: string | null) => void;
}

export interface DegreeTemplate {
  major: string;
  coreRequirements: string[]; // List of specific courses required
  electiveCreditsCount: number;
}
