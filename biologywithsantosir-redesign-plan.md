# BiologywithSantosir.com — Full Redesign Plan (v2)
**A complete rebuild blueprint for a modern Bangladeshi biology education platform**

> **Stack snapshot (as of June 2026):** Next.js **16.2.9** · React **19** · Tailwind CSS **4** · Supabase · TypeScript · Vercel

---

## 1. Design Philosophy

The site exists to help Bangladeshi students understand biology — from SSC to Honours level. The redesign should feel like a **well-organized notebook written by a brilliant teacher**: clean, trustworthy, and full of structure. Not clinical like a hospital, not flashy like a gaming site. Authoritative and warm.

**Core principle:** Every design decision should reduce the cognitive load on a student who is already stressed about exams.

**Secondary principle:** The site must be fast on a 4G mobile connection in Bangladesh. A 3-second load on Dhaka's network is a bounce. Every KB counts.

---

## 2. Color System

Chosen palette: **Teal-Leaf Green** — inspired by the color of fresh plant cells under a microscope. Not generic emerald, not saturated lime. A calm, intelligent green that reads "science" without shouting.

| Token | Hex | Role |
|---|---|---|
| `--primary` | `#1A7A5E` | Buttons, links, active states, heading accents |
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

### Font Role Assignments

| Role | Font | Fallback | Why |
|---|---|---|---|
| English body text | **Inter** | sans-serif | Clean, modern sans-serif for comfortable reading |
| Bangla body text | **Tiro Bangla** | Noto Serif Bengali, serif | Elegant stroke weight; warm serif contrast |
| H1 – H6 headings | **Inter** | Hind Siliguri, sans-serif | Clean, neutral, modern layout headings |
| UI: nav, buttons, labels | **Inter** | Hind Siliguri, sans-serif | Clean, neutral, functional |
| Inline code / formulas | **JetBrains Mono** | ui-monospace, monospace | Monospaced clarity |

> **Design rationale:** English text uses Inter globally for body, headings, and UI to maintain a cohesive, clean, modern aesthetic. Bangla content preserves a rich serif warm tone for body copy (Tiro Bangla / Noto Serif) and Hind Siliguri (sans-serif) for headings and UI.

### CSS Implementation

```css
/* Body: English sans-serif + Bangla serif warmth */
body {
  font-family: var(--font-inter), var(--font-tiro), var(--font-noto), sans-serif;
}

/* Headings & UI elements */
h1, h2, h3, h4, h5, h6,
button, input, select, textarea, label, .font-ui, .font-hero {
  font-family: var(--font-inter), var(--font-hind), sans-serif;
}

/* Article prose (English + Bangla mixed) */
.prose-bio {
  font-family: var(--font-inter), var(--font-tiro), var(--font-noto), sans-serif;
}

/* Bangla-only prose blocks */
.prose-bn {
  font-family: var(--font-tiro), var(--font-noto), var(--font-hind), serif;
}
```

### Type Scale (17px base — `html { font-size: 17px }`)

| Element | Font | Size | Line-height |
|---|---|---|---|
| H1 | Inter 700 | `clamp(2.25rem, 5.5vw, 4rem)` ≈ 38–68px | 1.15 |
| H2 | Inter 700 | `clamp(1.75rem, 3.5vw, 2.5rem)` ≈ 30–42px | 1.2 |
| H3 | Inter 600 | `clamp(1.375rem, 2.5vw, 1.75rem)` ≈ 23–30px | 1.3 |
| H4 | Inter 600 | `1.3125rem` (22px) | — |
| H5 | Inter 600 | `1.125rem` (19px) | — |
| H6 | Inter 600 | `1rem` (17px), `text-secondary` | — |
| Body / prose (English) | Inter 400 | `1rem` (17px) | 1.85 |
| Article prose (`.prose-bio`) | Inter 400 | `1.125rem` (~19px) | 1.9 |
| Bangla body (`.prose-bn`) | Tiro Bangla 400 | `1.0625rem` (~18px) | 2.0 |
| Nav / buttons / labels | Inter 400–700 | varies, min `0.75rem` | — |
| Badges / eyebrows | Inter 700 uppercase | `0.75rem` (~12.75px) | — |
| Inline code | JetBrains Mono 400 | `0.9em` (~15px min) | — |
| Code blocks (`pre`) | JetBrains Mono 400 | `0.9375rem` (~16px) | 1.7 |
| Table cells | inherits body | `1rem` (17px) | 1.6 |
| Figure captions | Inter 400 italic | `0.9375rem` (~16px) | 1.55 |

**Paragraph color:** `--text-primary` (#1A2930) — 10.4:1 contrast (AAA). `--text-secondary` reserved for metadata, captions, and timestamps only.

Load via `next/font/google` (zero CLS, self-hosted at build time). **Do NOT use a `<link>` tag in `_document`** — that pattern is deprecated in Next.js App Router.

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
- Spelling error in tagline ("Expart" → "Expert") — **fix this first**
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
/topics/                   → All topics index
  /[topicSlug]             → Topic hub (e.g. /topics/genetics)
    /[postSlug]            → Single article
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
- Headline in `Inter` 56px, color `--text-primary`
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
[ 🌿 Santo Sir Biology ]  Classes ▾  Topics ▾  Notes  MCQ  Courses  [ 🔍 Search ]
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

### 6.3 Post / Article Page

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
- Reading progress bar at top (thin green line with dotted phospholipid-bilayer texture)
- Highlight boxes for definitions: `--accent` left-border, `--primary-light` background
- **Font size: `1.125rem` (~19px) on desktop, `1rem` (~17px) mobile** — never smaller than 17px base
- Paragraph and list text uses `--text-primary` (not grey `--text-secondary`) for maximum readability
- Images: max-width 100%, with caption below in italic `0.9375rem` `--text-secondary`

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
- SSC: blue badge (#1565C0 on #E3F2FD)
- HSC: green badge (#1A7A5E on #E8F5F0)
- Honours: purple badge (#6A1B9A on #F3E5F5)

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

Answer reveals explanation text with green (correct) or red (wrong) highlight. No page reload — pure React state.

---

## 7. Component Library

### PostCard
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
- No thumbnail unless available (fallback: colored gradient + topic icon)

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

### Button (3 variants)
```
[ Primary ]   ← bg --primary, white text
[ Secondary ] ← bg --primary-light, --primary text
[ Outline ]   ← transparent, --primary border + text
```
All buttons: border-radius 8px, min-height 44px, transition 150ms.

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
- **Font size: never below `0.75rem` (~12.75px) for labels; body always `17px`; prose articles `~19px`**
- Images: lazy-loaded, max-width: 100%
- TOC: collapsed by default on mobile, expandable
- Ads: maximum 1 ad per screen height; never between a question and its answer

---

## 10. Database Schema (Supabase / PostgreSQL)

All tables live in the `public` schema. RLS is **enabled on every table**. Only publicly readable content uses permissive `SELECT` policies for the `anon` role.

### `posts`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `slug` | `text` UNIQUE NOT NULL | English URL slug |
| `title` | `text` NOT NULL | Display title (Bangla OK) |
| `excerpt` | `text` | 2-line card summary |
| `content` | `text` | Full HTML / Markdown body |
| `topic_id` | `uuid` FK → `topics.id` | |
| `level` | `text` CHECK | `'ssc' \| 'hsc' \| 'honours'` |
| `read_time_min` | `int2` | Estimated read time |
| `published` | `bool` DEFAULT `false` | Draft/published gate |
| `published_at` | `timestamptz` | |
| `created_at` | `timestamptz` DEFAULT `now()` | |
| `updated_at` | `timestamptz` | Updated via trigger |

### `topics`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `slug` | `text` UNIQUE | e.g. `genetics` |
| `name_en` | `text` | English name |
| `name_bn` | `text` | Bangla name |
| `description` | `text` | Short 2-3 sentence intro |
| `sort_order` | `int2` | Display order |

### `mcqs`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `question` | `text` NOT NULL | Question body (Bangla OK) |
| `option_a` | `text` | |
| `option_b` | `text` | |
| `option_c` | `text` | |
| `option_d` | `text` | |
| `correct_option` | `char(1)` CHECK | `'a' \| 'b' \| 'c' \| 'd'` |
| `explanation` | `text` | Shown after answer submitted |
| `topic_id` | `uuid` FK → `topics.id` | |
| `level` | `text` CHECK | `'ssc' \| 'hsc' \| 'honours'` |
| `chapter` | `text` | Optional chapter label |

### `notes`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `title` | `text` NOT NULL | |
| `description` | `text` | |
| `level` | `text` CHECK | `'ssc' \| 'hsc' \| 'honours'` |
| `topic_id` | `uuid` FK → `topics.id` | |
| `storage_path` | `text` | Path in `pdfs` Storage bucket |
| `public_url` | `text` | Cached Supabase Storage public URL |
| `created_at` | `timestamptz` DEFAULT `now()` | |

### RLS Policy Summary
| Table | anon SELECT | auth INSERT/UPDATE |
|---|---|---|
| `posts` | WHERE published = true | admin only (via service role) |
| `topics` | ALL rows | admin only |
| `mcqs` | ALL rows | admin only |
| `notes` | ALL rows | admin only |

> **No user auth in Phase 1–3.** There are no student login flows in this build. Content is publicly readable. Admin writes go through the Supabase dashboard or service role.

---

## 11. SEO & Performance Targets

| Metric | Current (estimated) | Target |
|---|---|---|
| Lighthouse Performance | ~45–55 | 85+ |
| LCP (mobile) | ~4.5s | < 2.5s |
| CLS | unknown | < 0.1 |
| Core Web Vitals | Failing | All Green |

**Improvements to achieve this:**
- Serve WebP images via Next.js `<Image>` component (prevents CLS via `width`/`height`)
- Leverage Next.js App Router Server Components for fast initial loads
- Self-host Google Fonts via `next/font/google` (zero layout shift, no third-party request)
- Lazy load images below the fold with `loading="lazy"` (or `<Image>` default)
- Add structured data (JSON-LD) for `Article`, `BreadcrumbList`, `FAQPage` on relevant posts
- Meta descriptions on every post using Next.js `generateMetadata()`
- Open Graph tags for WhatsApp/Facebook sharing (students share posts heavily)
- Fixed-height ad slot containers to prevent CLS

---

## 12. Trust & Credibility Signals

**Above the fold:**
- Instructor name and photo visible in hero (not buried in footer)
- "200+ free posts" or student count signal

**About page:**
- Instructor photo
- Bio: *"আমি একজন শিক্ষক। পড়ানো পেশা থেকে নেশায় পরিণত হয়েছে কখন তা বুঝতেই পারিনি। মানুষকে শেখাতে ভালোলাগে। ক্লাশ রুমের বাইরেও শেখানোর ইচ্ছা থেকেই এই ব্লগ তৈরি করেছি।"*
- Academic credentials (MSc, institution, year)
- Teaching experience in years
- Result statistics if available

**Post pages:**
- Author byline with photo on every post
- Last updated date (trust signal for accuracy)

**Social proof:**
- 2–3 student quotes on homepage
- Facebook group member count (if 1000+, display it)
- YouTube subscriber count if applicable

**Fix immediately:**
- Typo: "Expart" → "Expert" in tagline/meta

---

## 13. Implementation Roadmap

### Phase 0 — Pre-Work (Before any coding)
- [ ] Verify Next.js 16 / React 19 / Tailwind 4 docs using `next-devtools` MCP
- [ ] Supabase project already exists — get URL + anon key from dashboard
- [ ] Add `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Read `node_modules/next/dist/docs/` for App Router conventions (per AGENTS.md rule)

### Phase 1 — Foundation (Days 1–3)
**Goal:** A running dev server with design system, fonts, Supabase client, and empty route stubs.
- [ ] Design tokens as CSS custom properties in `globals.css` (colors, shadows, radii, transitions, z-index)
- [ ] **Typography system:** 17px base, fluid heading scale, improved line-heights, `--text-primary` for body/prose
- [ ] **Font sizes hardened:** all elements ≥ 12.75px; badges/eyebrows 0.75rem; code 0.9em; tables 1rem
- [x] `next/font/google` for Inter, Hind Siliguri, JetBrains Mono, Tiro Bangla, Noto Serif Bengali
- [ ] Supabase browser client (`src/lib/supabase/client.ts`)
- [ ] Supabase server client (`src/lib/supabase/server.ts`) using `@supabase/ssr`
- [ ] All route stubs (see Sitemap §5)
- [ ] Base UI kit: `<Button>`, `<Badge>`, `<Container>` in `src/components/ui/`

### Phase 2 — Core Pages (Days 4–8)
**Goal:** Homepage, Navbar, Footer, Topic Hub, and Single Article fully built and connected to Supabase.
- `app/layout.tsx` with `<Navbar>` + `<Footer>`
- Homepage: Hero, Quick Nav Cards, Post Grid (live data), Instructor snippet
- `<Navbar>`: mega-dropdown (desktop), slide-in drawer (mobile), sticky scroll
- Topic Hub: filter by level (URL search params → Server Component re-fetch)
- Single Article: Breadcrumb, TOC sidebar, body prose, Related Posts, Prev/Next

### Phase 3 — Interactive Features (Days 9–12)
**Goal:** MCQ engine, Notes hub, and Search — all connected to Supabase.
- Database schema creation (via Supabase MCP `execute_sql`)
- MCQ Client Component: filter → fetch → quiz loop → answer reveal
- Notes page: category filter + download links to Supabase Storage
- Search: `<SearchModal>` with Supabase full-text search on `posts.title` + `posts.excerpt`

### Phase 4 — Polish & Performance (Days 13–15)
**Goal:** Lighthouse 85+, full SEO, zero CLS, accessibility pass.
- `<ReadingProgress>` — phospholipid bilayer dotted progress bar
- `generateMetadata()` on all dynamic pages
- JSON-LD structured data: `Article`, `BreadcrumbList`
- Open Graph / Twitter Card meta
- All `<img>` → `<Image>` audit
- `aria-label` audit on icon-only buttons
- Lighthouse run, fix regressions

---

## 14. Tools & Stack

| Need | Tool |
|---|---|
| Frontend Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Backend & Auth | Supabase |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage (`pdfs` bucket) |
| Bengali font | `Hind Siliguri` via `next/font/google` |
| SEO | Next.js built-in `metadata` API + `generateMetadata` |
| Search | Supabase Full-Text Search (`to_tsvector`) |
| Forms / MCQ | Custom React Client Components + Supabase |
| Analytics | Google Analytics 4 + Google Search Console |
| Deployment | Vercel |
| Next.js Docs | `next-devtools` MCP server |

---

## 15. What NOT to Do

- Do NOT use a dark theme
- Do NOT add unnecessary npm dependencies — keep the bundle size small
- Do NOT use heavy component libraries (e.g. MUI, Chakra) — build custom Tailwind components
- Do NOT put ads in the middle of biology explanations
- Do NOT use percent-encoded Bangla in URLs
- Do NOT keep the mega flat nav menu
- Do NOT launch without fixing the tagline typo first
- Do NOT use `auth.role()` in RLS policies — use `TO authenticated` clause instead
- Do NOT expose the Supabase `service_role` key to the browser or any `NEXT_PUBLIC_` env var
- Do NOT use `getSession()` for server-side auth checks — use `getUser()` instead
- Do NOT use `<link>` tags in `<head>` for Google Fonts — use `next/font/google`

---

## 16. Signature Design Element

The one thing that will make this site memorable:

**A green "cell membrane" progress indicator.** Every article page has a thin progress bar at the top that fills as you scroll. Instead of a generic flat bar, it uses a subtle dotted pattern resembling a phospholipid bilayer cross-section — a microscopic biology texture that only someone who loves biology would recognize. It's functional, contextual, and completely specific to this site's subject matter. Students will notice it. It won't feel like any other education site.

Implementation: a `<ReadingProgress>` Client Component using `requestAnimationFrame` for the scroll listener. The bar fill uses a CSS `repeating-linear-gradient` with tiny dots in `--primary-mid` on `--primary` background, spaced 6px apart — approximating a cross-sectional phospholipid bilayer pattern.

---

*Plan v2 — June 2026. All color values, font choices, layout decisions, and database schema are specific to BiologywithSantosir.com's audience, subject matter, and Bangladeshi context.*
