import { useEffect } from 'react';
import { useCourseStore } from './store/useCourseStore';
import { mockCourses, csDegreeTemplate } from './data/mockCourses';
import { CourseList } from './components/CourseList';
import { CourseGraph } from './components/CourseGraph';
import { SemesterPlanner } from './components/SemesterPlanner';
import { OnboardingModal } from './components/OnboardingModal';
import { AIAdvisor } from './components/AIAdvisor';
import { CourseTooltipProvider } from './components/CourseTooltip';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { auth, db, logoutUser } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function App() {
  const { profile, initializeCourses, seedDraft } = useCourseStore();

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

  return (
    <CourseTooltipProvider>
      <div className="h-screen bg-slate-950 text-slate-200 overflow-hidden flex flex-col font-sans">
        {!profile && <OnboardingModal />}

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
              <span className="font-semibold text-indigo-400">{profile?.major}</span>
            </div>
            {auth.currentUser && (
              <button 
                onClick={() => logoutUser().then(() => useCourseStore.getState().resetProgress())}
                className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main 3-Panel Workspace */}
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

        <AIAdvisor />
      </div>
    </CourseTooltipProvider>
  );
}

export default App;
