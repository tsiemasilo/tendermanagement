# Tender Management Application Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from productivity tools like Notion and Linear for data management, combined with calendar interfaces like Google Calendar for the timeline view.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Dark Blue: 220 85% 15% (primary background and headers)
- White: 0 0% 100% (text and card backgrounds)
- Orange: 25 95% 55% (accent color for CTAs and highlights)

**Supporting Colors:**
- Light Gray: 220 15% 95% (subtle backgrounds)
- Medium Gray: 220 10% 60% (secondary text)
- Success Green: 140 70% 45% (on-time submissions)
- Warning Yellow: 45 95% 65% (approaching deadlines)
- Danger Red: 0 85% 60% (overdue items)

### B. Typography
- **Primary Font**: Inter (Google Fonts)
- **Headings**: 600-700 weight, dark blue or white depending on background
- **Body Text**: 400-500 weight, ensuring high contrast
- **Data/Numbers**: 500 weight for tender numbers and dates

### C. Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, and 8 (p-2, h-8, m-4, gap-6)
- Consistent 4-unit spacing for component padding
- 6-unit spacing between major sections
- 8-unit spacing for page margins

### D. Component Library

**Calendar Components:**
- Monthly grid with clear date cells
- Hover states with subtle elevation
- Color-coded date indicators based on submission proximity
- Compact tender preview cards within date cells

**Data Display:**
- Clean tables with alternating row backgrounds
- Editable fields with clear visual indicators
- Status badges for briefing session requirements
- Modal overlays for detailed tender information

**Navigation:**
- Top navigation bar with Alteram logo
- Breadcrumb navigation for context
- Quick action buttons with orange accent color

**Forms:**
- Input fields with dark blue borders
- Date pickers matching calendar aesthetic
- Clear validation states and error messaging

### E. Visual Treatments

**Background:**
- Alteram logo as watermark background (10-15% opacity)
- Positioned bottom-right, non-interfering with content
- Dark blue gradient overlay for depth

**Calendar Color Coding:**
- Green indicator: Submissions due >7 days
- Yellow indicator: Submissions due 3-7 days  
- Orange indicator: Submissions due 1-3 days
- Red indicator: Overdue submissions

**Interactive Elements:**
- Subtle shadows on hover for clickable elements
- Smooth transitions (200ms) for state changes
- Orange focus rings for accessibility

## Key Design Principles

1. **Information Hierarchy**: Critical tender data prominently displayed
2. **Visual Scanning**: Easy identification of deadline proximity through color coding
3. **Data Density**: Efficient use of space while maintaining readability
4. **Professional Aesthetic**: Clean, business-appropriate styling
5. **Accessibility**: High contrast ratios and clear interaction states

## Images
No large hero image required. The Alteram logo should be used as a subtle background watermark throughout the application, maintaining low opacity to avoid interfering with content readability.