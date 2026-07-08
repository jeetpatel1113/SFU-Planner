export function getFutureSemesters(count: number = 4, startYear?: number, startSeason?: 'Spring' | 'Summer' | 'Fall'): string[] {
  const semesters: string[] = [];
  const now = new Date();
  const year = startYear || now.getFullYear();
  const month = now.getMonth(); // 0-11
  
  let currentSeasonIndex = 0; // 0=Spring, 1=Summer, 2=Fall
  
  if (startSeason) {
    if (startSeason === 'Spring') currentSeasonIndex = 0;
    else if (startSeason === 'Summer') currentSeasonIndex = 1;
    else currentSeasonIndex = 2;
  } else {
    if (month >= 4 && month <= 7) currentSeasonIndex = 1;
    else if (month >= 8) currentSeasonIndex = 2;
  }

  const seasons = ["Spring", "Summer", "Fall"];

  // Start calculating from the provided/current semester
  let nextSeasonIndex = currentSeasonIndex;
  let nextYear = year;

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
