import { type Course } from '../types';

const BASE_URL = 'https://www.sfu.ca/bin/wcm/course-outlines';

// Search across multiple terms to find as many courses as possible
const TERMS = [
  { year: '2026', term: 'fall' },
  { year: '2026', term: 'summer' },
  { year: '2026', term: 'spring' },
  { year: '2025', term: 'fall' },
  { year: '2025', term: 'summer' },
  { year: '2025', term: 'spring' },
  { year: '2024', term: 'fall' }
];

export interface SFUDepartmentCourse {
  text: string;
  value: string;
  title: string;
}

export const fetchDepartmentCourses = async (dept: string): Promise<SFUDepartmentCourse[]> => {
  try {
    // Fetch all terms concurrently
    const responses = await Promise.all(
      TERMS.map(t => fetch(`${BASE_URL}?${t.year}/${t.term}/${dept.toLowerCase()}`).catch(() => null))
    );
    
    const allCourses = new Map<string, SFUDepartmentCourse>();
    
    for (const res of responses) {
      if (!res || !res.ok) continue;
      try {
        const data: SFUDepartmentCourse[] = await res.json();
        for (const course of data) {
          if (!allCourses.has(course.value)) {
            allCourses.set(course.value, course);
          }
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
    
    return Array.from(allCourses.values());
  } catch (error) {
    console.error(`Error fetching courses for ${dept}:`, error);
    return [];
  }
};

export const fetchCourseDetails = async (dept: string, courseNum: string): Promise<Course | null> => {
  const fullId = `${dept.toUpperCase()} ${courseNum.toUpperCase()}`;
  
  for (const t of TERMS) {
    try {
      // Fetch sections for this term
      const secRes = await fetch(`${BASE_URL}?${t.year}/${t.term}/${dept.toLowerCase()}/${courseNum.toLowerCase()}`);
      if (!secRes.ok) continue;
      
      const sections = await secRes.json();
      if (!sections || sections.length === 0) continue;

      // Fetch outline for first section
      const firstSection = sections[0].value;
      const outRes = await fetch(`${BASE_URL}?${t.year}/${t.term}/${dept.toLowerCase()}/${courseNum.toLowerCase()}/${firstSection}`);
      if (!outRes.ok) continue;
      
      const outline = await outRes.json();
      const info = outline.info || {};
      
      return {
        id: fullId,
        title: info.title || fullId,
        credits: parseFloat(info.units || "3"),
        department: dept.toUpperCase(),
        level: Math.floor(parseInt(courseNum.replace(/\D/g, ''), 10) / 100) * 100 || 100,
        prerequisites: parsePrerequisites(info.prerequisites)
      };
    } catch (error) {
      // Try next term
    }
  }
  
  console.error(`Could not find details for ${fullId} in any recent terms.`);
  return null;
};

function parsePrerequisites(prereqText: string | undefined): any[] {
  if (!prereqText) return [];
  
  // Clean up the text
  let cleanText = prereqText.replace(/Prerequisite[s]?:/ig, '').trim();
  
  const tokens: any[] = [];
  let currentWord = "";
  
  const flushWord = () => {
    if (currentWord.trim()) {
      const w = currentWord.trim().toLowerCase();
      if (w === 'and' || w === 'or' || w === ';' || w === ',') {
        tokens.push({ type: 'operator', value: w === ';' || w === ',' ? 'and' : w });
      } else {
        tokens.push({ type: 'text', value: currentWord.trim() });
      }
      currentWord = "";
    }
  };

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    if (char === '(' || char === ')') {
      flushWord();
      tokens.push({ type: 'paren', value: char });
    } else if (char === ';' || char === ',') {
      flushWord();
      tokens.push({ type: 'operator', value: 'and' });
    } else if (/\s/.test(char)) {
      flushWord();
    } else {
      currentWord += char;
    }
  }
  flushWord();

  const mergedTokens: any[] = [];
  let runningText: string[] = [];
  for (const t of tokens) {
    if (t.type === 'text') {
      runningText.push(t.value);
    } else {
      if (runningText.length > 0) {
        mergedTokens.push({ type: 'text', value: runningText.join(' ') });
        runningText = [];
      }
      mergedTokens.push(t);
    }
  }
  if (runningText.length > 0) {
    mergedTokens.push({ type: 'text', value: runningText.join(' ') });
  }

  const courseRegex = /([a-z]{2,4})?\s*(\d{3}[a-zA-Z]?)/i;
  let lastDept = "";

  const finalTokens: any[] = [];
  for (const t of mergedTokens) {
    if (t.type === 'text') {
      const match = t.value.match(courseRegex);
      if (match) {
        if (match[1]) lastDept = match[1].toUpperCase();
        const dept = lastDept;
        const num = match[2].toUpperCase();
        if (dept) {
          finalTokens.push({ type: 'course', value: `${dept} ${num}` });
        }
      }
    } else {
      finalTokens.push(t);
    }
  }

  function parseExpression(toks: any[]): any {
    if (toks.length === 0) return null;
    if (toks.length === 1 && toks[0].type === 'course') return toks[0].value;

    let depth = 0;
    let currentGroup: any[] = [];
    let andGroups: any[] = [];
    
    for (const t of toks) {
      if (t.type === 'paren' && t.value === '(') depth++;
      else if (t.type === 'paren' && t.value === ')') depth--;
      
      if (depth === 0 && t.type === 'operator' && t.value === 'and') {
        andGroups.push(currentGroup);
        currentGroup = [];
      } else {
        currentGroup.push(t);
      }
    }
    andGroups.push(currentGroup);

    if (andGroups.length > 1) {
      const parsed = andGroups.map(parseExpression).filter(Boolean);
      if (parsed.length === 0) return null;
      if (parsed.length === 1) return parsed[0];
      return { AND: parsed };
    }

    depth = 0;
    currentGroup = [];
    let orGroups: any[] = [];
    
    for (const t of toks) {
      if (t.type === 'paren' && t.value === '(') depth++;
      else if (t.type === 'paren' && t.value === ')') depth--;
      
      if (depth === 0 && t.type === 'operator' && t.value === 'or') {
        orGroups.push(currentGroup);
        currentGroup = [];
      } else {
        currentGroup.push(t);
      }
    }
    orGroups.push(currentGroup);

    if (orGroups.length > 1) {
      const parsed = orGroups.map(parseExpression).filter(Boolean);
      if (parsed.length === 0) return null;
      if (parsed.length === 1) return parsed[0];
      return { OR: parsed };
    }

    if (toks.length >= 2 && toks[0].type === 'paren' && toks[0].value === '(' && toks[toks.length-1].type === 'paren' && toks[toks.length-1].value === ')') {
      return parseExpression(toks.slice(1, toks.length - 1));
    }
    
    const course = toks.find(t => t.type === 'course');
    if (course) return course.value;
    
    return null;
  }

  const result = parseExpression(finalTokens);
  
  if (!result) return [];
  if (result.AND) return result.AND; 
  return [result];
}
