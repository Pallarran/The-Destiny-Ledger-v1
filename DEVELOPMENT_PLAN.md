# The Destiny Ledger - Development Plan

## Project Overview
The Destiny Ledger is a browser-based D&D 5e character optimizer with DPR simulation, character comparison, and level path optimization. The app features a modern-fantasy UI with parchment panels, dark chrome, and arcane blue accents.

## Development Phases

### **Phase 1: Foundation & Early Deployment** (Week 1-2)

#### Week 1: Project Setup
1. **Project Scaffolding**
   - Initialize Vite + React 18 + TypeScript project
   - Configure Tailwind CSS with custom theme tokens
   - Set up shadcn/ui component library
   - Configure ESLint, Prettier, and Vitest

2. **Design System Implementation**
   - Implement CSS custom properties from spec (colors, shadows, etc.)
   - Create base components: `Panel`, `RuneCorners`, `ChartFrame`
   - Set up Google Fonts (Cinzel, Cormorant Garamond, Inter)
   - Build core layout components with parchment styling

3. **Basic Layout & Navigation**
   - Set up React Router with main routes
   - Create app shell with dark chrome header/sidebar
   - Implement responsive layout structure
   - Add placeholder pages for all main screens

#### Week 2: Deployment Setup & Review
4. **GitHub Deployment Configuration**
   - Configure Vite for GitHub Pages deployment
   - Set up GitHub Actions workflow
   - Create SPA fallback (404.html)
   - Deploy initial layout for review

5. **Landing Page & Basic Navigation**
   - Implement landing page with feature overview
   - Add working navigation between screens
   - Style with modern-fantasy theme matching concept images
   - Ensure responsive design works on different screen sizes

**🚀 Deployment Checkpoint**: At this point, you'll have a live demo with the complete visual design, navigation, and placeholder screens that you can review before we proceed with the complex functionality.

---

### **Phase 2: Data Layer & DPR Engine** (Week 3-4)
1. **Data Architecture**
   - Create SRD JSON data files (classes, feats, spells, equipment)
   - Build data loader modules in `rules/` folder
   - Set up Zustand stores: `builderStore`, `dprStore`, `vaultStore`, `settingsStore`
   - Configure Dexie for IndexedDB persistence

2. **DPR Engine Core**
   - Implement closed-form math engine in `engine/` folder
   - Build Web Worker with Comlink for calculations
   - Core mechanics: to-hit probability, advantage/disadvantage, crits
   - Support for Extra Attack, GWM/Sharpshooter thresholds
   - Unit tests for all mathematical functions

3. **Chart Infrastructure**
   - Set up Recharts with custom styling
   - Create reusable chart components
   - Implement three-curve overlay (Normal/Advantage/Disadvantage)

### **Phase 3: Character Builder** (Week 5-6)
1. **Core Builder Interface**
   - Ability score methods (Standard Array, Point Buy, Manual)
   - Ability score cards with ornamental corners
   - Class/subclass selection with level progression
   - Feat selection with half-feat ASI handling

2. **Level Timeline**
   - Interactive level progression component
   - Milestone markers and class level indicators
   - ASI/Feat choice tracking
   - Validation system for build conflicts

3. **Equipment & Buffs**
   - Gear selection interface
   - Weapon/armor modifiers and magical items
   - Buff toggle system with concentration tracking
   - Round 0 pre-buff configuration

### **Phase 4: DPR Lab & Analysis** (Week 7)
1. **DPR Lab Interface**
   - Simulation configuration panel (left side)
   - Real-time DPR chart updates (right side)
   - AC range controls and advantage state toggles
   - SS/GWM breakpoint table display

2. **Analysis Features**
   - Per-round damage breakdown
   - Resource usage optimization
   - Export chart functionality
   - Validation warnings for concentration conflicts

### **Phase 5: Character Comparison** (Week 8)
1. **Multi-Build Comparison**
   - Side-by-side build selection (up to 3)
   - Overlay DPR charts with different colors
   - Individual SS/GWM breakpoint tables per build

2. **Non-DPR Role Analysis**
   - Six-axis radar chart implementation
   - Objective scoring system for each role
   - Manual adjustment sliders (-10 to +10)
   - Tooltip explanations for scoring methodology

### **Phase 6: Level Path Explorer** (Week 9-10)
1. **Path Optimization Engine**
   - Constraint system (max classes, milestones, role targets)
   - Beam search algorithm for level ordering
   - Objective functions (L20 DPR maximization)

2. **Explorer Interface**
   - Constraint configuration panel
   - Side-by-side path comparison (up to 3)
   - Per-level DPR sparklines
   - Milestone achievement tracking

### **Phase 7: Build Vault & Persistence** (Week 11)
1. **Build Management**
   - Build list with card-based interface
   - Create, duplicate, rename, delete operations
   - Folder/tag organization system
   - Search and filter functionality

2. **Data Management**
   - Import/export JSON functionality
   - Build versioning and migration
   - Settings persistence
   - Data reset and cleanup tools

### **Phase 8: Polish & Deployment** (Week 12)
1. **UI Polish**
   - Landing page with feature overview
   - Help tooltips and user guidance
   - Empty state designs
   - Loading states and error handling

2. **Testing & QA**
   - Comprehensive unit test suite
   - Integration tests for critical paths
   - Manual testing across different screen sizes
   - Performance optimization

3. **Final Deployment**
   - Production build optimization
   - Documentation and README
   - Final testing and bug fixes

## Technical Architecture

### **Core Tech Stack**
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for DPR curves and radar charts
- **Animation**: Framer Motion for transitions
- **State Management**: Zustand + Immer
- **Forms**: React Hook Form + Zod validation
- **Storage**: Dexie (IndexedDB wrapper)
- **Math Engine**: Web Workers with Comlink
- **Testing**: Vitest + React Testing Library

### **Project Structure**
```
src/
├── app/                 # Routes and main layout
├── components/          # Reusable UI components
├── features/            # Feature-specific modules
│   ├── builder/         # Character builder
│   ├── dpr/            # DPR lab and analysis
│   ├── compare/        # Build comparison
│   ├── explorer/       # Level path explorer
│   ├── vault/          # Build management
│   └── settings/       # App settings
├── engine/             # Math computation kernel
├── rules/              # SRD data and loaders
├── stores/             # Zustand state management
├── workers/            # Web Workers for heavy computation
└── assets/             # Static assets and icons
```

## Design System Specifications

### **Modern-Fantasy Theme**
- **App Chrome**: Dark background (`#0F1318`)
- **Content Panels**: Parchment background (`#EDE2CB`) with subtle paper texture
- **Primary Text**: Dark ink (`#1E232A`) on parchment
- **Accent Color**: Arcane blue (`#63CBFF`) for focus states and charts
- **Gold Highlights**: `#C8A86B` for dividers and special elements

### **Typography**
- **Headings**: Cinzel or Cormorant Garamond (H1-H2 only)
- **Body/UI**: Inter for all other text
- **Fluid scaling**: CSS `clamp()` for responsive typography

### **Components**
- **Parchment Panels**: Rounded corners, etched borders, micro inner shadow
- **Rune Corners**: SVG ornaments on hero panels and ability score cards
- **Focus States**: Arcane blue glow with subtle drop shadow
- **Charts**: Three-curve DPR overlays, six-axis radar charts

## Key Implementation Notes

1. **Performance**: DPR calculations in Web Workers to maintain UI responsiveness
2. **Design Fidelity**: Exact implementation of modern-fantasy theme with parchment panels
3. **Extensibility**: Modular data loading system for future content expansion
4. **Testing**: Golden test cases for mathematical accuracy
5. **Early Feedback**: Deploy after basic layout for design review
6. **Deployment**: Static site optimized for GitHub Pages

## Success Criteria

### **Phase 1 Checkpoint (Early Deployment)**
- ✅ Complete visual design implementation matching concept images
- ✅ Working navigation between all main screens
- ✅ Responsive layout on desktop and mobile
- ✅ Live GitHub Pages deployment for review
- ✅ Parchment panels with proper styling and ornaments
- ✅ Modern-fantasy theme fully implemented

### **Final Release (v1.0)**
- ✅ Full character builder with SRD content
- ✅ Accurate DPR simulation with closed-form math
- ✅ Three-build comparison with radar charts
- ✅ Level path optimization with constraints
- ✅ Local build vault with import/export
- ✅ Performance targets met (DPR calc <25ms, UI <100ms)
- ✅ Comprehensive test coverage
- ✅ Production deployment on GitHub Pages

This plan delivers a fully functional D&D character optimizer matching your specifications, with early deployment for design review and the distinctive visual design shown in your concept images.