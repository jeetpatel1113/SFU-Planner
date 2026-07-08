import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://www.sfu.ca/bin/wcm/course-outlines';
const TARGET_DEPTS = ['cmpt', 'macm', 'math', 'stat', 'mse', 'ensc', 'iat']; 
const YEAR = '2024';
const TERM = 'fall';

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parsePrerequisites(prereqText) {
  if (!prereqText) return [];
  
  let cleanText = prereqText.replace(/Prerequisite[s]?:/ig, '').trim();
  
  const tokens = [];
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

  const mergedTokens = [];
  let runningText = [];
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

  const finalTokens = [];
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

  function parseExpression(toks) {
    if (toks.length === 0) return null;
    if (toks.length === 1 && toks[0].type === 'course') return toks[0].value;

    let depth = 0;
    let currentGroup = [];
    let andGroups = [];
    
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
    let orGroups = [];
    
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

async function main() {
  console.log(`Fetching courses from SFU API for ${YEAR}/${TERM}...`);
  
  const allCourses = [];
  
  try {
    const deptsResponse = await fetchJson(`${BASE_URL}?${YEAR}/${TERM}`);
    // const TARGET_DEPTS = deptsResponse.map(d => d.value);
    console.log(`Found ${deptsResponse.length} departments. Fetching ${TARGET_DEPTS.length} target departments.`);
    
    for (const dept of TARGET_DEPTS) {
    console.log(`\nFetching department: ${dept.toUpperCase()}`);
    try {
      const courses = await fetchJson(`${BASE_URL}?${YEAR}/${TERM}/${dept}`);
      
      for (const courseObj of courses) {
        const courseNum = courseObj.value;
        const fullId = `${dept.toUpperCase()} ${courseObj.text}`;
        
        try {
          const sections = await fetchJson(`${BASE_URL}?${YEAR}/${TERM}/${dept}/${courseNum}`);
          if (sections.length > 0) {
            const firstSection = sections[0].value;
            const outline = await fetchJson(`${BASE_URL}?${YEAR}/${TERM}/${dept}/${courseNum}/${firstSection}`);
            
            const info = outline.info || {};
            
            const courseData = {
              id: fullId,
              title: info.title || fullId,
              credits: parseFloat(info.units || "3"),
              department: dept.toUpperCase(),
              level: Math.floor(parseInt(courseNum.replace(/\D/g, ''), 10) / 100) * 100 || 100,
              prerequisites: parsePrerequisites(info.prerequisites)
            };
            
            allCourses.push(courseData);
            process.stdout.write('.');
          }
        } catch (err) {
          console.warn(`\nSkipping ${fullId}: ${err.message}`);
        }
        await delay(50);
      }
    } catch (err) {
      console.error(`\nFailed to fetch department ${dept}: ${err.message}`);
    }
    }
  } catch (err) {
    console.error(`Failed to fetch departments: ${err.message}`);
  }

  console.log(`\n\nFetched ${allCourses.length} courses in total.`);
  
  const outputPath = path.join(__dirname, '../src/data/sfuCourses.json');
  await fs.writeFile(outputPath, JSON.stringify(allCourses, null, 2), 'utf-8');
  console.log(`Saved to ${outputPath}`);
}

main().catch(console.error);
