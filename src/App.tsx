import { useEffect, useState } from 'react';
import { useCourseStore } from './store/useCourseStore';
import { mockCourses, csDegreeTemplate } from './data/mockCourses';
import { CourseList } from './components/CourseList';
import { CourseGraph } from './components/CourseGraph';
import { SemesterPlanner } from './components/SemesterPlanner';
import { AuthPage } from './components/AuthPage';
import { UserProfile } from './components/UserProfile';
import { AIAdvisor } from './components/AIAdvisor';
import { CourseTooltipProvider } from './components/CourseTooltip';
import { LayoutDashboard, User, LogOut } from 'lucide-react';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const { profile, initializeCourses, seedDraft } = useCourseStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

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
    initializeCourses(mockCourses);
    seedDraft(csDegreeTemplate.coreRequirements);
  }, [initializeCourses, seedDraft]);

  // Firebase Auto Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          useCourseStore.setState({
            profile: data.profile || useCourseStore.getState().profile,
            aiContext: data.aiContext || '',
            completedCourses: data.completedCourses || [],
            semesterPlan: data.semesterPlan || useCourseStore.getState().semesterPlan
          });
        } else {
          // Push initial local state to their new cloud profile
          const state = useCourseStore.getState();
          await setDoc(docRef, {
            profile: state.profile,
            aiContext: state.aiContext,
            completedCourses: state.completedCourses,
            semesterPlan: state.semesterPlan
          }, { merge: true });
        }
      }
    });

    let syncTimeout: ReturnType<typeof setTimeout>;
    const unsubscribeStore = useCourseStore.subscribe((state) => {
      const user = auth.currentUser;
      if (!user) return;
      
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(async () => {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, {
          profile: state.profile,
          aiContext: state.aiContext,
          completedCourses: state.completedCourses,
          semesterPlan: state.semesterPlan
        }, { merge: true });
      }, 1500);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeStore();
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
            <div className="text-slate-400">
              User: <span className="text-slate-100">{profile.name}</span>
              <span className="font-semibold text-indigo-400"> {profile?.major}</span>
            </div>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500"
            >
              <User size={16} />
              Profile
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

        <AIAdvisor />
      </div>
    </CourseTooltipProvider>
  );
}

export default App;
