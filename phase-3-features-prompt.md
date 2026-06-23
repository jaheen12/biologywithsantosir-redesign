# Phase 3: Interactive Features & Backend Integration

**Role:** You are an Expert React Developer with a strong focus on state management, interactive UI, performance, and Supabase integration.

**Context:** The core pages for "BiologywithSantosir.com" are built. We now need to implement the interactive educational features that will engage students, specifically the MCQ practice engine and robust search functionality, pulling real data from Supabase.

**Tech Stack:** React, Vite, Tailwind CSS 4, React Hooks, Supabase (`@supabase/supabase-js`), Fuse.js (optional, or Supabase full-text search).

**Prompt/Task:**
Please build the interactive features, connecting them to Supabase where appropriate.

1. **MCQ Practice Engine (`/mcq`):**
   - Build an interactive Multiple Choice Question component.
   - **Features needed:**
     - A topic/level filter at the top.
     - Display one question at a time (e.g., "Question 1 of 20").
     - 4 selectable options.
     - A "Submit Answer" button.
     - Pure JS state (no page reload) for the quiz session.
     - Upon submission, reveal an explanation text highlighting the correct answer (green) or wrong answer (red).
     - A visual progress bar at the bottom.
   - **Backend Integration:** Fetch the MCQ questions from a Supabase `mcqs` table based on the selected topic/level filter.

2. **Notes & PDF Hub (`/notes`):**
   - Create a page to list downloadable resources.
   - Include category filters (SSC, HSC, Honours).
   - **Backend Integration:** Fetch the list of available notes from a Supabase `notes` table. The actual PDF files should be hosted in a Supabase Storage bucket (`pdfs`). Build the UI to display these and provide a "Download" button linking to the Supabase public URL.

3. **Search Implementation (`/search`):**
   - Implement a search interface (can be a dedicated page or a large modal).
   - You can either use a lightweight fuzzy search library like `fuse.js` (fetching all titles from Supabase on load) OR utilize Supabase's full-text search capabilities.
   - Display real-time search results categorized by 'Topics' and 'Posts'.

**Constraints:**
- Maintain the "Teal-Leaf Green" aesthetic.
- Ensure the MCQ interface is highly usable on mobile devices (large tap targets for options).
- Handle Supabase loading states and errors gracefully (e.g., "Loading questions...", "Failed to load").
