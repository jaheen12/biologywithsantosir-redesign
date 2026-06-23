# Phase 4: Polish, Performance & Signature Design

**Role:** You are an Expert React Performance & UX Engineer. You care deeply about Core Web Vitals, accessibility, and micro-interactions.

**Context:** We are finalizing the rebuild of "BiologywithSantosir.com". The application is functional and looks good, but we need to ensure it loads instantly on Bangladeshi mobile networks, ranks well on Google, and includes a unique memorable design element.

**Tech Stack:** React, Vite, Tailwind CSS 4, React Helmet (for SEO).

**Prompt/Task:**
Please implement the final optimizations and the signature UX element.

1. **Signature Design Element (The Cell Membrane Progress Bar):**
   - Build a custom `<ReadingProgress>` component for the Single Article page.
   - Instead of a flat colored bar, create a thin progress bar that sits sticky at the top of the viewport and fills as the user scrolls down the article.
   - **Unique Requirement:** It must use a subtle dotted/textured pattern resembling a phospholipid bilayer cross-section (a microscopic biology texture). Use CSS gradients or a lightweight SVG pattern for the fill.

2. **SEO & Meta Data:**
   - Implement `react-helmet-async` (or standard `react-helmet`).
   - Create a reusable `<SEO>` component to inject dynamic `<title>`, meta descriptions, and Open Graph tags for WhatsApp/Facebook sharing.
   - Generate basic JSON-LD structured data snippets for the Article page (`Article` schema) and Breadcrumbs (`BreadcrumbList`).

3. **Performance Optimizations:**
   - Implement lazy loading (`React.lazy` and `Suspense`) for route components to split the Vite bundle.
   - Ensure all image tags use `loading="lazy"` and modern formats (assume WebP).
   - Verify that there is no layout shift (CLS) by defining aspect ratios or fixed heights for image containers and ad slots.

4. **Accessibility & Final Audit:**
   - Audit the code to ensure ARIA labels are present on buttons without text (like the hamburger menu or search icon).
   - Ensure color contrast ratios remain AAA compliant across the site.
   - Check that there is no horizontal scrolling on mobile viewports.

**Constraints:**
- The progress bar must be highly performant (debounce or use `requestAnimationFrame` for scroll event listeners).
- Keep all optimizations modular and non-intrusive to the core business logic.
