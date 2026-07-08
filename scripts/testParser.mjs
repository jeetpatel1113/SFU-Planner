// Advanced Prerequisite Parser
export function parsePrerequisites(prereqText) {
  if (!prereqText) return [];
  
  // Clean up the text
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

const tests = [
  "CMPT 225 and (MACM 101 or (ENSC 251 and ENSC 252)), all with a minimum grade of C-.",
  "Prerequisite: MATH 152 or 155 or 158, and MATH 232 or 240, and computing experience",
  "CMPT 120",
  "CMPT 125 or 135",
  "MATH 151; MATH 152"
];

for (const t of tests) {
  console.log(`\nText: ${t}`);
  console.log(JSON.stringify(parsePrerequisites(t), null, 2));
}
