# The Destiny Ledger - Development Roadmap v2025

**Version:** 2025-01-06  
**Status:** Current State Analysis & Forward Planning  
**Based on:** PRD v1.2, PRD v1.3, and Review & Recommendations Document

---

## Executive Summary

The Destiny Ledger has achieved a strong foundation as a D&D 5e character optimizer with comprehensive character building, mathematical DPR analysis, and build comparison capabilities. This roadmap identifies critical gaps between the current implementation and the vision outlined in the Product Requirements Documents, providing a structured 12-week plan to complete the core feature set and advance toward becoming the "perfect D&D optimizer tool."

---

## Current State Assessment

### ✅ **Strongly Implemented Features (Production Ready)**

#### Character Builder & Core Systems
- **Full Character Builder**: Complete ability scores, race/subrace with bonuses, multiclass progression, feats, spells, equipment
- **Enhanced Level Timeline**: Sophisticated multiclass progression with milestones and validation
- **Subclass Integration**: Comprehensive subclass features, spell lists, and progression mechanics
- **Equipment System**: Weapons, armor, shields, magic items with attunement limits
- **Spell System**: Preparation/known distinction, multiclass spellcasting, concentration tracking
- **Downtime Training**: Ability score improvements and proficiency training

#### Analysis & Optimization
- **DPR Lab**: Closed-form mathematical engine with AC sweep charts, advantage/disadvantage mechanics
- **GWM/SS Optimization**: Automatic threshold detection and breakpoint analysis
- **Build Comparison**: Up to 6 builds side-by-side with role scoring and radar charts
- **Initiative System**: Comprehensive calculation including feat bonuses (Alert, Rakish Audacity, etc.)
- **Role Scoring**: 6-axis radar chart (Social, Defense, Mobility, Support, Exploration, Control)

#### Technical Excellence
- **Modern Architecture**: React 18 + TypeScript + Vite with proper state management
- **Web Worker DPR**: Performance-optimized calculations in background thread
- **Build Vault**: Local persistence with IndexedDB, import/export functionality
- **UI/UX**: Modern-fantasy skin with parchment panels, proper design tokens, responsive layout
- **Legal Compliance**: Proper SRD 5.1 attribution modal and CC-BY-4.0 compliance

### 🟡 **Partially Implemented (Needs Enhancement)**

#### Optimization Tools
- **Party Optimizer**: Basic structure exists but lacks comprehensive synergy analysis
- **Level Path Explorer**: Framework present but missing constraint-based beam search algorithm
- **Combat Round Optimizer**: Basic structure but needs full action economy modeling
- **Role Scoring**: Functional but may need accuracy refinements for edge cases

#### User Experience
- **Spell Concentration**: Basic tracking exists but needs enhanced conflict warnings
- **Build Validation**: Some validation present but needs comprehensive rule checking
- **Mobile Experience**: Responsive design but could use mobile-specific optimizations

### ❌ **Major Missing Features (Critical Gaps)**

#### Core PRD Requirements
- **Round Scripts**: No per-round action/bonus action/reaction sequencing system
- **Delta Pills**: Missing "+X.X DPR" real-time feedback indicators on build changes
- **Preset Library**: No curated canonical builds for validation and user examples
- **Homebrew Editor UI**: Complete absence of user content creation interface
- **Enhanced Compare**: Missing "show differences only" toggle and printable exports

#### Advanced Features
- **Action Economy Modeling**: No validation of bonus action conflicts or resource budgeting
- **Advanced Mechanics**: Limited support for Battlemaster, Divine Smite, Crossbow Expert
- **Concentration Warnings**: Insufficient conflict detection for simultaneous effects
- **Shareable Builds**: No URL-based build sharing functionality

#### Testing & Validation
- **Golden Test Suite**: Missing comprehensive math validation against hand calculations
- **Property Testing**: No automated validation of mathematical consistency
- **Performance Benchmarks**: Lacking systematic performance measurement

---

## Critical Gaps Analysis

### **PRD v1.2 Requirements vs Current State**

| PRD v1.2 Feature | Current Status | Gap Analysis |
|------------------|----------------|--------------|
| Round Scripts (R1/R2/R3) | ❌ Missing | Critical: Action economy modeling completely absent |
| Delta Pills Feedback | ❌ Missing | High: Real-time build impact feedback missing |
| Level Path Explorer | 🟡 Partial | Medium: Needs beam search algorithm and constraints |
| Golden Tests | ❌ Missing | High: Math validation insufficient |
| Preset Library | ❌ Missing | Medium: User onboarding and validation missing |

### **PRD v1.3 Requirements vs Current State**

| PRD v1.3 Feature | Current Status | Gap Analysis |
|------------------|----------------|--------------|
| Homebrew Editor | ❌ Missing | Critical: Major v1.3 feature completely absent |
| Combat Round Optimizer | 🟡 Partial | High: Needs full action sequence simulation |
| Party Optimizer Enhancement | 🟡 Partial | Medium: Synergy analysis incomplete |
| Advanced Spell Integration | 🟡 Partial | Medium: AoE/save spells framework needed |
| Full Content Packs | ✅ Complete | Low: SRD content comprehensive |

### **Review Document Requirements vs Current State**

| Review Feature | Current Status | Gap Analysis |
|----------------|----------------|--------------|
| "Show Differences Only" Toggle | ❌ Missing | Medium: Compare UX enhancement |
| Printable Summaries | ❌ Missing | Medium: Export functionality missing |
| Shareable URLs | ❌ Missing | Low: Nice-to-have feature |
| Advanced Mechanics Coverage | 🟡 Partial | High: Battlemaster, Smite, etc. needed |
| Concentration Success Slider | ❌ Missing | Low: Realism enhancement |

---

## Development Roadmap (12-Week Plan)

### **Priority 1: Core Completion (Weeks 1-4)**

#### Week 1-2: Round Scripts & Action Economy
**Objective**: Implement fundamental action economy modeling

**Deliverables**:
- Round Scripts UI (R1/R2/R3 planning interface)
- Action/Bonus Action/Reaction constraint system
- Concentration conflict detection and warnings
- Basic resource management (spell slots, class features)

**Acceptance Criteria**:
- Users can plan action sequences for each round
- System prevents double-spending of bonus actions
- Concentration conflicts trigger visible warnings
- Action economy violations are clearly indicated

#### Week 2-3: Delta Pills & Real-Time Feedback
**Objective**: Provide instant feedback on build changes

**Deliverables**:
- "+X.X DPR" indicators next to all toggles and selections
- Debounced recalculation with optimistic UI updates
- Color-coded impact indicators (positive/negative changes)
- Performance metrics display (hit chance, crit chance deltas)

**Acceptance Criteria**:
- All feat/equipment changes show immediate DPR impact
- UI remains responsive during recalculation (<100ms)
- Changes are visually highlighted with clear indicators
- Users can see cause-and-effect of optimization decisions

#### Week 3-4: Preset Library & Golden Tests
**Objective**: Establish math validation and user examples

**Deliverables**:
- 10 canonical preset builds covering major archetypes:
  1. Champion Fighter 5 (GWM greatsword baseline)
  2. Fighter (Archery) 5 (Longbow + Sharpshooter)
  3. Eldritch Knight 11 (War Magic cantrip + BA shot)
  4. Battlemaster 5/11 (Superiority dice riders)
  5. Hexblade 5 (EB + Agonizing + Hex baseline)
  6. Hunter Ranger 5/11 (Colossus Slayer + HM)
  7. Paladin 5/11 (Greatsword + Smite budgeting)
  8. Rogue 5/11 (Sneak Attack optimization)
  9. Sorlock 5/7 (EB + Hex + Pact slots)
  10. Barbarian 5 (Reckless Attack dynamics)

**Acceptance Criteria**:
- All presets match hand-calculated DPR within ±0.5
- Presets serve as both examples and test fixtures
- Golden test suite validates core math functions
- New users can load and understand optimal builds

#### Week 4: Enhanced Compare Features
**Objective**: Improve build comparison user experience

**Deliverables**:
- "Show Differences Only" toggle for build comparison
- Up/down delta indicators (↑/↓) for metric changes
- Printable summary export functionality
- Expandable detail panels for build investigation

**Acceptance Criteria**:
- Users can focus on meaningful build differences
- Export generates clean, printer-friendly summaries
- All comparison metrics show clear change indicators
- Complex builds remain readable in comparison view

### **Priority 2: Advanced Features (Weeks 5-8)**

#### Week 5-6: Homebrew Editor UI
**Objective**: Enable user-generated content creation

**Deliverables**:
- Visual editors for custom classes, subclasses, feats, spells, items
- Schema validation with real-time error checking
- Preview system for homebrew content testing
- JSON import/export for homebrew pack sharing
- Integration with existing rules loader system

**Acceptance Criteria**:
- Users can create valid custom content through UI
- Invalid homebrew entries are rejected with clear errors
- Custom content integrates seamlessly with official content
- Homebrew packs can be shared and imported by other users

#### Week 6-7: Level Path Explorer Enhancement
**Objective**: Implement intelligent multiclass optimization

**Deliverables**:
- Beam search algorithm for level ordering optimization
- Constraint system (max classes, must-hit milestones)
- Role-by-level targeting ("be good at Control by L5")
- Enhanced candidate evaluation and side-by-side display
- Per-level DPR sparklines and milestone badges

**Acceptance Criteria**:
- Algorithm finds optimal multiclass paths under constraints
- Users can specify complex optimization objectives
- Results clearly show power spikes and milestone achievements
- Performance remains acceptable for complex searches (<5 seconds)

#### Week 7-8: Combat Round Optimizer
**Objective**: Simulate optimal action sequences

**Deliverables**:
- Full action sequencing simulation engine
- Multi-round resource optimization (spell slots, superiority dice)
- Bonus action conflict resolution
- Expected value calculation for action choices
- Integration with Round Scripts system

**Acceptance Criteria**:
- System finds mathematically optimal action sequences
- Resource usage is properly budgeted across encounters
- Action economy constraints are strictly enforced
- Users understand why specific sequences are recommended

#### Week 8: Party Optimizer Completion
**Objective**: Analyze team compositions and synergies

**Deliverables**:
- Advanced synergy analysis (buff stacking, role coverage)
- Conflict detection (overlapping responsibilities, wasted abilities)
- Team composition recommendations and gap analysis
- Inter-character buff modeling (Bless, Faerie Fire, etc.)
- Role balance visualization and scoring

**Acceptance Criteria**:
- System identifies optimal party compositions
- Synergies and conflicts are clearly highlighted
- Recommendations improve overall party effectiveness
- Users can optimize teams for specific encounter types

### **Priority 3: Polish & Enhancement (Weeks 9-12)**

#### Week 9-10: Advanced Mechanics
**Objective**: Support complex character abilities

**Deliverables**:
- Battlemaster maneuver integration with superiority dice
- Divine Smite resource budgeting and optimization
- Crossbow Expert/Polearm Master/Sentinel mechanics
- Champion expanded critical hit range
- Great Weapon Fighting reroll mechanics
- Improved multiclass spellcasting edge cases

**Acceptance Criteria**:
- Complex builds calculate accurate DPR
- Resource-limited abilities are properly budgeted
- Edge case interactions work correctly
- Math validation passes for all new mechanics

#### Week 10-11: UI/UX Refinements
**Objective**: Enhance user experience and accessibility

**Deliverables**:
- Shareable build URLs with compressed JSON encoding
- Enhanced mobile responsiveness and touch interactions
- Comprehensive keyboard navigation support
- Screen reader compatibility and ARIA labels
- Performance optimizations for large/complex builds
- Improved error messages and user guidance

**Acceptance Criteria**:
- App is fully accessible to users with disabilities
- Mobile experience matches desktop functionality
- Build sharing works seamlessly across devices
- Performance remains smooth with complex multiclass builds

#### Week 11-12: Content Expansion & Final Polish
**Objective**: Complete feature set and prepare for release

**Deliverables**:
- Extended spell database with combat/utility spells
- Additional magic items and enchantment effects
- Comprehensive feat and class feature coverage
- Documentation and help system
- Final performance optimization and bug fixes
- User testing and feedback integration

**Acceptance Criteria**:
- App supports 90%+ of common character build patterns
- All features are documented with help text
- Performance meets or exceeds specification targets
- User testing confirms intuitive and efficient workflow

---

## Success Metrics & Validation Criteria

### **Mathematical Accuracy**
- All preset builds match hand-calculated DPR within ±0.5
- Golden test suite covers critical calculation edge cases
- Property tests validate mathematical consistency
- Cross-validation against external DPR calculators

### **Performance Standards**
- DPR calculations complete within 25ms per build in worker
- UI interactions respond within 100ms
- Build comparison renders 6 builds within 500ms
- Level Path Explorer completes searches within 5 seconds

### **User Experience Quality**
- New users create optimized build within 10 minutes
- Round Scripts system prevents 100% of action economy violations
- Delta feedback helps users understand optimization impact
- Accessibility standards (WCAG 2.1 AA) fully met

### **Feature Coverage & Reliability**
- Support 80% of common character build patterns
- Zero undetected concentration conflicts in testing
- Homebrew content integrates without breaking core functionality
- Build sharing preserves 100% of character data integrity

### **Technical Excellence**
- Code coverage >85% for critical calculation paths
- No memory leaks during extended usage sessions
- Responsive design works on all device sizes
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

---

## Risk Assessment & Mitigation

### **High-Risk Items**
1. **Mathematical Complexity**: Complex multiclass interactions may introduce calculation errors
   - *Mitigation*: Comprehensive golden test suite, incremental validation
2. **Performance with Complex Builds**: Large character builds may impact UI responsiveness
   - *Mitigation*: Profiling, optimization, Web Worker utilization
3. **Homebrew Validation**: User-generated content could break core functionality
   - *Mitigation*: Strict schema validation, sandboxed preview system

### **Medium-Risk Items**
1. **Browser Compatibility**: Advanced features may not work on older browsers
   - *Mitigation*: Progressive enhancement, graceful degradation
2. **Content Scope Creep**: Feature requests may expand beyond core objectives
   - *Mitigation*: Clear scope definition, prioritized backlog management

### **Low-Risk Items**
1. **UI/UX Refinements**: Visual and interaction improvements are generally low-risk
2. **Content Expansion**: Adding more spells/items follows established patterns

---

## Post-Roadmap Future Considerations

### **Version 1.4+ Features**
- AoE and save-based spell integration
- Off-turn reaction modeling
- Advanced encounter simulation
- Campaign-length resource management
- Multiplayer party planning tools

### **Long-Term Vision**
- Machine learning build optimization
- Integration with virtual tabletop platforms
- Advanced statistical analysis and reporting
- Community content sharing platform
- Mobile application development

---

## Conclusion

The Destiny Ledger has established an excellent foundation as a D&D 5e character optimizer. This roadmap addresses the critical gaps identified in the PRD analysis while building upon the existing strengths. By focusing on core completion first (Round Scripts, Delta Pills, Presets), then advanced features (Homebrew Editor, enhanced optimizers), and finally polish (advanced mechanics, UX refinements), the application will achieve the vision of becoming the definitive D&D optimization tool.

The structured approach ensures mathematical accuracy, user experience quality, and technical excellence while maintaining the Modern-Fantasy design aesthetic that distinguishes The Destiny Ledger in the market.

---

**Document Prepared By:** Claude (Anthropic)  
**Review Date:** 2025-01-06  
**Next Review:** After Priority 1 completion (estimated Week 4)