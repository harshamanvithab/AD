# Virtual Try-On Website Design Guidelines

## Design Approach: Reference-Based (Fashion Tech Hybrid)

Drawing inspiration from modern fashion tech interfaces (ASOS, Zara mobile apps) combined with AR camera experiences (Snapchat, Instagram filters). The design emphasizes visual primacy, immediate interaction, and seamless outfit discovery.

**Core Principles:**
- Camera-first interface where the live feed dominates the viewport
- Minimal UI chrome that doesn't compete with the outfit visualization
- Instant feedback and smooth transitions between outfits
- Mobile-optimized touch targets and gestures

---

## Typography System

**Primary Font:** Inter or DM Sans (via Google Fonts CDN)
**Accent Font:** Space Grotesk for headings (optional contrast)

**Hierarchy:**
- Hero/Section Titles: 3xl to 4xl, font-weight-700, tracking-tight
- Outfit Names: xl, font-weight-600
- Body/Descriptions: base, font-weight-400, leading-relaxed
- UI Labels: sm, font-weight-500, uppercase tracking-wide
- Micro Copy: xs, font-weight-400

---

## Layout System

**Spacing Primitives:** Consistent use of Tailwind units 2, 4, 6, 8, 12, 16
- Micro spacing (buttons, cards): p-4, gap-2
- Component spacing: p-6, p-8
- Section spacing: py-12, py-16
- Large breakpoints: py-20

**Grid Structure:**
- Main camera viewport: Full viewport height minus controls (h-screen minus bottom bar)
- Side panels (desktop): Fixed width 320px-380px with scroll
- Mobile: Stack vertically with drawer patterns
- Outfit gallery: grid-cols-2 on mobile, grid-cols-3 md:grid-cols-4 on larger screens

---

## Component Library

### 1. Camera Interface
**Live Video Feed:**
- Full viewport coverage with object-fit-cover
- Aspect ratio 16:9 or fill entire screen on mobile
- Subtle rounded corners on desktop (rounded-xl), full screen on mobile
- Overlay positioning for virtual clothing aligned to user's shoulders/waist

**Camera Controls (Top Bar):**
- Semi-transparent backdrop with blur-lg background
- Icons: Heroicons (via CDN) - camera-flip, settings, help
- Positioned absolute top-4 right-4
- Icon size: h-10 w-10, padding p-2.5

### 2. Outfit Selector Panel

**Desktop:** Fixed sidebar (right or left), width w-80 to w-96
**Mobile:** Bottom drawer with drag handle, max-height 70vh, overflow-scroll

**Gallery Grid:**
- Thumbnail cards: aspect-square with rounded-lg
- Grid spacing: gap-3
- Hover state: scale-105 transform with transition-transform
- Selected outfit: ring-4 ring offset with visible indicator

**Outfit Card Structure:**
- Image: Full card coverage
- Label overlay: Bottom-aligned with backdrop-blur-sm, p-3
- Category badge: Absolute top-2 left-2, text-xs rounded-full px-3 py-1

### 3. Recommendation Engine Interface

**Weather & Mood Selector:**
- Horizontal pill selector with icons
- Weather icons: sun, cloud, rain, snow (Heroicons)
- Mood options: casual, formal, sporty, party
- Active state: Filled background, shadow-lg
- Spacing between pills: gap-2
- Size: px-4 py-2.5, text-sm

**Recommendation Cards:**
- Stacked vertically with gap-4
- Each card: rounded-xl, p-4
- Left side: Small outfit thumbnail (w-20 h-20)
- Right side: Outfit name, brief description, "Try On" CTA
- Subtle border with hover elevation

### 4. Navigation & Controls

**Bottom Action Bar (Mobile):**
- Fixed bottom-0, full width
- Backdrop blur with semi-transparent background
- Three primary actions: Browse Outfits, Get Recommendations, Capture Photo
- Icon + label layout, gap-6 between items
- Height: h-20, safe area padding pb-safe

**Desktop Controls:**
- Floating action buttons on camera feed
- Positioned bottom-8 right-8
- Stacked vertically with gap-3
- Primary CTA (Capture): Larger size h-14 w-14
- Secondary actions: h-12 w-12

### 5. Onboarding & Empty States

**First-Time Experience:**
- Center modal overlay requesting camera permission
- Clear explanation with icon illustration
- Primary CTA button: "Enable Camera", rounded-full, px-8 py-4
- Skip option: text-sm, underline

**Loading State:**
- Skeleton screens for outfit thumbnails
- Shimmer animation (animate-pulse)
- Camera initialization: Centered spinner with "Connecting camera..." text

### 6. Header (Minimal)

- Semi-transparent top bar with backdrop-blur
- Logo: h-8, positioned left with pl-6
- Account/settings icon: positioned right with pr-6
- Height: h-16
- Optional tagline beneath logo: text-xs, opacity-70

---

## Images

**Outfit Sample Images:**
- High-quality clothing product shots on transparent backgrounds
- PNG format for easy overlay on camera feed
- Minimum resolution: 1024x1024 for detail
- Categories needed: 8-12 tops, 8-12 bottoms, 6-8 full outfits (dresses/jumpsuits)
- Style variety: casual t-shirts, formal shirts, jackets, jeans, skirts, dresses

**UI Illustrations:**
- Welcome/onboarding screen: Simple line art illustration of person with camera
- Empty state: Minimal icon illustration when no outfits available
- Weather icons: Clear, sunny, rainy, snowy conditions

**No hero image required** - the live camera feed serves as the primary visual canvas

---

## Animations & Interactions

**Sparingly Used:**
- Outfit switching: Fade transition 200ms when changing outfits
- Panel slides: Drawer enters from bottom with slide-up animation 300ms ease-out
- Hover states: Subtle scale (1.02-1.05) on interactive elements
- Loading states: Gentle pulse animation for skeletons

**Avoid:**
- Excessive scroll animations
- Parallax effects that compete with camera feed
- Complex page transitions

---

## Accessibility

- Minimum touch target: 44x44px for all interactive elements
- Clear focus indicators: ring-2 ring-offset-2 on keyboard navigation
- Camera permission denied state: Clear messaging with alternative options
- High contrast text overlays on camera feed
- ARIA labels for icon-only buttons
- Keyboard shortcuts for outfit navigation (arrow keys)

---

## Responsive Breakpoints

**Mobile (base to md):**
- Camera: Full viewport height
- Controls: Bottom sheet drawer
- Gallery: 2 columns
- Simplified header

**Tablet (md to lg):**
- Camera: 60-70% width
- Sidebar: 30-40% width
- Gallery: 3 columns

**Desktop (lg+):**
- Camera: 65% centered
- Sidebar: 35% fixed right panel
- Gallery: 4 columns
- Additional hover interactions enabled