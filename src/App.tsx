import { useEffect, useState } from 'react';
import { useCourseStore } from './store/useCourseStore';
import sfuCourses from './data/sfuCourses.json';
import { degreeTemplates } from './data/degreeTemplates';
import { CourseList } from './components/CourseList';
import { CourseGraph } from './components/CourseGraph';
import { SemesterPlanner } from './components/SemesterPlanner';
import { AuthPage } from './components/AuthPage';
import { UserProfile } from './components/UserProfile';
import { AIAdvisor } from './components/AIAdvisor';
import { PrerequisiteResolverModal } from './components/PrerequisiteResolverModal';
import { CourseTooltipProvider } from './components/CourseTooltip';
import { LayoutDashboard, User, LogOut, Sun, Moon } from 'lucide-react';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  DndContext, 
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragEndEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

function App() {
  const { profile, initializeCourses, seedDraft, allCourses, semesterPlan, completedCourses } = useCourseStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over) {
      const activeIdStr = active.id as string;
      const courseId = activeIdStr.startsWith('list-') ? activeIdStr.replace('list-', '') : activeIdStr;
      
      const targetId = over.id as string;
      const targetSemester = targetId === 'Graph' ? 'Unassigned' : targetId;
      
      useCourseStore.getState().assignCourseWithPrereqsToSemester(courseId, targetSemester);
    }
  };

  useEffect(() => {
    const loadCatalog = async () => {
      // Determine current term based on date
      const date = new Date();
      const year = date.getFullYear().toString();
      const month = date.getMonth() + 1;
      let term = "fall";
      if (month >= 1 && month <= 4) term = "spring";
      else if (month >= 5 && month <= 8) term = "summer";

      // Prefer local JSON data in development so scripts like fetchSFUData take effect immediately
      if (import.meta.env.DEV) {
        initializeCourses(sfuCourses as any);
      } else {
        const { fetchCloudCatalog } = await import('./services/firebase');
        const cloudCourses = await fetchCloudCatalog(year, term);
        
        if (cloudCourses && cloudCourses.length > 0) {
          initializeCourses(cloudCourses);
        } else {
          // Fallback to static JSON if cloud catalog doesn't exist yet
          initializeCourses(sfuCourses as any);
        }
      }
      
      const reqs = profile?.major && degreeTemplates[profile.major] 
        ? degreeTemplates[profile.major].coreRequirements 
        : [];
      seedDraft(reqs);
    };

    loadCatalog();
  }, [initializeCourses, seedDraft, profile?.major]);

  // Firebase Auto Sync
  useEffect(() => {
    let syncTimeout: ReturnType<typeof setTimeout>;
    let unsubscribeStore: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { loadPlannerFromFirebase, savePlannerToFirebase } = await import('./services/firebase');
        const data = await loadPlannerFromFirebase(user.uid);
        
        if (data) {
          useCourseStore.setState({
            profile: data.profile || useCourseStore.getState().profile,
            aiContext: data.aiContext || '',
            completedCourses: data.completedCourses || [],
            waivedCourses: data.waivedCourses || [],
            highlightedCourses: data.highlightedCourses || [],
            removedCoreCourses: data.removedCoreCourses || [],
            semesterPlan: data.semesterPlan || useCourseStore.getState().semesterPlan
          });
        } else {
          // Push initial local state to their new cloud profile
          await savePlannerToFirebase(user.uid, useCourseStore.getState());
        }

        // Only subscribe to store changes AFTER we have a logged-in user
        if (!unsubscribeStore) {
          unsubscribeStore = useCourseStore.subscribe((state) => {
            clearTimeout(syncTimeout);
            syncTimeout = setTimeout(() => {
              savePlannerToFirebase(user.uid, state);
            }, 1500);
          });
        }
      } else {
        if (unsubscribeStore) {
          unsubscribeStore();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeStore) unsubscribeStore();
      clearTimeout(syncTimeout);
    };
  }, []);

  if (!profile) {
    return (
      <CourseTooltipProvider>
        <AuthPage />
      </CourseTooltipProvider>
    );
  }

  const allBoardCourseIds = Array.from(new Set([
    ...Object.values(semesterPlan).flat(),
    ...completedCourses
  ]));

  const totalCredits = allBoardCourseIds.reduce((sum, id) => {
    const course = allCourses.find(c => c.id === id);
    return sum + (course?.credits || 0);
  }, 0);

  return (
    <CourseTooltipProvider>
      <div className="h-screen bg-slate-950 text-slate-200 overflow-hidden flex flex-col font-sans">
        <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Header Dashboard */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-100">AI Course Advisor</h1>
          {profile && (
            <span className="ml-4 px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
              {profile.major} Path
            </span>
          )}
        </div>
        
        {profile && (
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg shadow-inner">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Credits</span>
              <span className={totalCredits >= 120 ? "text-emerald-400 font-bold text-base" : "text-indigo-400 font-bold text-base"}>
                {totalCredits} <span className="text-slate-500 font-normal text-xs">/ 120</span>
              </span>
            </div>

            <div className="text-slate-400 hidden lg:block">
              User: <span className="text-slate-100">{profile.name}</span>
            </div>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500"
            >
              <User size={16} />
              Profile
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button 
              onClick={async () => {
                try {
                  await import('./services/firebase').then(m => m.logoutUser());
                } catch (error) {
                  console.error('Logout failed', error);
                }
                useCourseStore.getState().resetProgress();
              }}
              className="flex items-center gap-2 text-sm font-semibold text-rose-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-rose-500"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        )}
      </header>

      {/* Main 3-Panel Workspace */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <main className="flex-1 flex overflow-hidden">
          {/* Left: Course List */}
          <section className="w-80 bg-slate-900/50 border-r border-slate-800 flex flex-col z-10 shadow-xl overflow-hidden backdrop-blur-sm">
            <CourseList />
          </section>

          {/* Center: Graph */}
          <section className="flex-1 relative bg-slate-950">
            <CourseGraph />
          </section>

          {/* Right: Semester Planner */}
          <section className="w-96 bg-slate-900/50 border-l border-slate-800 flex flex-col z-10 shadow-xl overflow-hidden backdrop-blur-sm">
            <SemesterPlanner />
          </section>
        </main>
        <DragOverlay>
          {activeId ? (
             <div className="p-3 rounded-lg bg-indigo-600 shadow-xl text-white font-bold opacity-90 scale-105 cursor-grabbing inline-block pointer-events-none">
               {activeId.replace('list-', '')}
             </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <PrerequisiteResolverModal />
      <AIAdvisor />
      </div>
    </CourseTooltipProvider>
  );
}

export default App;
