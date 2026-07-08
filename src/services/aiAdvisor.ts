import { type Course } from "../types";

export async function askAIAdvisor(
  userQuery: string,
  catalog: Course[],
  draftCourses: string[],
  completedCourses: string[],
  aiContext: string
): Promise<{ 
  reply: string; 
  suggestedCourses: string[]; 
  highlightedCourses: string[]; 
  updatedAiContext: string | null;
  resetPlanner: boolean;
  removeCourses: string[];
  markCompleted: string[];
  unmarkCompleted: string[];
  pathway: string[][] | null;
}> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env.local file.');
  }

  const catalogContext = catalog.map(c => `- ${c.id}: ${c.title} (Credits: ${c.credits})`).join('\n');
  
  const systemPrompt = `You are a helpful and expert academic advisor for Computing Science students at Simon Fraser University (SFU). Your job is to answer questions and intelligently recommend courses based on the student's query and the actual course catalog available.

CRITICAL SFU B.Sc COMP SCI GRADUATION REQUIREMENTS:
- Total Course Credits needed: 120 minimum.
- Upper Division (300/400 level) Credits: 45 minimum.
- WQB Requirements: 6 credits Writing (W), 6 credits Quantitative (Q), and 24 credits Breadth (B) (8 B-Hum, 8 B-Soc, 8 B-Sci).
- Standard CMPT Core usually includes: CMPT 105W, 120, 125, MACM 101, MACM 201, CMPT 225, 276/275, 295, 300, 307.
You MUST actively verify whether the student's selections help fulfill these core B.Sc requirements. Advise them appropriately if their path neglects required upper division or core credits.

Here is your running hidden memory profile about this student (update this as you learn new things about their preferences):
<Student Background>
${aiContext || "No background known yet. You are just meeting them."}
</Student Background>

Here is the current academic state of the student:
Completed Courses: ${completedCourses.length > 0 ? completedCourses.join(', ') : 'None'}
Currently Drafted Courses: ${draftCourses.length > 0 ? draftCourses.join(', ') : 'None'}

Here is the full catalog of available CMPT courses at SFU:
${catalogContext}

Instructions:
1. Provide a friendly, conversational response giving the best academic advice according to the student's question. Keep it concise.
2. YOU MUST ALWAYS include a JSON block at the very end of your response surrounded by \`\`\`json \`\`\` if you recommend ANY courses to be added to their drafted schedule, if you want to highlight/focus their attention on specific courses, if you want to perform actions (like erasing the board, removing courses, or marking courses as completed), OR if you learn something new about their preferences and want to save it to your memory. The JSON must have exactly this format (include only the fields you wish to use, but use these exact keys):
{
  "updatedAiContext": "Student explicitly prefers avoiding morning classes. Very interested in Data Science concentration. Plans to graduate in 2026.",
  "highlightedCourses": ["CMPT 130"],
  "suggestedCourses": ["CMPT 120", "CMPT 125"],
  "removeCourses": ["CMPT 105W"],
  "markCompleted": ["MACM 101"],
  "unmarkCompleted": ["CMPT 120"],
  "resetPlanner": true
}
- "suggestedCourses": adds to drafting pool.
- "highlightedCourses": visually spotlights courses.
- "removeCourses": removes courses from their planner/draft pool.
- "markCompleted": sets courses as completed.
- "unmarkCompleted": removes courses from completed list.
- "resetPlanner": completely erases all drafted courses and semesters (use this if they ask to clear their planner, start over, or erase all courses).
- "pathway": an array of 8 arrays, representing the courses they should take in Semesters 1 through 8. Only include this if they explicitly ask you to generate their full degree pathway.
Only output course IDs that exist in the catalog above. Do not suggest courses they have already completed or currently have drafted, unless specifically asked.
`;

  const payload = {
    contents: [{ parts: [{ text: systemPrompt + "\n\nStudent: " + userQuery }] }]
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error("AI Advisor API Error:", response.status, errorText);
    throw new Error(`Failed to communicate with AI Advisor (${response.status}). Keep trying or verify your API key.`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request.";

  // Extract JSON if present
  let suggestedCourses: string[] = [];
  let highlightedCourses: string[] = [];
  let removeCourses: string[] = [];
  let markCompleted: string[] = [];
  let unmarkCompleted: string[] = [];
  let resetPlanner: boolean = false;
  let updatedAiContext: string | null = null;
  let pathway: string[][] | null = null;
  let reply = text;
  
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed.suggestedCourses)) {
        suggestedCourses = parsed.suggestedCourses;
      }
      if (Array.isArray(parsed.highlightedCourses)) {
        highlightedCourses = parsed.highlightedCourses;
      }
      if (typeof parsed.updatedAiContext === 'string') {
        updatedAiContext = parsed.updatedAiContext;
      }
      if (Array.isArray(parsed.removeCourses)) {
        removeCourses = parsed.removeCourses;
      }
      if (Array.isArray(parsed.markCompleted)) {
        markCompleted = parsed.markCompleted;
      }
      if (Array.isArray(parsed.unmarkCompleted)) {
        unmarkCompleted = parsed.unmarkCompleted;
      }
      if (typeof parsed.resetPlanner === 'boolean') {
        resetPlanner = parsed.resetPlanner;
      }
      if (Array.isArray(parsed.pathway)) {
        pathway = parsed.pathway;
      }
      // Remove the json block from the visible reply
      reply = text.replace(jsonMatch[0], '').trim();
    } catch (e) {
      console.error("Failed to parse JSON from AI response", e);
    }
  }

  return { 
    reply, 
    suggestedCourses, 
    highlightedCourses, 
    updatedAiContext,
    resetPlanner,
    removeCourses,
    markCompleted,
    unmarkCompleted,
    pathway
  };
}
