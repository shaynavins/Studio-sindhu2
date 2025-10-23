# Design Guidelines: Tailor Management Application

## Design Approach: Linear-Inspired Productivity System

**Selected Approach:** Design System (Linear + Notion hybrid)
**Justification:** This is a utility-focused, data-intensive productivity tool requiring efficiency, clarity, and consistent patterns for daily use by tailors and administrators.

**Core Principles:**
- Clarity over decoration
- Efficiency in data entry workflows
- Scannable information hierarchy
- Professional, trustworthy aesthetic for business use

---

## Color Palette

### Light Mode
- **Background:** 0 0% 100% (primary), 0 0% 98% (secondary), 0 0% 95% (tertiary)
- **Foreground:** 240 10% 10% (primary text), 240 5% 35% (secondary text)
- **Primary Brand:** 215 85% 55% (professional blue for CTAs, active states)
- **Borders:** 240 6% 90% (subtle separators)
- **Success:** 142 76% 36% (saved states, confirmations)
- **Warning:** 38 92% 50% (pending orders, alerts)

### Dark Mode
- **Background:** 240 10% 8% (primary), 240 8% 12% (secondary), 240 7% 16% (tertiary)
- **Foreground:** 0 0% 98% (primary text), 240 5% 75% (secondary text)
- **Primary Brand:** 215 90% 65% (adjusted for dark mode contrast)
- **Borders:** 240 5% 20%
- **Form Inputs:** 240 7% 16% background with 240 5% 25% borders

---

## Typography

**Font Stack:** Inter (Google Fonts) - entire application
- **Headings:** 600-700 weight, tight letter spacing
  - H1: text-3xl (dashboard titles)
  - H2: text-2xl (section headers)
  - H3: text-xl (card titles)
- **Body:** 400-500 weight
  - Primary: text-base
  - Secondary: text-sm (labels, metadata)
  - Captions: text-xs (timestamps, helper text)
- **Form Labels:** 500 weight, text-sm, uppercase tracking-wide for clarity
- **Data Display:** 500 weight, tabular-nums for measurements

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card margins: gap-4 or gap-6 in grids
- Form field spacing: space-y-4

**Grid System:**
- Dashboard: 12-column grid with 4-6 column sidebar
- Customer cards: 3-column grid (lg), 2-column (md), 1-column (sm)
- Form layouts: Single column max-w-2xl for data entry focus

---

## Component Library

### Navigation
**Sidebar (Fixed Left):**
- Width: 16rem (desktop), full-width drawer (mobile)
- Logo at top with company name
- Navigation items with icons (Heroicons outline style)
- Active state: Primary color background, subtle glow
- User profile section at bottom with role indicator (Tailor/Admin)

### Dashboard Cards
**Customer Entry Card:**
- Rounded corners (rounded-lg)
- Subtle shadow (shadow-sm)
- Hover: slight elevation increase (shadow-md transition)
- Preview image (aspect-square, rounded-lg, object-cover)
- Customer name (text-lg font-semibold)
- Order status badge (pill shape, small text)
- Last updated timestamp (text-xs, muted color)
- Quick actions: View, Edit icons (minimal, icon-only buttons)

### Forms
**Customer Entry Form:**
- Clean, single-column layout
- Section dividers with subtle borders and headings
- Input fields with floating labels or top-aligned labels (text-sm, font-medium)
- All inputs: rounded-md, consistent padding (px-4 py-2.5)
- Focus state: Primary color ring (ring-2)
- Image upload: Dashed border dropzone with preview thumbnail grid
- Measurement inputs: Grouped in 2-column grid for efficiency
- Save/Cancel buttons: Primary (filled) and secondary (outline) pairing

### Data Tables
**Customer List (Admin View):**
- Sticky header row with sortable columns
- Alternating row backgrounds (very subtle, 2% opacity difference)
- Row hover: Background highlight
- Compact row height for data density
- Column headers: font-medium, text-sm, muted color
- Pagination controls at bottom
- Search and filter bar above table
- Actions column: Icon buttons (view, edit, archive)

### Status Indicators
- **Badges:** Pill-shaped, small text, color-coded
  - New Order: Blue background
  - In Progress: Yellow/Orange background
  - Completed: Green background
  - Cancelled: Gray background
- **Progress Indicators:** Subtle linear progress bars for multi-step processes

### Buttons
- **Primary:** Solid background, primary color, medium font-weight
- **Secondary:** Outline style with border, transparent background
- **Icon Buttons:** Square or circular, minimal padding, hover background
- Consistent sizing: py-2.5 px-6 for standard, py-2 px-4 for compact

---

## Navigation Patterns

**Main Navigation Flow:**
1. Sidebar for primary sections (Dashboard, Customers, New Entry, Settings)
2. Breadcrumb navigation for deep hierarchies
3. Contextual actions in page headers
4. Modal overlays for quick actions without navigation

**Tailor View:** Dashboard → New Entry Form → Customer List
**Admin View:** Dashboard → All Customers → Tailor Activity Reports

---

## Images

**Dashboard Hero (Top Banner):** Clean, professional workspace image showing fabric swatches or measuring tape - aspect ratio 16:3, subtle overlay for text readability

**Customer Photos:** Square aspect ratio thumbnails in cards and lists, circular avatars in detailed views

**Empty States:** Minimalist illustrations for empty customer lists or incomplete sections

---

## Interactions

**Minimal Animations:**
- Smooth transitions on hover states (duration-200)
- Fade-in for modals and toasts (duration-300)
- Skeleton loaders for async data
- No decorative or scroll-triggered animations

**Feedback:**
- Toast notifications for save confirmations (top-right position)
- Inline validation messages below form fields
- Loading spinners for async actions
- Disabled button states during processing