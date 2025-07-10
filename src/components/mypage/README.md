# MyPage Component

A responsive React component for the user profile/account management page built with TypeScript and Tailwind CSS.

## Overview

The MyPage component provides a comprehensive user profile interface with personal information management and reporting features. It's designed to be fully responsive across desktop, tablet, and mobile devices.

## Components Structure

### Main Components

- **MyPage.tsx** - Main page container that orchestrates the layout
- **MyPageBackground.tsx** - Provides the gradient background and layout wrapper
- **MyPageHeader.tsx** - Custom header with Coconut logo and user icon

### Feature Components

- **PersonalInfoCard.tsx** - Personal information display and editing section
- **ReportsSection.tsx** - Reports and analytics visualization area
- **ActionBox.tsx** - Reusable warning/action boxes for important actions
- **ReportChart.tsx** - Individual chart component for report visualization

## Features

### Personal Information Card

- Display user name, email, and gender information
- Edit and cancel functionality (buttons ready for implementation)
- Two action boxes:
  - Report access (warning style)
  - Account deletion (danger style)

### Reports Section

- Class creation statistics with visual charts
- Class participation tracking
- Grid layout of report cards
- Responsive chart display

### Responsive Design

- **Mobile (< 768px)**: Single column layout, stacked components
- **Tablet (768px - 1024px)**: Improved spacing and layout adjustments
- **Desktop (> 1024px)**: Two-column layout as per original design
- **Large Desktop (> 1280px)**: Full width layout matching design specs

## Usage

### Basic Usage

```tsx
import MyPage from '../pages/MyPage';

// In your routing setup
<Route path="/mypage" element={<MyPage />} />;
```

### Individual Component Usage

```tsx
import { PersonalInfoCard, ReportsSection } from '../components/mypage';

function CustomPage() {
  return (
    <div>
      <PersonalInfoCard />
      <ReportsSection />
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes and follows the design system:

- Primary colors: Blue gradient background (#EFF6FF to #F9FAFB)
- Card backgrounds: White with subtle shadows
- Borders: Gray-200 for card outlines
- Typography: Inter font family
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- Screen reader friendly

## Dependencies

- React 19.1.0
- TypeScript
- Tailwind CSS 3.4.17
- Lucide React (for icons)

All dependencies are already included in the project.

## Future Enhancements

- Interactive form editing functionality
- Real data integration with backend APIs
- Chart animations and interactions
- Modal dialogs for dangerous actions
- User avatar upload functionality
