import { useEffect } from 'react';
import { useCourseStore } from './store/useCourseStore';
import { mockCourses, csDegreeTemplate } from './data/mockCourses';
import { CourseList } from './components/CourseList';
import { CourseGraph } from './components/CourseGraph';
import { SemesterPlanner } from './components/SemesterPlanner';
import { OnboardingModal } from './components/OnboardingModal';
import { AIAdvisor } from './components/AIAdvisor';
import { CourseTooltipProvider } from './components/CourseTooltip';
import { LayoutDashboard } from 'lucide-react';

function App() {
  const { profile, initializeCourses, seedDraft } = useCourseStore();

  useEffect(() => {
    // In a real app, we'd fetch from SFU API here
    initializeCourses(mockCourses);
    seedDraft(csDegreeTemplate.coreRequirements);
  }, [initializeCourses, seedDraft]);

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
            </div>
            {/* Progress overview usually goes here */}
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
