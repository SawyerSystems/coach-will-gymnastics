import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BookingFlowProvider, type BookingFlowState, type BookingFlowType } from "@/contexts/BookingFlowContext";
import { apiRequest } from "@/lib/queryClient";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { Athlete, Parent } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { BookingWizard } from "./BookingWizard";

interface UnifiedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Context-specific props
  parentData?: Parent | null;
  selectedAthletes?: Athlete[];
  preSelectedAthleteId?: number;
  isNewParent?: boolean;
  isAdminFlow?: boolean;
  adminContext?: 'new-athlete' | 'existing-athlete' | 'from-athlete';
  
  // Legacy support
  initialLessonType?: string;
  suggestedFocusAreas?: string[];
}

export function UnifiedBookingModal({ 
  isOpen, 
  onClose, 
  parentData = null,
  selectedAthletes = [], 
  preSelectedAthleteId,
  isNewParent = false,
  isAdminFlow = false,
  adminContext,
  initialLessonType,
  suggestedFocusAreas = []
}: UnifiedBookingModalProps) {
  
  // Check if user is a logged-in parent (only if no parent data provided and not admin)
  const { data: parentAuthStatus } = useQuery({
    queryKey: ['/api/parent-auth/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/parent-auth/status');
      return await response.json();
    },
    enabled: !isAdminFlow && !parentData, // Only check if not admin and no parent data provided
  });

  // Determine flow type based on context
  const determineFlowType = (): BookingFlowType => {
    // Admin flows
    if (isAdminFlow) {
      if (adminContext === 'new-athlete') return 'admin-new-athlete';
      if (adminContext === 'existing-athlete') return 'admin-existing-athlete';
      if (adminContext === 'from-athlete' || preSelectedAthleteId) return 'admin-from-athlete';
      return 'admin-new-athlete'; // Default admin flow
    }

    // Public flows - prioritize explicit parent data over auth status
    const hasParentData = parentData !== null && parentData !== undefined;
    const loggedInParent = hasParentData || parentAuthStatus?.loggedIn;
    
    // New user flow (no parent, or explicitly marked as new)
    if (isNewParent || (!loggedInParent && !hasParentData)) {
      return 'new-user';
    }
    
    // Athlete-specific flow (from athlete modal or pre-selected)
    if (preSelectedAthleteId || selectedAthletes.length > 0) {
      return 'athlete-modal';
    }
    
    // Logged-in parent flow (parent portal or home/booking page access)
    if (loggedInParent) {
      return 'parent-portal';
    }
    
    return 'new-user'; // Default fallback
  };

  const flowType = determineFlowType();

  // Prepare initial state based on context
  const getInitialState = (): BookingFlowState => {
    const baseState: BookingFlowState = {
      flowType,
      currentStep: 0,
      lessonType: initialLessonType || '',
      selectedAthletes: selectedAthletes.map(a => a.id) || (preSelectedAthleteId ? [preSelectedAthleteId] : []),
      selectedTimeSlot: null,
      parentInfo: null,
      athleteInfo: [],
      safetyContact: null,
      waiverStatus: { signed: false },
      focusAreas: suggestedFocusAreas,
      isAdminFlow,
      adminNotes: '',
    };

    // Set parent info based on priority: explicit parentData > auth status > none
    if (parentData) {
      // Explicit parent data provided (from home page login or parent portal)
      baseState.parentInfo = {
        firstName: parentData.firstName || '',
        lastName: parentData.lastName || '',
        email: parentData.email || '',
        phone: parentData.phone || '',
        emergencyContactName: parentData.emergencyContactName || '',
        emergencyContactPhone: parentData.emergencyContactPhone || ''
      };
      baseState.parentId = parentData.id;
    } else if (parentAuthStatus?.loggedIn) {
      // Fallback to auth status if available (when parentData not provided)
      if (parentAuthStatus.parentData) {
        const authParent = parentAuthStatus.parentData;
        baseState.parentInfo = {
          firstName: authParent.firstName || '',
          lastName: authParent.lastName || '',
          email: authParent.email || '',
          phone: authParent.phone || '',
          emergencyContactName: authParent.emergencyContactName || '',
          emergencyContactPhone: authParent.emergencyContactPhone || ''
        };
        baseState.parentId = authParent.id;
      } else {
        // Basic auth info only
        baseState.parentInfo = {
          firstName: '',
          lastName: '',
          email: parentAuthStatus.email || '',
          phone: '',
          emergencyContactName: '',
          emergencyContactPhone: ''
        };
        baseState.parentId = parentAuthStatus.parentId;
      }
    }

    // Pre-fill athlete info if coming from athlete context
    if (selectedAthletes.length > 0) {
      baseState.athleteInfo = selectedAthletes.map(athlete => ({
        firstName: athlete.firstName || '',
        lastName: athlete.lastName || '',
        dateOfBirth: athlete.dateOfBirth || '',
        allergies: athlete.allergies || '',
        experience: (athlete.experience === 'beginner' || athlete.experience === 'intermediate' || athlete.experience === 'advanced') 
          ? athlete.experience as 'beginner' | 'intermediate' | 'advanced'
          : 'beginner'
      }));
    }

    return baseState;
  };

  const initialState = getInitialState();

  console.log("UnifiedBookingModal rendered with:", {
    flowType,
    isOpen,
    parentData: parentData ? {
      id: parentData.id,
      firstName: parentData.firstName,
      lastName: parentData.lastName,
      email: parentData.email
    } : null,
    selectedAthletes: selectedAthletes.length,
    isNewParent,
    isAdminFlow,
    adminContext,
    preSelectedAthleteId,
    initialState
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-full max-h-full sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>
            {isAdminFlow ? 'Admin Booking Management' : 'Book a Gymnastics Session'}
          </DialogTitle>
        </VisuallyHidden>
        <BookingFlowProvider flowType={flowType} initialState={initialState}>
          <BookingWizard onClose={onClose} />
        </BookingFlowProvider>
      </DialogContent>
    </Dialog>
  );
}
