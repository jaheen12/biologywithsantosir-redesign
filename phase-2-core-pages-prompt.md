# Phase 2: Core Layout & Pages

**Role:** You are an Expert Frontend Developer specializing in React, Vite, Tailwind CSS 4, and Supabase. You excel at building responsive, accessible layouts and modular component architectures.

**Context:** We are continuing the rebuild of "BiologywithSantosir.com". The foundational React + Vite + Tailwind 4 setup with Supabase is complete. Now, we need to build the primary user interfaces. The design must be clean, reduce cognitive load, and utilize the Teal-Leaf Green color system. 

**Tech Stack:** React, Vite, Tailwind CSS 4, React Router DOM, Lucide React, Supabase.

**Prompt/Task:**
Please build the core layout and main pages. Ensure all components are modular and reusable. Create hooks to fetch data from Supabase.

1. **Global Layout & Navigation:**
   - Create a `<Layout>` component wrapping all pages.
   - **Navbar:** 
     - Desktop: Logo, Mega-dropdown for Classes, Dropdown for Topics, standard links (Notes, MCQ, Courses), and a Search button.
     - Mobile: Hamburger menu opening a slide-in drawer from the left. Sticky on scroll.
   - **Footer:** Simple footer with secondary links, social links, and copyright.

2. **Homepage (`/`):**
   - **Hero Section:** Headline ("জীববিজ্ঞান শেখো সহজভাবে, বুঝে বুঝে"), subtitle, CTA buttons, and basic stats. Background should use the `--surface-alt` color.
   - **Quick Navigation Cards:** A horizontal row of 4 cards (SSC Bio, HSC Zoo, HSC Bot, Hons) with icons.
   - **Latest Posts Grid:** A 3-column grid of reusable `<PostCard>` components. Create a custom hook `useLatestPosts` to fetch the 6 most recent articles from the Supabase `posts` table.
   - **Instructor Snippet:** A section introducing Santo Sir with credentials.

3. **Topic Hub Page (`/topics/:topicId`):**
   - H1 Title and short description.
   - Filter buttons (All, SSC, HSC, Honours).
   - A responsive grid of `<PostCard>` components. Fetch the related posts from Supabase based on the `topicId`.

4. **Single Article Page (`/topics/:topicId/:slug`):**
   - Fetch the full article content from the Supabase `posts` table using the `slug`.
   - Breadcrumb navigation component.
   - Article Header (H1, Meta info: Author, Date, Read time, Tags).
   - **Layout:** Sticky Table of Contents (sidebar on desktop, collapsible top on mobile) and main Article Body.
   - Implement a `<Callout>` component for definitions.
   - Post content styling: `Inter` 16px, 1.75 line-height.

**Constraints:**
- Ensure minimum tap targets of 48x48px for mobile.
- Use the CSS variables defined in Phase 1.
- Build isolated, modular components.
- Handle Supabase loading states with skeleton loaders or spinners.
