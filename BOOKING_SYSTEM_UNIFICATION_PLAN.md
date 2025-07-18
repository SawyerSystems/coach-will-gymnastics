# Booking System Unification Plan

## Current State Analysis

### 6 Booking Entry Points Identified:
1. **Home Page** → `EnhancedBookingModal` (new user)
2. **Parent Dashboard** → `EnhancedBookingModal` (parent portal)
3. **Booking Page** → `BookingModal` (legacy)
4. **Admin Panel** → `ManualBookingForm` (admin manual)
5. **Athlete Detail Modal** → Context-based
6. **Post-Login Flow** → `EnhancedBookingModal`

### Current Architecture Issues:
- Two separate booking modal systems (`BookingModal` vs `EnhancedBookingModal`)
- Admin manual booking uses separate form component
- Inconsistent step flows between different entry points
- Legacy booking page still uses old 6-step hardcoded flow
- Step validation logic duplicated across components

## Unified Architecture Solution

### Single Booking System Components:
```
UnifiedBookingModal
├── BookingFlowProvider (context)
├── BookingWizard (step orchestrator)
└── booking-steps/ (individual step components)
    ├── LessonTypeStep
    ├── AthleteSelectStep (with admin override)
    ├── AthleteInfoFormStep
    ├── FocusAreasStep
    ├── ScheduleStep
    ├── ParentInfoStep (with admin override)
    ├── SafetyStep
    ├── WaiverStep
    └── PaymentStep (with admin override)
```

### Flow Type Definitions:
```typescript
export const BOOKING_FLOWS = {
  'new-user': [
    'lessonType',
    'athleteInfoForm',
    'focusAreas', 
    'schedule',
    'parentInfoForm',
    'safety',
    'waiver',
    'payment'
  ],
  'parent-portal': [
    'lessonType',
    'athleteSelect',
    'focusAreas',
    'schedule', 
    'parentConfirm',
    'safety',
    'waiver',
    'payment'
  ],
  'athlete-modal': [
    'lessonType',
    'athleteSelectIfSemi', // Only show if semi-private
    'focusAreas',
    'schedule',
    'parentConfirm',
    'safety', 
    'waiver',
    'payment'
  ],
  'admin-new-athlete': [
    'lessonType',
    'athleteInfoForm',
    'focusAreas',
    'schedule',
    'parentInfoForm',
    'adminPayment' // Admin can book without payment
  ],
  'admin-existing-athlete': [
    'lessonType',
    'athleteSelect',
    'focusAreas', 
    'schedule',
    'parentConfirm',
    'adminPayment'
  ],
  'admin-from-athlete': [
    'lessonType',
    'focusAreas',
    'schedule', 
    'parentConfirm',
    'adminPayment'
  ]
} as const;
```

### Universal Step Order Rules:
1. **Always start with Lesson Type** - determines private/semi-private logic
2. **Athlete selection logic**:
   - New users: `athleteInfoForm` (create new)
   - Parent portal: `athleteSelect` (choose from existing)
   - Athlete modal: `athleteSelectIfSemi` (only if semi-private selected)
   - Admin: Either `athleteSelect` or `athleteInfoForm` based on context
3. **Focus Areas** - universal step for all flows
4. **Schedule** - universal step for all flows  
5. **Parent Info**:
   - New users: `parentInfoForm` (full form)
   - Existing: `parentConfirm` (editable prefilled)
   - Admin: `parentConfirm` or skip entirely
6. **Safety** - universal step (skip for admin flows)
7. **Waiver** - universal step (skip for admin flows) 
8. **Payment**:
   - Public flows: `payment` (Stripe checkout)
   - Admin flows: `adminPayment` (optional, mark as paid/pending)

## Implementation Steps

### Phase 1: Enhance BookingFlowContext
- [ ] Add new flow types for admin contexts
- [ ] Update BOOKING_FLOWS with all 6 flow definitions
- [ ] Add admin-specific state management
- [ ] Add step skipping logic for admin flows

### Phase 2: Enhance Step Components  
- [ ] Add admin mode props to all step components
- [ ] Update AthleteSelectStep with admin athlete creation
- [ ] Update ParentInfoStep with admin parent creation
- [ ] Create AdminPaymentStep component
- [ ] Add proper validation for each flow type

### Phase 3: Replace Legacy Components
- [ ] Update booking.tsx to use UnifiedBookingModal
- [ ] Replace ManualBookingForm with UnifiedBookingModal
- [ ] Remove old BookingModal component
- [ ] Update all import statements

### Phase 4: Implement Admin Booking Integration
- [ ] Add admin booking triggers in AdminBookingManager
- [ ] Implement proper parent/athlete association logic
- [ ] Add admin-specific API endpoints if needed
- [ ] Test admin manual booking flow

### Phase 5: Testing & Cleanup
- [ ] Test all 6 booking flows end-to-end
- [ ] Verify step validation works correctly
- [ ] Ensure proper data persistence across steps
- [ ] Remove unused components and imports

## Benefits of Unified System

1. **Consistency** - All booking flows use same step components and validation
2. **Maintainability** - Single source of truth for booking logic
3. **Flexibility** - Easy to add new flow types or modify step order
4. **Admin Efficiency** - Admins get same polished experience as users
5. **Code Reduction** - Eliminate duplicate booking components
6. **Better UX** - Consistent step indicators and navigation across all contexts

## File Changes Required

### New Files:
- `UnifiedBookingModal.tsx` (wrapper component)
- `AdminPaymentStep.tsx` (admin-specific payment handling)

### Modified Files:
- `BookingFlowContext.tsx` (add admin flows)
- `AthleteSelectStep.tsx` (admin athlete creation)
- `ParentInfoStep.tsx` (admin parent creation) 
- `booking.tsx` (use unified modal)
- `AdminBookingManager.tsx` (integrate unified modal)
- `home.tsx` (use unified modal - already good)
- `parent-dashboard.tsx` (use unified modal - already good)

### Removed Files:
- `booking-modal.tsx` (legacy component)
- Manual booking form logic in `AdminBookingManager.tsx`
