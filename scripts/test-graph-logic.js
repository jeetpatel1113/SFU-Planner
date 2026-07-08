const allCourses = [
  { id: 'CMPT 120', prerequisites: [] },
  { id: 'CMPT 125', prerequisites: ['CMPT 120'] },
  { id: 'CMPT 225', prerequisites: ['CMPT 125', 'MACM 101'] },
  { id: 'CMPT 295', prerequisites: ['CMPT 225'] },
  { id: 'MACM 101', prerequisites: [] }
];

const initialPlan = {
  "Fall 2024": ["CMPT 120", "MACM 101"],
  "Spring 2025": ["CMPT 125"],
  "Fall 2025": ["CMPT 225"],
  "Spring 2026": ["CMPT 295"]
};

// This is the exact logic we implemented in useCourseStore.ts
function removeCourseWithChildren(courseId, semesterPlan) {
  const newPlan = JSON.parse(JSON.stringify(semesterPlan));
  const coursesToRemove = new Set([courseId]);
  let changed = true;

  while (changed) {
    changed = false;
    const allAssignedCourses = Object.values(newPlan).flat();
    
    allAssignedCourses.forEach(id => {
      if (coursesToRemove.has(id)) return;
      const courseData = allCourses.find(c => c.id === id);
      if (courseData) {
        const hasRemovedPrereq = courseData.prerequisites.some(p => coursesToRemove.has(p));
        if (hasRemovedPrereq) {
          coursesToRemove.add(id);
          changed = true;
        }
      }
    });
  }

  Object.keys(newPlan).forEach(key => {
    newPlan[key] = newPlan[key].filter(id => !coursesToRemove.has(id));
  });

  return { newPlan, removed: Array.from(coursesToRemove) };
}

console.log("=== Original Plan ===");
console.log(initialPlan);

console.log("\n=== Test 1: Remove MACM 101 ===");
// Removing MACM 101 should remove MACM 101, CMPT 225, and CMPT 295. 
// It should leave CMPT 120 and CMPT 125.
const result1 = removeCourseWithChildren('MACM 101', initialPlan);
console.log("Courses Removed Recursively:", result1.removed.join(', '));
console.log("Remaining Plan:");
console.log(result1.newPlan);

console.log("\n=== Test 2: Remove CMPT 120 ===");
// Removing CMPT 120 should remove CMPT 120, CMPT 125, CMPT 225, CMPT 295.
// It should leave only MACM 101.
const result2 = removeCourseWithChildren('CMPT 120', initialPlan);
console.log("Courses Removed Recursively:", result2.removed.join(', '));
console.log("Remaining Plan:");
console.log(result2.newPlan);
