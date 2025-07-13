import { createContext, useContext, useState, ReactNode } from 'react';
import { LESSON_TYPES } from '@/lib/constants';

export type BookingFlowType = 'parent-portal' | 'athlete-modal' | 'new-user';

interface AthleteInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  allergies: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
}

interface BookingAthlete {
  athleteId: number;
  slotOrder: number;
  name: string;
  dateOfBirth: string;
  allergies?: string;
  experience: string;
  photo?: string;
}

export interface BookingFlowState {
  flowType: BookingFlowType;
  currentStep: number;
  parentId?: number;
  lessonType: string;
  selectedAthletes: number[];
  selectedTimeSlot: { date: string; time: string } | null;
  parentInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  } | null;
  athleteInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    allergies: string;
    experience: 'beginner' | 'intermediate' | 'advanced';
  }[];
  safetyContact: {
    willDropOff?: boolean;
    willPickUp?: boolean;
    dropoffPersonName: string;
    dropoffPersonRelationship: string;
    dropoffPersonPhone: string;
    pickupPersonName: string;
    pickupPersonRelationship: string;
    pickupPersonPhone: string;
  } | null;
  waiverStatus: {
    signed: boolean;
    signedAt?: Date;
  };
  focusAreas: string[];
}

// Define flow steps for each booking context
export const BOOKING_FLOWS = {
  'parent-portal': [
    'lessonType',
    'athleteSelect',
    'focusAreas',
    'schedule',
    'parentConfirm',
    'safety',
    'waiver',
    'payment',
  ],
  'athlete-modal': [
    'lessonType',
    'athleteSelectIfSemi',
    'focusAreas',
    'schedule',
    'parentConfirm',
    'safety',
    'waiver',
    'payment',
  ],
  'new-user': [
    'lessonType',
    'athleteInfoForm',
    'focusAreas',
    'schedule',
    'parentInfoForm',
    'safety',
    'waiver',
    'payment',
  ]
} as const;

interface BookingFlowContextType {
  state: BookingFlowState;
  updateState: (updates: Partial<BookingFlowState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  getCurrentStepName: () => string;
  isLastStep: () => boolean;
  resetFlow: () => void;
}

const BookingFlowContext = createContext<BookingFlowContextType | undefined>(undefined);

const initialState: BookingFlowState = {
  flowType: 'new-user',
  currentStep: 0,
  lessonType: '',
  selectedAthletes: [],
  selectedTimeSlot: null,
  parentInfo: null,
  athleteInfo: [],
  safetyContact: null,
  waiverStatus: { signed: false },
  focusAreas: [],
};

interface BookingFlowProviderProps {
  children: ReactNode;
  flowType?: BookingFlowType;
  initialState?: Partial<BookingFlowState>;
}

export function BookingFlowProvider({ 
  children, 
  flowType = 'new-user',
  initialState: customInitialState 
}: BookingFlowProviderProps) {
  const mergedState = {
    ...initialState,
    ...customInitialState,
    flowType,
  };

  console.log("BookingFlowProvider initializing with:", {
    flowType,
    customInitialState,
    mergedState: {
      ...mergedState,
      parentInfo: mergedState.parentInfo ? {
        firstName: mergedState.parentInfo.firstName,
        lastName: mergedState.parentInfo.lastName,
        email: mergedState.parentInfo.email,
        phone: mergedState.parentInfo.phone
      } : null
    }
  });

  const [state, setState] = useState<BookingFlowState>(mergedState);

  const updateState = (updates: Partial<BookingFlowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const getCurrentFlow = () => BOOKING_FLOWS[state.flowType];

  const getCurrentStepName = () => {
    const flow = getCurrentFlow();
    return flow[state.currentStep] || flow[0];
  };

  const nextStep = () => {
    const flow = getCurrentFlow();
    if (state.currentStep < flow.length - 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const prevStep = () => {
    if (state.currentStep > 0) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const isLastStep = () => {
    const flow = getCurrentFlow();
    return state.currentStep >= flow.length - 1;
  };

  const resetFlow = () => {
    setState(initialState);
  };

  const value = {
    state,
    updateState,
    nextStep,
    prevStep,
    getCurrentStepName,
    isLastStep,
    resetFlow,
  };

  return (
    <BookingFlowContext.Provider value={value}>
      {children}
    </BookingFlowContext.Provider>
  );
}

export function useBookingFlow() {
  const context = useContext(BookingFlowContext);
  if (!context) {
    throw new Error('useBookingFlow must be used within a BookingFlowProvider');
  }
  return context;
}