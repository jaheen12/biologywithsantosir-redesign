# Phase 1: Foundation Setup

**Role:** You are an Expert Frontend Developer specializing in React, Vite, Tailwind CSS 4, and Supabase. You write clean, modular, and highly maintainable code.

**Context:** We are rebuilding "BiologywithSantosir.com", a modern Bangladeshi biology education platform. The site exists to help Bangladeshi students understand biology (SSC to Honours level). The design should feel like a "well-organized notebook written by a brilliant teacher": clean, trustworthy, and full of structure. We are migrating to a modern, fast React application with Supabase as the backend.

**Tech Stack:** React, Vite, Tailwind CSS 4, React Router DOM, Lucide React (for icons), Supabase (`@supabase/supabase-js`), Git & GitHub CLI (`gh`).

**Prompt/Task:**
Please set up the foundational layer of the application. Focus on modularity so the code can be easily fixed, improved, or changed later.

1. **Project Initialization:**
   - Initialize a local Git repository (`git init`) and use the GitHub CLI (`gh repo create`) to push the initial setup to a new remote repository.
   - Scaffold a new React application using Vite.
   - Install and configure Tailwind CSS 4.
   - Install `@supabase/supabase-js` and initialize the Supabase client (`src/lib/supabase.ts`) using environment variables.

2. **Design System & Tailwind Configuration:**
   - Implement the "Teal-Leaf Green" color palette. Define these as CSS variables or in the Tailwind theme:
     - `--primary`: `#1A7A5E`
     - `--primary-light`: `#E8F5F0`
     - `--primary-mid`: `#2EA87A`
     - `--accent`: `#F0A500`
     - `--surface`: `#FFFFFF`
     - `--surface-alt`: `#F7FAFA`
     - `--text-primary`: `#1A2930`
     - `--text-secondary`: `#4A6370`
     - `--text-muted`: `#8FA8B2`
     - `--border`: `#DCE8E4`
     - `--error`: `#D94040`
   - Configure typography (import from Google Fonts):
     - Display/Hero: `Playfair Display`
     - Headings & UI: `Inter`
     - Bangla text: `Hind Siliguri`
     - Code/Formulas: `JetBrains Mono`

3. **Routing Setup:**
   - Set up `react-router-dom`.
   - Define the following routes with placeholder components (just empty `div`s with titles for now):
     - `/` (Home)
     - `/about`
     - `/classes/*` (Hub for classes)
     - `/topics/*` (Hub for topics)
     - `/notes`
     - `/mcq`
     - `/courses`
     - `/search`

4. **Base UI Components (Modular UI Kit):**
   - Create a reusable `<Button>` component (with primary, secondary, and outline variants).
   - Create a reusable `<Badge>` component (e.g., for Topic tags and Level tags like SSC, HSC).
   - Create a basic `<Container>` layout wrapper for consistent max-width and padding.

**Constraints:**
- Build mobile-first.
- Do NOT use dark mode (the palette is light mode only for readability during study).
- Keep components modular in a `src/components` directory.
