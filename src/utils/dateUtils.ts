export function getFutureSemesters(count: number = 4): string[] {
  const semesters: string[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  // Determine current semester
  // Spring: Jan(0) - Apr(3)
  // Summer: May(4) - Aug(7)
  // Fall: Sep(8) - Dec(11)
  
  let currentSeasonIndex = 0; // 0=Spring, 1=Summer, 2=Fall
  if (month >= 4 && month <= 7) currentSeasonIndex = 1;
  else if (month >= 8) currentSeasonIndex = 2;

  const seasons = ["Spring", "Summer", "Fall"];

  // Start calculating from the *next* semester
  let nextSeasonIndex = currentSeasonIndex + 1;
  let nextYear = year;
  if (nextSeasonIndex > 2) {
    nextSeasonIndex = 0;
    nextYear++;
  }

  for (let i = 0; i < count; i++) {
    semesters.push(`${seasons[nextSeasonIndex]} ${nextYear}`);
    nextSeasonIndex++;
    if (nextSeasonIndex > 2) {
      nextSeasonIndex = 0;
      nextYear++;
    }
  }

  return semesters;
}

export function getCurrentSemester(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  if (month >= 4 && month <= 7) return `Summer ${year}`;
  if (month >= 8) return `Fall ${year}`;
  return `Spring ${year}`;
}
