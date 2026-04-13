# SFU AI Course Planner 🎓🤖

A beautifully crafted, highly interactive course mapping application built specifically for **Simon Fraser University Computing Science** students. This app replaces the traditional spreadsheet by integrating an interactive prerequisite graph, a drag-and-drop semester draft, and a dedicated AI Advisor to guide graduation mapping.

## ✨ Features

- **Interactive Curriculum Graph (`@xyflow/react`)**: Forget reading text prerequisites. Watch your entire degree unfold dynamically in a buttery-smooth pan-and-zoom graph. Unlocked courses light up based on your progression.
- **Generative AI Advisor Setup**: Powered by **Google Gemini 1.5**, this platform features a built-in AI expert that inherently understands SFU B.Sc CMPT graduation requirements.
  - 🤖 **Auto-Drafting**: If the AI suggests courses, it physically pushes them onto your visible planner board.
  - 🔦 **AI Spotlight**: The AI has control over the graph's camera. If it mentions specific classes, those nodes physically glow pink and the camera dynamically auto-zooms to spotlight them.
- **Live Tooltips API**: Hovering over any class fires a rapid sub-second query to the **SFU Academic Calendar API** to securely grab and cache live course descriptions immediately inside a sleek glassmorphic popup.
- **Persistent Local State (`zustand`)**: Everything you do—your customized semesters, your completed courses, your selected AI states—is persistently cached locally in the browser. 

## 🚀 Setup & Installation

Follow these steps to run the application locally:

1. **Clone the repository:**
   ```bash
   git clone git@github.com:jeetpatel1113/SFU-Planner.git
   cd SFU-Planner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the Environment:**
   To power the AI Advisor, you need a Google Gemini API Key.
   Create a `.env.local` file in the root of the project:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch the Dev Server:**
   ```bash
   npm run dev
   ```

## 🛠️ Technology Stack
- **Frontend Framework**: React 19 (Vite)
- **Language**: TypeScript
- **State Management**: Zustand
- **Graphics/Visuals**: Tailwind CSS, React Flow (xyflow), Lucide Icons
- **AI Integration**: Google Gemini REST API

*(Note: Course Catalog data loaded natively tracks ~150+ Computing Science courses. External API connectivity is utilized explicitly for description fetching and LLM traversal).*
