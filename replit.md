# VirtualFit - Virtual Try-On Experience

## Overview

VirtualFit is a fashion tech web application that enables users to virtually try on clothing items using their device camera. The application provides personalized outfit recommendations based on weather conditions and mood preferences, combining AR camera experiences with modern fashion browsing interfaces.

The system follows a camera-first design philosophy where the live video feed dominates the viewport, with minimal UI chrome to focus attention on the outfit visualization. The application is optimized for both mobile and desktop experiences, with responsive layouts and touch-friendly interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR (Hot Module Replacement)
- Client-side routing handled by Wouter (lightweight alternative to React Router)

**UI Component System**
- shadcn/ui component library (Radix UI primitives with Tailwind styling)
- "New York" style variant configured for consistent design language
- CSS Variables-based theming system supporting light/dark modes
- Tailwind CSS for utility-first styling with custom design tokens

**State Management**
- TanStack Query (React Query) for server state management and caching
- Local component state with React hooks for UI state
- No global state management library (Redux, Zustand) - queries handle shared state

**Design System**
- Custom color system using HSL values with CSS variables
- Consistent spacing scale (2, 4, 6, 8, 12, 16 Tailwind units)
- Typography system using Inter and Space Grotesk fonts from Google Fonts
- Responsive breakpoints for mobile-first design
- Custom hover/active elevation states for interactive elements

**Key Features Implementation**
1. **Camera Integration**: WebRTC getUserMedia API for live video feed with front/back camera switching
2. **3D Virtual Try-On System**: 
   - **Body Pose Detection**: MediaPipe Pose for real-time body landmark tracking
   - **3D Clothing Rendering**: Three.js (@react-three/fiber) for rendering 3D clothing models
   - **Body-to-Clothing Mapping**: Dynamic scaling and positioning of 3D garments based on detected body dimensions
   - **Real-time Deformation**: Clothing follows body movement with rotation and scaling adjustments
3. **Responsive Layouts**: 
   - Desktop: Fixed sidebar (320-380px) with camera viewport
   - Mobile: Drawer pattern with expandable outfit gallery
4. **Recommendation Engine**: Filter outfits based on weather + mood combinations

### Backend Architecture

**Server Framework**
- Express.js running on Node.js with TypeScript
- ESM (ES Modules) format throughout the codebase
- Custom middleware for request logging and JSON parsing

**API Design**
- RESTful API endpoints under `/api` prefix
- Zod schemas for request/response validation
- Separation of concerns: routes, storage layer, and business logic

**Data Storage**
- In-memory storage implementation (MemStorage class) for development
- Interface-based design (IStorage) allows easy swapping to database later
- Pre-seeded outfit data with images stored in `/assets/generated_images`

**Data Models**
- **Outfit**: Core entity with category, image URL, weather/mood suitability
- **WeatherData**: Location-based weather conditions
- **Recommendation**: Filtered outfits based on user preferences

**API Endpoints**
1. `GET /api/outfits` - Retrieve all available outfits
2. `GET /api/outfits/:id` - Get specific outfit details
3. `POST /api/outfits` - Create new outfit (validated with Zod)
4. `GET /api/recommendations?weather=X&mood=Y` - Get filtered recommendations

**Validation & Type Safety**
- Shared schema definitions in `shared/schema.ts` used by both client and server
- Zod for runtime validation on API boundaries
- TypeScript for compile-time type checking across the stack

### Configuration Architecture

**TypeScript Configuration**
- Monorepo-style setup with path aliases (@, @shared, @assets)
- Shared types between client and server
- Strict mode enabled for maximum type safety

**Build Configuration**
- Separate build processes for client (Vite) and server (esbuild)
- Client builds to `dist/public`, server to `dist/index.js`
- Development mode with Vite dev server middleware in Express

**Environment Variables**
- DATABASE_URL expected for future database integration (currently using in-memory)
- NODE_ENV for environment-specific behavior

## External Dependencies

### UI & Component Libraries
- **Radix UI**: Headless accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **shadcn/ui**: Pre-styled component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Icon library for consistent iconography
- **class-variance-authority (CVA)**: Type-safe variant styling system

### State & Data Management
- **TanStack Query (React Query)**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation and TypeScript type inference
- **date-fns**: Date manipulation and formatting utilities

### Database & ORM (Configured but not actively used)
- **Drizzle ORM**: TypeScript ORM configured for PostgreSQL
- **@neondatabase/serverless**: Neon serverless Postgres driver
- **drizzle-zod**: Zod schema generation from Drizzle schemas
- **connect-pg-simple**: PostgreSQL session store (for future session management)

**Note**: While Drizzle is configured with PostgreSQL schema definitions, the application currently uses in-memory storage. The database infrastructure is ready for migration when needed.

### 3D Graphics & Computer Vision
- **Three.js**: 3D graphics library for WebGL rendering
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Helper utilities for Three.js in React
- **MediaPipe Pose**: Google's ML solution for real-time human pose estimation
  - Detects 33 body landmarks in 3D space
  - Runs entirely in the browser using WebAssembly
  - Provides shoulder, hip, and joint tracking for clothing alignment
- **MediaPipe Camera Utils**: Camera utilities for MediaPipe integration
- **MediaPipe Drawing Utils**: Visualization utilities for pose landmarks

### Development Tools
- **Vite**: Fast development server with HMR
- **esbuild**: Fast JavaScript bundler for server builds
- **tsx**: TypeScript execution for Node.js development
- **@replit/vite-plugin-***: Replit-specific development enhancements (cartographer, dev banner, error modal)

### UI Enhancement Libraries
- **embla-carousel-react**: Touch-friendly carousel component
- **vaul**: Drawer/bottom sheet component for mobile
- **cmdk**: Command palette component (keyboard-driven UI)
- **react-day-picker**: Calendar/date picker component

### Utility Libraries
- **clsx + tailwind-merge**: Conditional class name composition
- **nanoid**: Unique ID generation

## Recent Changes

### November 2, 2025 - 3D Virtual Try-On Implementation
- **Added 3D Body Tracking**: Integrated MediaPipe Pose for real-time body landmark detection
- **3D Clothing Models**: Implemented Three.js-based 3D clothing rendering system
  - Procedurally generated clothing geometries (t-shirts, dresses, pants)
  - Ready to load external GLB/GLTF 3D models from sources like Sketchfab
- **Body-Aware Rendering**: Clothing dynamically scales and positions based on user's body dimensions
  - Shoulder width detection for proper garment sizing
  - Torso height calculation for proportional scaling
  - Real-time rotation matching body tilt
- **Component Structure**: Created `VirtualTryOn3D.tsx` with separated 3D rendering logic
- **Performance Optimized**: Runs entirely in browser with WebGL acceleration

### Future Integration Points
The architecture supports adding:
- **3D Model Library**: Import GLB/GLTF clothing models from Sketchfab, CGTrader, or custom sources
- **Advanced Body Fitting**: Implement skeletal rigging for more realistic clothing deformation
- **Texture Mapping**: Apply realistic fabrics and materials to 3D clothing
- Weather API integration for real-time weather data
- Image upload/storage service for user-uploaded outfits
- Authentication system (session management already configured)
- Database persistence (Drizzle ORM ready)
- ML/AI outfit recommendation engine