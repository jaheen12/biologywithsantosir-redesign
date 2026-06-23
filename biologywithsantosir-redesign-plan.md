# BiologywithSantosir.com — Full Redesign Plan
**A complete rebuild blueprint for a modern Bangladeshi biology education platform**

---

## 1. Design Philosophy

The site exists to help Bangladeshi students understand biology — from SSC to Honours level. The redesign should feel like a **well-organized notebook written by a brilliant teacher**: clean, trustworthy, and full of structure. Not clinical like a hospital, not flashy like a gaming site. Authoritative and warm.

**Core principle:** Every design decision should reduce the cognitive load on a student who's already stressed about exams.

---

## 2. Color System

Chosen palette: **Teal-Leaf Green** — inspired by the color of fresh plant cells under a microscope. Not generic emerald, not saturated lime. A calm, intelligent green that reads "science" without shouting.

| Token | Hex | Role |
|---|---|---|
| `--primary` | `#1A7A5E` | Buttons, links, active states, headings accent |
| `--primary-light` | `#E8F5F0` | Section backgrounds, hover fills, tag backgrounds |
| `--primary-mid` | `#2EA87A` | Hover states, borders, icon fills |
| `--accent` | `#F0A500` | Badges, highlights, callout borders (warm amber contrast) |
| `--surface` | `#FFFFFF` | Main background |
| `--surface-alt` | `#F7FAFA` | Alternate section bg, card backgrounds |
| `--text-primary` | `#1A2930` | Body text, headings |
| `--text-secondary` | `#4A6370` | Subtitles, metadata, captions |
| `--text-muted` | `#8FA8B2` | Placeholders, disabled states |
| `--border` | `#DCE8E4` | Card borders, dividers |
| `--error` | `#D94040` | Error messages, warnings |

**Light mode only.** No dark mode toggle — students read for long hours in daylight environments with printed notes beside them. This palette has strong contrast ratios (primary text on white: 10.4:1 — AAA compliant).

---

## 3. Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / Hero headline | `Playfair Display` | 700 | 48–64px |
| Section headings (H2) | `Inter` | 700 | 28–32px |
| Card headings (H3) | `Inter` | 600 | 18–20px |
| Body / prose | `Inter` | 400 | 16px, line-height 1.75 |
| Bangla text | `Hind Siliguri` | 400/600 | 16px |
| Labels / tags / metadata | `Inter` | 500 | 12–13px, uppercase, letter-spacing 0.06em |
| Code / formulas | `JetBrains Mono` | 400 | 14px |

Import from Google Fonts. `Hind Siliguri` renders Bangla cleanly on all devices — better than system fonts on Android.

---

## 4. Current Problems (Diagnosis)

### Navigation
- 15+ top-level menu items in a single navbar row
- URL slugs with percent-encoded Bangla characters (`%E0%A6%AA%E0%A6%B0%`) look broken in copy-paste
- No breadcrumbs inside posts
- Mobile hamburger menu is unstructured

### Homepage
- No clear value proposition above the fold
- Posts listed as a raw WordPress loop — no visual hierarchy
- No instructor credibility signal in the first viewport
- Ads placed mid-hero destroy trust immediately

### Content Pages
- Body text too small on mobile (~13px)
- No table of contents on long articles
- No related posts or "next topic" navigation
- Images without alt text or captions

### Trust & Identity
- Spelling error in tagline ("Expart" → "Expert")
- No student count, review, or result card anywhere
- No clear social media presence or "about" page in navigation
- TutorLMS courses buried under a generic "Course" tab

### Performance
- WordPress with multiple plugins is slow on mobile networks
- No lazy loading visible on homepage images
- No visible caching headers (likely no CDN for Bangladesh)

---

## 5. Sitemap — Rebuilt

```
/                          → Homepage
/about                     → Instructor profile + credentials
/classes/
  /ssc-biology             → SSC Biology hub
  /hsc-zoology             → HSC Zoology hub
  /hsc-botany              → HSC Botany hub
  /honours/
    /3rd-year-zoology      → Honours 3rd Year
    /4th-year-zoology      → Honours 4th Year
/topics/
  /genetics
  /cell-biology
  /physiology
  /microbiology
  /developmental-biology
  /ethology
  /ecology
/notes                     → Free downloadable PDF notes
/mcq                       → MCQ practice (with topic filter)
/courses                   → Paid courses (TutorLMS)
/search                    → Full-text search
/contact
```

**URL structure:** Use English slugs for SEO. Keep Bangla content on-page, not in URLs.
e.g. `/topics/genetics` not `/বিষয়/জেনেটিক্স`

---

## 6. Page-by-Page Redesign

---

### 6.1 Homepage

**Layout concept (desktop, top → bottom):**

```
┌─────────────────────────────────────────────────┐
│ NAVBAR: Logo | Classes ▾ | Topics ▾ | Notes | MCQ | Search 🔍 │
├─────────────────────────────────────────────────┤
│                  HERO SECTION                   │
│   "জীববিজ্ঞান শেখো সহজভাবে, বুঝে বুঝে"        │
│   Subtitle: HSC • SSC • Honours — Bangla medium │
│   [ Start Learning ] [ Browse Notes ]           │
│   ── Stats: 50k+ Students  |  200+ Topics ──   │
├─────────────────────────────────────────────────┤
│           QUICK NAVIGATION CARDS                │
│  [ SSC Bio ] [ HSC Zoo ] [ HSC Bot ] [ Hons ]  │
├─────────────────────────────────────────────────┤
│            LATEST POSTS (3-column grid)         │
│  Card Card Card                                 │
│  Card Card Card                                 │
│  [ See All Posts → ]                           │
├─────────────────────────────────────────────────┤
│             ABOUT THE INSTRUCTOR                │
│  [Photo] Santo Sir | MSc Zoology, DU           │
│         X years teaching | X students passed   │
├─────────────────────────────────────────────────┤
│            POPULAR TOPICS                       │
│  Tag chips: Genetics  Cell Division  Osmosis…  │
├─────────────────────────────────────────────────┤
│  FOOTER: Links | Social | Copyright            │
└─────────────────────────────────────────────────┘
```

**Hero section specifics:**
- Background: `--surface-alt` (#F7FAFA) with a very subtle leaf-cell SVG pattern (opacity 4%)
- Headline in `Playfair Display` 56px, color `--text-primary`
- Green underline accent on key word (জীববিজ্ঞান)
- No ads in the hero. First ad placement: after the 3rd post card.

**Quick navigation cards:**
- 4 cards in a horizontal strip
- Icon (SVG of subject: microscope, cell, plant, DNA strand)
- Label in Bangla + English subtitle
- Background `--primary-light`, border `--primary` on hover
- Tap target: minimum 56px height on mobile

---

### 6.2 Navbar

**Desktop:**
```
[ 🌿 Santo Sir Bio ]  Classes ▾  Topics ▾  Notes  MCQ  Courses  [ 🔍 Search ]
```

**Mobile:**
- Hamburger → slide-in drawer from left
- Classes and Topics expand inline with accordion
- Sticky on scroll with white background + subtle shadow

**Mega dropdown for "Classes":**
```
┌──────────────────────────────────┐
│  School Level   │  College Level  │
│  • SSC Biology  │  • HSC Zoology  │
│                 │  • HSC Botany   │
│  University     │                 │
│  • Hons 3rd Yr  │                 │
│  • Hons 4th Yr  │                 │
└──────────────────────────────────┘
```

No more 15-item flat list.

---

### 6.3 Post/Article Page

**Layout:**

```
┌──────────────────────────────────────────────────┐
│ BREADCRUMB: Home > Topics > Genetics             │
│                                                  │
│ H1: জেনেটিক্স কী? সংজ্ঞা, ইতিহাস ও গুরুত্ব    │
│ Meta: Santo Sir | June 2026 | 8 min read | SSC  │
│ Tags: [Genetics] [Cell Biology]                  │
├────────────────────┬─────────────────────────────┤
│  TABLE OF CONTENTS │  ARTICLE BODY               │
│  (sticky sidebar)  │  Inter 16px, 1.75 line-ht   │
│                    │  Section H2s with green      │
│  1. সংজ্ঞা         │  left-border accent          │
│  2. ইতিহাস         │                              │
│  3. গুরুত্ব        │  [Callout boxes for key      │
│  4. উদাহরণ         │   definitions — amber bg]    │
│                    │                              │
│                    │  Images with captions        │
│                    │  in italic, centered         │
├────────────────────┴─────────────────────────────┤
│  RELATED POSTS: 3 cards from same topic          │
│  NEXT: [ ← Previous Topic ] [ Next Topic → ]    │
└──────────────────────────────────────────────────┘
```

**Key improvements:**
- Sticky table of contents (desktop sidebar, mobile top collapsible)
- Reading progress bar at top (thin green line)
- Highlight boxes for definitions: `--accent` left-border, `--primary-light` background
- Font size 17px on desktop, 16px mobile — never smaller
- Images: max-width 100%, with caption below in `--text-secondary`

---

### 6.4 Topic Hub Page (e.g. /topics/genetics)

```
┌──────────────────────────────────────────────────┐
│ H1: জেনেটিক্স (Genetics)                        │
│ Short intro paragraph (2-3 sentences)            │
├──────────────────────────────────────────────────┤
│ FILTER: [ All ] [ SSC ] [ HSC ] [ Honours ]     │
├──────────────────────────────────────────────────┤
│  POST GRID                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │Card  │ │Card  │ │Card  │                    │
│  │Title │ │Title │ │Title │                    │
│  │Level │ │Level │ │Level │                    │
│  └──────┘ └──────┘ └──────┘                    │
│  (3 col desktop, 2 col tablet, 1 col mobile)   │
└──────────────────────────────────────────────────┘
```

Level badges on cards:
- SSC: blue badge
- HSC: green badge
- Honours: purple badge

---

### 6.5 MCQ Practice Page

```
┌──────────────────────────────────────────────────┐
│ H1: MCQ Practice                                 │
│ FILTER: Topic | Level | Chapter                  │
├──────────────────────────────────────────────────┤
│  Question 1 of 20                               │
│  ┌────────────────────────────────────────────┐ │
│  │ কোষ বিভাজনের কোন দশায় ক্রোমোজোম বিষুব   │ │
│  │ রেখায় সাজে?                               │ │
│  │                                            │ │
│  │  ○ প্রোফেজ    ○ মেটাফেজ                  │ │
│  │  ○ অ্যানাফেজ  ○ টেলোফেজ                  │ │
│  └────────────────────────────────────────────┘ │
│  [ Submit Answer ]                              │
│  ── Progress: ████████░░ 8/20 ──              │
└──────────────────────────────────────────────────┘
```

Answer reveals explanation text with green (correct) or red (wrong) highlight. No page reload — pure JS.

---

## 7. Component Library

### Card Component
```
┌───────────────────────────────┐
│  [Category badge — green]     │
│                               │
│  Post Title in Inter 600      │
│  18px, 2-line clamp           │
│                               │
│  Short excerpt, 2 lines max   │
│  text-secondary, 14px         │
│                               │
│  Santo Sir · Jun 2026 · 5 min │
└───────────────────────────────┘
```
- Border: 1px `--border`
- Border-radius: 10px
- Hover: border-color `--primary`, translateY(-2px), shadow
- No thumbnail image unless available (fallback: colored gradient with topic icon)

### Callout / Definition Box
```
┌─ [amber left border 4px] ───────────────────────┐
│  💡 সংজ্ঞা                                       │
│  জেনেটিক্স হলো জীববিজ্ঞানের সেই শাখা যা...     │
└──────────────────────────────────────────────────┘
```
Background: `#FFF8E8`, border-left: 4px solid `--accent`

### Tag / Badge
```
[ জেনেটিক্স ]  ← rounded pill, --primary-light bg, --primary text, 12px
```

### Level Badge
```
[ SSC ]      ← blue: #1565C0 on #E3F2FD
[ HSC ]      ← green: #1A7A5E on #E8F5F0  
[ Honours ]  ← purple: #6A1B9A on #F3E5F5
```

---

## 8. Navigation Information Architecture

**Before (flat list of 15+ items):**
Home, জীববিজ্ঞান, কোষ বিভাজন, জেনেটিক্স, বিবর্তন, অভিযোজন, পরিবেশ, সমন্বয়, রেচন, পরিপাক... (no grouping)

**After (2-level grouped structure):**

Primary nav: Classes | Topics | Notes | MCQ | Courses | Search

Dropdown — Classes:
- School: SSC Biology
- College: HSC Zoology, HSC Botany
- University: Honours 3rd Year, Honours 4th Year

Dropdown — Topics:
- Cell Biology, Genetics, Physiology
- Microbiology, Ecology, Ethology
- Developmental Biology, Evolution

Footer nav (secondary): About, Contact, Privacy Policy, Sitemap

---

## 9. Mobile-First Rules

- Minimum tap target: 48×48px
- Sticky navbar height: 56px max
- Article body: padding 16px horizontal
- No horizontal scroll anywhere
- Font size: never below 14px (labels), 16px for body
- Images: lazy-loaded, max-width: 100%
- TOC: collapsed by default on mobile, expandable
- Ads: maximum 1 ad per screen height; never between a question and its answer

---

## 10. SEO & Performance Targets

| Metric | Current (estimated) | Target |
|---|---|---|
| Lighthouse Performance | ~45–55 | 85+ |
| LCP (mobile) | ~4.5s | < 2.5s |
| CLS | unknown | < 0.1 |
| Core Web Vitals | Failing | All Green |

**Improvements to achieve this:**
- Serve WebP images (convert all JPGs/PNGs via build step)
- Enable Redis object cache or W3 Total Cache on WordPress
- Move Google Fonts to locally hosted (self-host with `@font-face`)
- Lazy load images below the fold with `loading="lazy"`
- Defer non-critical JS
- Add structured data (JSON-LD) for `Article`, `BreadcrumbList`, `FAQPage` on relevant posts
- Meta descriptions on every post (currently missing on many)
- Open Graph tags for WhatsApp/Facebook sharing (students share posts heavily)

---

## 11. Trust & Credibility Signals

Things to add that are currently missing:

**Above the fold:**
- Instructor name and photo visible in navbar or hero (not buried in footer)
- Student count or a simple "200+ posts free" signal

**About page (create/improve):**
- Instructor photo
- Academic credentials (MSc, institution, year)
- Teaching experience in years
- Result statistics if available ("X students passed HSC 2024")

**Post pages:**
- Author byline with photo every post
- Last updated date (trust signal for accuracy)
- "Reviewed for [curriculum year]" badge

**Social proof:**
- 2–3 student quotes on homepage
- Facebook group member count (if 1000+, display it)
- YouTube subscriber count if applicable

**Fix immediately:**
- Typo: "Expart" → "Expert" in tagline/meta

---

## 12. Implementation Roadmap

### Phase 1 — Foundation (Week 1–2)
- Fix tagline typo
- Reorganize navigation (reduce to 2-level structure)
- Set up correct URL structure (English slugs)
- Initialize Git repository and link to GitHub using GitHub CLI (`gh`)
- Initialize Vite + React project with Tailwind CSS 4
- Apply color tokens as CSS custom properties or Tailwind config
- Set up Supabase project (Database, Auth, Storage)

### Phase 2 — Core Pages (Week 3–4)
- Rebuild homepage with hero, quick nav cards, post grid
- Build topic hub template
- Improve single post template: TOC, callout boxes, related posts
- Add breadcrumbs to all pages
- Create About page with instructor profile

### Phase 3 — Features (Week 5–6)
- Build MCQ practice page (React state + Supabase DB)
- Add Notes/PDF download page with filters (Supabase Storage)
- Implement search with filters (Client-side fuse.js or Supabase text search)

### Phase 4 — Polish & Performance (Week 7–8)
- Image optimization (WebP conversion, lazy loading)
- Font self-hosting
- SEO setup (React Helmet)
- Structured data / JSON-LD
- Open Graph meta tags
- Mobile audit and fix
- Lighthouse testing and iteration

---

## 13. Tools & Stack Recommendation

| Need | Recommended Tool |
|---|---|
| Version Control | Git + GitHub (via GitHub CLI `gh`) |
| Frontend Framework | React + Vite |
| Styling | Tailwind CSS 4 |
| Backend & Auth | Supabase |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage (for PDFs and Images) |
| Bengali font | Hind Siliguri via Google Fonts (self-hosted) |
| SEO | React Helmet Async |
| Search | Fuse.js (Client-side) or Supabase Full Text Search |
| Forms / MCQ | Custom React Components + Supabase |
| Analytics | Google Analytics 4 + Google Search Console |
| Deployment | Vercel or Cloudflare Pages |

---

## 14. What NOT to Do

- Do not use a dark theme — students read with notebooks open under light
- Do not add unnecessary npm dependencies — keep the bundle size small
- Do not use heavy component libraries, stick to custom Tailwind components
- Do not put ads in the middle of biology explanations
- Do not use percent-encoded Bangla in URLs
- Do not keep the mega flat menu — it overwhelms new visitors
- Do not launch without fixing the tagline typo first

---

## 15. Signature Design Element

The one thing that will make this site memorable:

**A green "cell membrane" progress indicator.** Every article page has a thin progress bar at the top that fills as you scroll. But instead of a generic flat bar, it uses a subtle dotted pattern (like a phospholipid bilayer cross-section at 1x magnification) — a microscopic biology texture that only someone who loves biology would recognize. It's functional, contextual, and completely specific to this site's subject matter. Students will notice it. It won't feel like any other education site.

---

*Plan prepared June 2026. All color values, font choices, and layout decisions are specific to BiologywithSantosir.com's audience, subject, and Bangladeshi context.*
