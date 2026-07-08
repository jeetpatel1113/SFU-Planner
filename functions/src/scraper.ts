import axios from 'axios';

const BASE_URL = 'http://www.sfu.ca/bin/apps/course-outlines';

export interface RawCourseOutline {
  info: {
    dept: string;
    number: string;
    title: string;
    units: string;
    prerequisites?: string;
    corequisites?: string;
  };
}

export const fetchDepartments = async (year: string, term: string) => {
  const res = await axios.get(`${BASE_URL}?${year}/${term}`);
  return res.data as { text: string; value: string }[];
};

export const fetchCoursesForDept = async (year: string, term: string, dept: string) => {
  const res = await axios.get(`${BASE_URL}?${year}/${term}/${dept}`);
  return res.data as { text: string; value: string }[];
};

export const fetchCourseSections = async (year: string, term: string, dept: string, course: string) => {
  const res = await axios.get(`${BASE_URL}?${year}/${term}/${dept}/${course}`);
  return res.data as { text: string; value: string }[];
};

export const fetchCourseOutline = async (year: string, term: string, dept: string, course: string, section: string) => {
  const res = await axios.get(`${BASE_URL}?${year}/${term}/${dept}/${course}/${section}`);
  return res.data as RawCourseOutline;
};

// Extremely basic parser for "COURSE 100 and COURSE 200" or "COURSE 100, 200 or 300"
export const parsePrerequisites = (text: string | undefined): any[] => {
  if (!text) return [];
  
  // Clean up text
  let cleanText = text.replace(/prerequisite:?/i, '').trim();
  
  // Extract all course codes
  const courseMatches = cleanText.match(/[A-Z]{3,4}\s\d{3}[A-Z]?/g);
  if (!courseMatches) return [];
  
  // For a truly robust system, an LLM or AST parser is needed here.
  // For this initial scraper, we will just return them as a flat implicit AND list 
  // or a single OR object if the word 'or' is highly prevalent, to avoid breaking the graph logic.
  // A perfect parser is a massive undertaking, so we provide a safe fallback.
  
  if (cleanText.toLowerCase().includes(' or ')) {
     return [{ OR: Array.from(new Set(courseMatches)) }];
  }
  
  return Array.from(new Set(courseMatches));
};

export const scrapeAllCourses = async (year: string, term: string) => {
  console.log(`Starting SFU Scrape for ${year} ${term}...`);
  const coursesData: any[] = [];
  
  try {
    const depts = await fetchDepartments(year, term);
    console.log(`Found ${depts.length} departments.`);
    
    // For demo/performance purposes we might limit this, but the goal is "all courses"
    // To avoid hitting API rate limits instantly, we use a slower sequential/batched approach
    for (const dept of depts) {
      console.log(`Scraping dept: ${dept.value}`);
      try {
        const courses = await fetchCoursesForDept(year, term, dept.value);
        
        for (const course of courses) {
          try {
            const sections = await fetchCourseSections(year, term, dept.value, course.value);
            if (sections.length > 0) {
              // Just grab the first section to get the outline info
              const firstSection = sections[0].value;
              const outline = await fetchCourseOutline(year, term, dept.value, course.value, firstSection);
              
              const info = outline.info;
              coursesData.push({
                id: `${info.dept.toUpperCase()} ${info.number}`,
                title: info.title,
                credits: parseInt(info.units) || 3,
                department: info.dept.toUpperCase(),
                level: Math.floor(parseInt(info.number.replace(/\D/g,'')) / 100) * 100 || 100,
                prerequisitesRaw: info.prerequisites || "",
                prerequisites: parsePrerequisites(info.prerequisites)
              });
            }
          } catch (e) {
            console.error(`Error fetching course ${dept.value} ${course.value}`);
          }
          // Sleep slightly to respect rate limits
          await new Promise(r => setTimeout(r, 100));
        }
      } catch (e) {
        console.error(`Error fetching dept ${dept.value}`);
      }
    }
  } catch (err) {
    console.error("Failed to scrape SFU API:", err);
  }
  
  return coursesData;
};
