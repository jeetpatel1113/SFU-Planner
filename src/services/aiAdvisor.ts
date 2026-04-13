import { type Course } from "../types";

export async function askAIAdvisor(
  userQuery: string,
  catalog: Course[],
  draftCourses: string[],
  completedCourses: string[]
): Promise<{ reply: string; suggestedCourses: string[]; highlightedCourses: string[] }> {
  // @ts-expect-error - Vite handled meta env
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

Here is the current state of the student:
Completed Courses: ${completedCourses.length > 0 ? completedCourses.join(', ') : 'None'}
Currently Drafted Courses: ${draftCourses.length > 0 ? draftCourses.join(', ') : 'None'}

Here is the full catalog of available CMPT courses at SFU:
${catalogContext}

Instructions:
1. Provide a friendly, conversational response giving the best academic advice according to the student's question. Keep it concise.
2. YOU MUST ALWAYS include a JSON block at the very end of your response surrounded by \`\`\`json \`\`\` if you recommend ANY courses to be added to their drafted schedule OR if you want to highlight/focus their attention on specific courses. The JSON must have exactly this format:
{
  "highlightedCourses": ["CMPT 130"],
  "suggestedCourses": ["CMPT 120", "CMPT 125"]
}
Include "suggestedCourses" only if you want the app to automatically draft those courses into their planner. Include "highlightedCourses" if you strictly want to visually spotlight courses for them to look at on the graph. (You may use both).
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
      // Remove the json block from the visible reply
      reply = text.replace(jsonMatch[0], '').trim();
    } catch (e) {
      console.error("Failed to parse JSON from AI response", e);
    }
  }

  return { reply, suggestedCourses, highlightedCourses };
}
