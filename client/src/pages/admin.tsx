import { AthleteDetailDialog } from "@/components/AthleteDetailDialog";
import { GenderSelect } from "@/components/GenderSelect";
import { PaymentsTab } from "@/components/PaymentsTab";
import { UnifiedBookingModal } from "@/components/UnifiedBookingModal";
import { UpcomingSessions } from "@/components/UpcomingSessions";
import { WaiverStatusDisplay } from "@/components/WaiverStatusDisplay";
import { AdminBookingManager } from "@/components/admin-booking-manager";
import { AdminLessonTypeManager } from "@/components/admin-lesson-type-manager";
import { AdminSiteContentManager } from "@/components/admin-site-content-manager";
import { AdminWaiverManagement } from "@/components/admin-waiver-management";
import AdminMessagesTab from "@/components/admin/AdminMessagesTab";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AthleteProgressPage from "@/components/admin/AthleteProgressPage";
import { ContentSection, SectionBasedContentEditor } from "@/components/section-based-content-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import AdminPayoutsTab from "@/components/admin/AdminPayoutsTab";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAvailability, useCreateAvailabilityException, useDeleteAvailability, useDeleteAvailabilityException, useUpdateAvailability } from "@/hooks/use-availability";
import { useFixDialogAccessibility } from "@/hooks/use-fix-dialog-accessibility";
import { useToast } from "@/hooks/use-toast";
import { useMissingWaivers } from "@/hooks/use-waiver-status";
import { calculateAge } from "@/lib/dateUtils";
import { apiRequest } from "@/lib/queryClient";
import type { Athlete, Availability, AvailabilityException, BlogPost, Booking, InsertAthlete, InsertAvailability, InsertAvailabilityException, InsertBlogPost, Parent, Tip } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    BarChart,
    Calendar,
    CalendarDays,
    CalendarX,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    Dumbbell,
    Edit,
    Eye,
    Info,
    Loader2,
    Mail,
    Menu,
    MessageCircle,
    MessageSquare,
    Phone,
    Plus,
    RefreshCw,
    Save,
    Search,
    Star,
    Trash2,
    User,
    UserCircle,
    Users,
    X
} from "lucide-react";
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useLessonTypes } from "@/hooks/useLessonTypes";
import { useLocation } from "wouter";

// Lazy load heavy admin sub-pages to keep initial bundle light
const AdminSkillsManager = lazy(() => import("@/components/admin/AdminSkillsManager"));

export default function Admin() {
  const [, setLocation] = useLocation();
  
  // ALL STATE HOOKS FIRST
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window?.innerWidth >= 768); // Default to open on desktop only
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false); // Track sidebar collapsed state
  const [activeTab, setActiveTab] = useState<string>("bookings");
  
  // Set sidebar open state based on window size with enhanced mobile support
  useEffect(() => {
    const handleResize = () => {
      // Only auto-show sidebar on larger screens (md breakpoint)
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    
    // Add resize listener with passive option for better performance
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initial check
    handleResize();
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [newPost, setNewPost] = useState<InsertBlogPost>({ title: "", content: "", excerpt: "", category: "", imageUrl: null });
  const [newPostSections, setNewPostSections] = useState<ContentSection[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingPostSections, setEditingPostSections] = useState<ContentSection[]>([]);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [editingTipSections, setEditingTipSections] = useState<ContentSection[]>([]);
  const [newTip, setNewTip] = useState({
    title: "",
    content: "",
    category: "vault",
    difficulty: "beginner",
    videoUrl: "",
  });
  const [newTipSections, setNewTipSections] = useState<ContentSection[]>([]);
  
  const [newAvailability, setNewAvailability] = useState<InsertAvailability>({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    isRecurring: true,
    isAvailable: true
  });
  
  const [newException, setNewException] = useState<InsertAvailabilityException>({
    date: new Date(),
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: false,
    reason: ""
  });
  
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [isAthleteViewOpen, setIsAthleteViewOpen] = useState(false);
  const [isAthleteEditOpen, setIsAthleteEditOpen] = useState(false);
  const [editIsGymMember, setEditIsGymMember] = useState<boolean>(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [isPhotoEnlarged, setIsPhotoEnlarged] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isManualBookingFromAthlete, setIsManualBookingFromAthlete] = useState(false);
  
  // Unified booking modal state
  const [showUnifiedBooking, setShowUnifiedBooking] = useState(false);
  const [adminBookingContext, setAdminBookingContext] = useState<'new-athlete' | 'existing-athlete' | 'from-athlete'>('new-athlete');
  const [preSelectedAthleteId, setPreSelectedAthleteId] = useState<number | undefined>();
  
  // Parent management state
  const [isParentEditOpen, setIsParentEditOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<any>(null);
  const [viewingParent, setViewingParent] = useState<any>(null);
  
  // Athletes search state
  const [athleteSearchTerm, setAthleteSearchTerm] = useState<string>("");
  
  // Parents state
  const [parentSearchTerm, setParentSearchTerm] = useState<string>("");
  const [currentParentPage, setCurrentParentPage] = useState(1);
  const [selectedParent, setSelectedParent] = useState<any>(null);
  
  // Delete athlete error state
  const [deleteAthleteError, setDeleteAthleteError] = useState<{
    athlete: Athlete;
    activeBookings: Booking[];
  } | null>(null);
  
  // Analytics state
  const [analyticsDateRange, setAnalyticsDateRange] = useState({ start: '', end: '' });
  const [analyticsLessonType, setAnalyticsLessonType] = useState('all');
  
  // Developer Settings state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteUsersConfirmOpen, setIsDeleteUsersConfirmOpen] = useState(false);
  
  // ALL UTILITY HOOKS
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fix dialog accessibility issues
  useFixDialogAccessibility();

  // Keep membership toggle in sync with selected athlete when edit opens/changes
  useEffect(() => {
    if (isAthleteEditOpen && selectedAthlete) {
      setEditIsGymMember(!!selectedAthlete.isGymMember);
    }
  }, [isAthleteEditOpen, selectedAthlete]);
  
  // ALL QUERIES
  const { data: authStatus, isLoading: authLoading } = useQuery<{ loggedIn: boolean; adminId?: number }>({
    queryKey: ['/api/auth/status'],
    queryFn: () => apiRequest('GET', '/api/auth/status').then(res => res.json()),
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
    queryFn: () => apiRequest('GET', '/api/bookings').then(res => res.json()),
    enabled: !!authStatus?.loggedIn,
  });

  // Include archived bookings (completed, no-show, cancelled) so totals/analytics are ALL bookings
  const { data: archivedBookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/archived-bookings'],
    queryFn: () => apiRequest('GET', '/api/archived-bookings').then(res => res.json()),
    enabled: !!authStatus?.loggedIn,
  });

  const { data: blogPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog-posts'],
    queryFn: () => apiRequest('GET', '/api/blog-posts').then(res => res.json()),
    enabled: !!authStatus?.loggedIn,
  });

  const { data: tips = [] } = useQuery<Tip[]>({
    queryKey: ['/api/tips'],
    queryFn: () => apiRequest('GET', '/api/tips').then(res => res.json()),
    enabled: !!authStatus?.loggedIn,
  });

  const { data: parents = [] } = useQuery<Parent[]>({
    queryKey: ['/api/parents'],
    queryFn: () => apiRequest('GET', '/api/parents').then(res => res.json()),
    enabled: !!authStatus?.loggedIn,
  });

  // Enhanced parents query with pagination and search
  const { 
    data: parentsData, 
    isLoading: parentsLoading, 
    refetch: refetchParents 
  } = useQuery({
    queryKey: ['/api/parents', { search: parentSearchTerm, page: currentParentPage, limit: 20 }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentParentPage.toString(),
        limit: '20'
      });
      
      if (parentSearchTerm.trim()) {
        params.append('search', parentSearchTerm.trim());
      }
      
      const response = await apiRequest('GET', `/api/parents?${params.toString()}`);
      return await response.json();
    },
    enabled: !!authStatus?.loggedIn,
  });

  const { data: athletes = [] } = useQuery<Athlete[]>({
    queryKey: ['/api/athletes'],
    queryFn: () => apiRequest('GET', '/api/athletes').then(res => res.json()),
    enabled: !!authStatus?.loggedIn,
  });

  // Lesson types for pricing + dynamic analytics
  const { data: lessonTypes = [] } = useLessonTypes();

  const lessonTypesById = useMemo(() => {
    const map = new Map<number, any>();
    (lessonTypes || []).forEach((lt: any) => {
      if (typeof lt?.id === 'number') map.set(lt.id, lt);
    });
    return map;
  }, [lessonTypes]);

  const lessonTypesByName = useMemo(() => {
    const map = new Map<string, any>();
    (lessonTypes || []).forEach((lt: any) => {
      if (lt?.name) map.set(lt.name, lt);
    });
    return map;
  }, [lessonTypes]);

  // Query for detailed parent information when one is selected
  const { data: selectedParentDetails } = useQuery({
    queryKey: ['/api/parents', viewingParent?.id],
    queryFn: async () => {
      if (!viewingParent?.id) return null;
      try {
        const response = await apiRequest('GET', `/api/parents/${viewingParent.id}`);
        if (!response.ok) return null; // Handle 404 gracefully
        return await response.json();
      } catch (error) {
        console.warn(`Parent ${viewingParent.id} not found:`, error);
        return null;
      }
    },
    enabled: !!authStatus?.loggedIn && !!viewingParent?.id,
    retry: false, // Don't retry 404s
  });

  const { data: availability = [] } = useQuery<Availability[]>({
    queryKey: ["/api/availability"],
    queryFn: () => apiRequest("GET", "/api/availability").then(res => res.json()),
    enabled: !!authStatus?.loggedIn,
  });

  const { data: availabilityExceptions = [] } = useQuery<AvailabilityException[]>({
    queryKey: ["/api/availability-exceptions"],
    queryFn: () => apiRequest("GET", "/api/availability-exceptions").then(res => res.json()),
    enabled: !!authStatus?.loggedIn,
  });

  const { data: missingWaivers = [] } = useMissingWaivers(!!authStatus?.loggedIn) as { data: Athlete[] };

  // ALL MUTATIONS
  // Delete parent mutation
  const deleteParentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/parents/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete parent");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      toast({ title: "Parent deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting parent",
        description: error.message || "Failed to delete parent",
        variant: "destructive",
      });
    },
  });
  const createAvailabilityMutation = useCreateAvailability();
  const updateAvailabilityMutation = useUpdateAvailability();
  const deleteAvailabilityMutation = useDeleteAvailability();
  const createExceptionMutation = useCreateAvailabilityException();
  const deleteExceptionMutation = useDeleteAvailabilityException();

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({ title: "Booking updated successfully" });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/bookings/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({ title: "Booking deleted successfully" });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/bookings/${id}/confirm-payment`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to confirm payment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({ 
        title: "Payment Confirmed", 
        description: "Confirmation email has been sent to the parent." 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const createBlogPostMutation = useMutation({
    mutationFn: async (post: InsertBlogPost) => {
      const response = await apiRequest("POST", "/api/blog-posts", post);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      setNewPost({ title: "", content: "", excerpt: "", category: "", imageUrl: null });
      setNewPostSections([]);
      toast({ title: "Blog post created successfully" });
    },
  });

  const updateBlogPostMutation = useMutation({
    mutationFn: async (post: BlogPost) => {
      const response = await apiRequest("PUT", `/api/blog-posts/${post.id}`, post);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      setEditingPost(null);
      toast({ title: "Blog post updated successfully" });
    },
  });

  const deleteBlogPostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/blog-posts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      toast({ title: "Blog post deleted successfully" });
    },
  });

  const createTipMutation = useMutation({
    mutationFn: async (tip: any) => {
      const response = await apiRequest("POST", "/api/tips", tip);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tips'] });
      setNewTip({ title: "", content: "", category: "vault", difficulty: "beginner", videoUrl: "" });
      setNewTipSections([]);
      toast({ title: "Tip created successfully" });
    },
  });

  const updateTipMutation = useMutation({
    mutationFn: async (tip: Tip) => {
      const response = await apiRequest("PUT", `/api/tips/${tip.id}`, tip);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tips'] });
      setEditingTip(null);
      toast({ title: "Tip updated successfully" });
    },
  });

  const deleteTipMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/tips/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tips'] });
      toast({ title: "Tip deleted successfully" });
    },
  });

  const deleteAthleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/athletes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/athletes'] });
      toast({ title: "Athlete deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Cannot delete athlete",
        description: error.message || "This athlete has active bookings. Please cancel or complete all bookings first.",
        variant: "destructive",
      });
    },
  });

  const updateAthleteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertAthlete> }) => {
      const response = await apiRequest("PATCH", `/api/athletes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/athletes'] });
      setIsAthleteEditOpen(false);
      toast({ title: "Athlete updated successfully" });
    },
    onError: (error: any) => {
      let description = "Failed to update athlete";
      if (error instanceof Error && error.message) {
        // Try to parse backend error JSON if present
        try {
          const match = error.message.match(/\{.*\}$/);
          if (match) {
            const errObj = JSON.parse(match[0]);
            if (errObj.error) description = errObj.error;
            if (errObj.details && errObj.details.fieldErrors) {
              description += ': ' + Object.entries(errObj.details.fieldErrors)
                .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
                .join('; ');
            }
          }
        } catch {}
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async ({ type, email }: { type: string, email: string }) => {
      const response = await apiRequest("POST", "/api/test-email", { type, email });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Test email sent successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Email test failed", 
        description: error.message || "Failed to send test email",
        variant: "destructive"
      });
    },
  });

  // Developer Settings Mutations
  const clearDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/clear-test-data");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/athletes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      setIsDeleteConfirmOpen(false);
      toast({ 
        title: "Data cleared successfully", 
        description: `Cleared ${data.cleared.bookings} bookings, ${data.cleared.athletes} athletes, ${data.cleared.parents} parents, ${data.cleared.waivers || 0} waiver files`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error clearing data",
        description: error.message || "Failed to clear test data",
        variant: "destructive",
      });
    },
  });

  const generateBookingsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/generate-test-bookings");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/athletes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      toast({ 
        title: "Test bookings generated", 
        description: `Created ${data.count || 5} sample bookings`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error generating bookings",
        description: error.message || "Failed to generate test bookings",
        variant: "destructive",
      });
    },
  });

  const createParentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/parent-auth/create-test-parent", {
        email: "test@example.com",
        name: "Test Parent"
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      toast({ 
        title: "Test parent created", 
        description: `Created parent account: ${data.parent?.email}`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating parent",
        description: error.message || "Failed to create test parent",
        variant: "destructive",
      });
    },
  });

  const paymentSimulationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/simulate-payment-success");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({ 
        title: "Payment simulation complete", 
        description: `Updated ${data.updated || 0} bookings to session-paid`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error simulating payments",
        description: error.message || "Failed to simulate payment success",
        variant: "destructive",
      });
    },
  });

  const paymentResetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/reset-payment-status");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({ 
        title: "Payment status reset", 
        description: `Reset ${data.updated || 0} bookings to reservation-paid`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error resetting payments",
        description: error.message || "Failed to reset payment status",
        variant: "destructive",
      });
    },
  });

  const healthCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/health-check");
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Health check complete", 
        description: `${data.passed}/${data.total} tests passed`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Health check failed",
        description: error.message || "System health check failed",
        variant: "destructive",
      });
    },
  });

  const databaseTestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/database-test");
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Database test complete", 
        description: data.message || "Database connection successful"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Database test failed",
        description: error.message || "Database connection test failed",
        variant: "destructive",
      });
    },
  });

  const deleteUserAccountsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/delete-user-accounts");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ 
        title: "User accounts deleted", 
        description: data.message
      });
      setIsDeleteUsersConfirmOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete user accounts",
        description: error.message || "Error deleting user accounts",
        variant: "destructive"
      });
    }
  });

  // MEMO VALUES
  const parentMapping = useMemo(() => {
    const mapping = new Map();
    bookings.forEach(booking => {
      if (booking.athlete1Name) {
        const key = `${booking.athlete1Name}-${booking.athlete1DateOfBirth}`;
        if (!mapping.has(key)) {
          mapping.set(key, {
            id: booking.id,
            firstName: booking.parent?.firstName || booking.parentFirstName || '',
            lastName: booking.parent?.lastName || booking.parentLastName || '',
            email: booking.parent?.email || booking.parentEmail || '',
            phone: booking.parent?.phone || booking.parentPhone || '',
            emergencyContactName: booking.parent?.emergencyContactName || booking.emergencyContactName || '',
            emergencyContactPhone: booking.parent?.emergencyContactPhone || booking.emergencyContactPhone || '',
            waiverSigned: booking.waiverId ? true : false,
            waiverSignedAt: null // Waiver timestamp not available in this context
          });
        }
      }
      
      if (booking.athlete2Name) {
        const key = `${booking.athlete2Name}-${booking.athlete2DateOfBirth}`;
        if (!mapping.has(key)) {
          mapping.set(key, {
            id: booking.id,
            firstName: booking.parent?.firstName || booking.parentFirstName || '',
            lastName: booking.parent?.lastName || booking.parentLastName || '',
            email: booking.parent?.email || booking.parentEmail || '',
            phone: booking.parent?.phone || booking.parentPhone || '',
            emergencyContactName: booking.parent?.emergencyContactName || booking.emergencyContactName || '',
            emergencyContactPhone: booking.parent?.emergencyContactPhone || booking.emergencyContactPhone || '',
            waiverSigned: booking.waiverId ? true : false,
            waiverSignedAt: null // Waiver timestamp not available in this context
          });
        }
      }
    });
    return mapping;
  }, [bookings]);

  // EFFECTS
  useEffect(() => {
    if (!authLoading && (!authStatus || !authStatus.loggedIn)) {
      setLocation('/admin/login');
    }
  }, [authStatus, authLoading, setLocation]);

  useEffect(() => {
    if (editingPost) {
      setEditingPostSections(contentToSections(editingPost.content));
    }
  }, [editingPost]);

  useEffect(() => {
    if (editingTip) {
      setEditingTipSections(contentToSections(editingTip.content));
    }
  }, [editingTip]);

  // EARLY RETURNS AFTER ALL HOOKS
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!authStatus?.loggedIn) {
    return null;
  }

  // FUNCTIONS
  const sectionsToContent = (sections: ContentSection[]): string => {
    return sections.map(section => {
      if (section.type === 'text') {
        return section.content;
      } else if (section.type === 'image') {
        return `[IMAGE: ${section.content}]${section.caption ? `\nCaption: ${section.caption}` : ''}`;
      } else if (section.type === 'video') {
        return `[VIDEO: ${section.content}]${section.caption ? `\nCaption: ${section.caption}` : ''}`;
      }
      return '';
    }).join('\n\n');
  };

  const contentToSections = (content: string): ContentSection[] => {
    if (!content) return [];
    
    const lines = content.split('\n');
    const sections: ContentSection[] = [];
    let currentText = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('[IMAGE:') && line.includes(']')) {
        if (currentText.trim()) {
          sections.push({
            id: `section-${Date.now()}-${Math.random()}`,
            type: 'text',
            content: currentText.trim()
          });
          currentText = '';
        }
        
        const imageUrl = line.substring(7, line.indexOf(']')).trim();
        const caption = lines[i + 1]?.startsWith('Caption:') ? lines[i + 1].substring(8).trim() : undefined;
        sections.push({
          id: `section-${Date.now()}-${Math.random()}`,
          type: 'image',
          content: imageUrl,
          caption
        });
        if (caption) i++;
      } else if (line.startsWith('[VIDEO:') && line.includes(']')) {
        if (currentText.trim()) {
          sections.push({
            id: `section-${Date.now()}-${Math.random()}`,
            type: 'text',
            content: currentText.trim()
          });
          currentText = '';
        }
        
        const videoUrl = line.substring(7, line.indexOf(']')).trim();
        const caption = lines[i + 1]?.startsWith('Caption:') ? lines[i + 1].substring(8).trim() : undefined;
        sections.push({
          id: `section-${Date.now()}-${Math.random()}`,
          type: 'video',
          content: videoUrl,
          caption
        });
        if (caption) i++;
      } else {
        currentText += (currentText ? '\n' : '') + line;
      }
    }
    
    if (currentText.trim()) {
      sections.push({
        id: `section-${Date.now()}-${Math.random()}`,
        type: 'text',
        content: currentText.trim()
      });
    }
    
    return sections;
  };

  // Developer Settings Handler Functions
  const handleClearTestData = () => {
    clearDataMutation.mutate();
  };

  const handleGenerateTestBookings = () => {
    generateBookingsMutation.mutate();
  };

  const handleCreateTestParent = () => {
    createParentMutation.mutate();
  };

  const handleSimulatePaymentSuccess = () => {
    paymentSimulationMutation.mutate();
  };

  const handleResetPaymentStatus = () => {
    paymentResetMutation.mutate();
  };

  const handleSystemHealthCheck = () => {
    healthCheckMutation.mutate();
  };

  const handleDatabaseTest = () => {
    databaseTestMutation.mutate();
  };

  const handlePhotoClick = (photoUrl: string) => {
    setEnlargedPhoto(photoUrl);
    setIsPhotoEnlarged(true);
  };

  const openAthleteModal = (athleteId: string | number) => {
    console.log('🔍 openAthleteModal CALLED:', {
      athleteId,
      athleteIdType: typeof athleteId,
      athletesArray: athletes,
      athletesLength: athletes.length
    });
    
    const athlete = athletes.find(a => a.id === Number(athleteId));
    console.log('🔍 FOUND ATHLETE:', athlete);
    
    if (athlete) {
      console.log('🔍 SETTING SELECTED ATHLETE:', athlete);
      // Ensure other modals are closed first
      setIsAthleteEditOpen(false);
      
      // Set athlete and open modal
      setSelectedAthlete(athlete);
      setIsAthleteViewOpen(true);
      console.log('🔍 MODAL SHOULD BE OPEN NOW');
    } else {
      console.log('🔍 ATHLETE NOT FOUND!');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, athleteId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const compressedFile = await compressImage(file, 800, 0.8);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Photo = reader.result as string;
        
        const response = await apiRequest("PUT", `/api/athletes/${athleteId}/photo`, {
          photo: base64Photo
        });
        
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ['/api/athletes'] });
          toast({
            title: "Photo Updated",
            description: "Athlete photo has been successfully updated.",
          });
          setIsAthleteEditOpen(false);
        } else {
          throw new Error('Upload failed');
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const compressImage = (file: File, maxWidth: number, quality: number): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new blob with the file name attached as a property
            const compressedBlob = Object.assign(blob, { 
              name: file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
              lastModified: Date.now()
            });
            resolve(compressedBlob as File);
          }
        }, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleLogout = async () => {
    try {
      await apiRequest('GET', '/api/auth/logout');
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      setLocation('/admin/login');
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of the admin dashboard.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  // DASHBOARD STATS
  // Merge active + archived for "ALL" views
  const allBookings = useMemo(() => {
    return [...(bookings || []), ...(archivedBookings || [])];
  }, [bookings, archivedBookings]);

  const totalBookingsAll = allBookings.length;
  const totalParents = parents.length;

  // Upcoming = future date/time AND not cancelled/completed
  const isUpcoming = (b: Booking) => {
    if (!b?.preferredDate) return false;
    try {
      const time = (b.preferredTime && typeof b.preferredTime === 'string') ? b.preferredTime : '00:00:00';
      const dt = new Date(`${b.preferredDate}T${time}`);
      const now = new Date();
      const status = (b.attendanceStatus || '').toLowerCase();
      const notDone = status === 'pending' || status === 'confirmed';
      return notDone && dt >= now;
    } catch {
      return false;
    }
  };
  const upcomingBookingsCount = allBookings.filter(isUpcoming).length;
  const pendingBookings = allBookings.filter(b => b.attendanceStatus === "pending").length;
  const confirmedBookings = allBookings.filter(b => b.attendanceStatus === "confirmed").length;

  // ANALYTICS COMPUTED DATA
  const filteredBookingsForAnalytics = allBookings.filter(booking => {
    // Filter by date range
    if (analyticsDateRange.start && booking.preferredDate && booking.preferredDate < analyticsDateRange.start) return false;
    if (analyticsDateRange.end && booking.preferredDate && booking.preferredDate > analyticsDateRange.end) return false;
    
    // Filter by lesson type
    const lessonTypeName = (() => {
      const lt = booking.lessonType as any;
      if (lt && typeof lt === 'object' && 'name' in lt) return lt.name;
      if (typeof lt === 'string') return lt;
      if (booking.lessonTypeId && lessonTypesById.has(booking.lessonTypeId)) {
        return lessonTypesById.get(booking.lessonTypeId)?.name;
      }
      return undefined;
    })();
    if (analyticsLessonType !== 'all' && lessonTypeName !== analyticsLessonType) return false;
    
    return true;
  });

  // Calculate focus area statistics from ALL bookings in current filters
  const focusAreaStats = (() => {
    const areaCount = new Map<string, number>();
    filteredBookingsForAnalytics.forEach(booking => {
      if (booking.focusAreas && Array.isArray(booking.focusAreas)) {
        booking.focusAreas.forEach((area: string) => {
          areaCount.set(area, (areaCount.get(area) || 0) + 1);
        });
      }
    });
    return Array.from(areaCount.entries())
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count);
  })();

  // Calculate booking trends by month (ALL bookings, last 6 months), respects lesson type but ignores custom date range
  const bookingTrendData = (() => {
    const monthCount = new Map<string, number>();
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    const dataset = allBookings.filter(b => {
      if (!b.preferredDate) return false;
      const d = new Date(b.preferredDate);
      if (d < sixMonthsAgo) return false;
      // Respect lesson type selection
      if (analyticsLessonType !== 'all') {
        const name = (() => {
          const lt: any = (b as any).lessonType;
          if (lt && typeof lt === 'object' && 'name' in lt) return lt.name as string;
          if (typeof lt === 'string') return lt;
          if (b.lessonTypeId && lessonTypesById.has(b.lessonTypeId)) return lessonTypesById.get(b.lessonTypeId)?.name as string;
          return undefined;
        })();
        if (name !== analyticsLessonType) return false;
      }
      return true;
    });

    dataset.forEach(booking => {
      if (!booking.preferredDate) return;
      const date = new Date(booking.preferredDate);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthCount.set(monthKey, (monthCount.get(monthKey) || 0) + 1);
    });

    // Build the last 6 month labels
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      months.push(monthKey);
    }

    return months.map(month => ({
      month,
      count: monthCount.get(month) || 0
    }));
  })();

  // Filtered parents for local search when not using server-side search
  const filteredParents = parentsData?.parents || [];

  // Debug: Avg Booking Value breakdown when `?debugAvg` is present
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('debugAvg')) {
        const toNumber = (v: any) => {
          const n = Number(v);
          return Number.isFinite(n) ? n : 0;
        };
        const details = (allBookings || []).map((b: any) => {
          const bookingAmount = b?.amount;
          const amountNum = toNumber(bookingAmount);
          const ltObj = b?.lessonType;
          const ltId = b?.lessonTypeId;
          let ltFromId: any = undefined;
          let ltFromName: any = undefined;
          let resolved = 0;
          let source = '';
          if (amountNum > 0) {
            resolved = amountNum;
            source = 'booking.amount';
          } else if (ltId && lessonTypesById.has(ltId)) {
            ltFromId = lessonTypesById.get(ltId);
            resolved = toNumber(ltFromId?.price);
            source = 'lessonTypesById.price';
          } else if (ltObj && typeof ltObj === 'object' && 'price' in ltObj) {
            resolved = toNumber((ltObj as any)?.price);
            source = 'booking.lessonType.price';
          } else if (typeof ltObj === 'string' && lessonTypesByName.has(ltObj)) {
            ltFromName = lessonTypesByName.get(ltObj);
            resolved = toNumber(ltFromName?.price);
            source = 'lessonTypesByName.price';
          } else {
            source = 'unresolved(0)';
          }
          return {
            id: b?.id,
            lessonTypeId: ltId,
            lessonTypeName: typeof ltObj === 'string' ? ltObj : (ltObj?.name || undefined),
            bookingAmount,
            ltFromIdPrice: ltFromId?.price,
            ltFromNamePrice: ltFromName?.price,
            resolvedPrice: resolved,
            source,
          };
        });
        const sum = details.reduce((acc, d) => acc + toNumber(d.resolvedPrice), 0);
        const count = (allBookings || []).length;
        const known = details.filter(d => toNumber(d.resolvedPrice) > 0);
        const sumKnown = known.reduce((acc, d) => acc + toNumber(d.resolvedPrice), 0);
        const avgAll = count ? (sum / count) : 0;
        const avgKnown = known.length ? (sumKnown / known.length) : 0;
        // eslint-disable-next-line no-console
        console.groupCollapsed('%c[AVG DEBUG] Avg Booking Value breakdown', 'color:#0F0276;font-weight:bold;');
        // eslint-disable-next-line no-console
        console.table(details);
        // eslint-disable-next-line no-console
        console.log('[AVG DEBUG] sum(all)/count(all)=', sum, '/', count, '=', avgAll.toFixed(2));
        // eslint-disable-next-line no-console
        console.log('[AVG DEBUG] sum(known)/count(known)=', sumKnown, '/', known.length, '=', avgKnown.toFixed(2));
        // eslint-disable-next-line no-console
        console.groupEnd();
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Avg debug logging failed:', e);
  }

  // RENDER
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Hamburger Menu */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed z-40 top-20 left-4 md:hidden p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md shadow-sm transition-all duration-200"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
      )}
      
      <div className="flex h-full">
        {/* Sidebar Navigation */}
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onLogout={handleLogout}
          onCollapseChange={(collapsed) => setIsSidebarCollapsed(collapsed)}
        />

        {/* Main Content Area */}
        <div className={`transition-all duration-300 ${
          isSidebarOpen 
            ? isSidebarCollapsed 
              ? 'md:ml-[80px] md:w-[calc(100%-80px)]' 
              : 'md:ml-[280px] md:w-[calc(100%-280px)]'
            : 'md:w-full'
        } w-full`}>
          <div className="max-w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-10 gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0F0276] dark:text-white drop-shadow-sm">
                {/* Show different titles based on active tab */}
                {activeTab === 'bookings' && 'Booking Manager'}
                {activeTab === 'upcoming' && 'Upcoming Sessions'}
                {activeTab === 'athletes' && 'Athlete Management'}
                {activeTab === 'parents' && 'Parent Management'}
                {activeTab === 'content' && 'Content Management'}
                {activeTab === 'analytics' && 'Analytics Dashboard'}
                {activeTab === 'progress' && 'Athlete Progress'}
                {activeTab === 'settings' && 'Admin Settings'}
                {activeTab === 'schedule' && 'Schedule Management'}
                {activeTab === 'parentcomm' && 'Parent Communications'}
                {activeTab === 'waivers' && 'Waiver Management'}
                {activeTab === 'payments' && 'Payment Management'}
                {activeTab === 'payouts' && 'Payouts'}
                {activeTab === 'lesson-types' && 'Lesson Type Management'}
              </h1>
              
              {/* Contextual Actions */}
              <div className="flex gap-4">
                {/* Removed New Booking button as it's redundant with the buttons in the booking manager */}
              </div>
            </div>

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10 mx-auto w-full">
          {!bookings || !athletes ? (
            [...Array(4)].map((_, index) => (
              <Card key={index} className="rounded-3xl shadow-lg bg-gradient-to-br from-slate-100 to-white transform transition-transform hover:scale-[1.02] duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="rounded-3xl shadow-lg bg-gradient-to-br from-[#0F0276]/[.04] to-white border-l-4 sm:border-l-8 border-[#0F0276] hover:shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
                        <CardTitle className="text-xs sm:text-sm font-black tracking-tight text-[#0F0276]">Upcoming Missions</CardTitle>
                  <div className="bg-[#0F0276]/10 p-1.5 sm:p-2 rounded-full">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#0F0276]" />
                  </div>
                </CardHeader>
                <CardContent>
                      <div className="text-2xl sm:text-3xl font-black text-[#0F0276]">{upcomingBookingsCount}</div>
                      <p className="text-xs text-[#0F0276] font-medium mt-1">of {totalBookingsAll} total</p>
                </CardContent>
              </Card>

                  <Card className="rounded-3xl shadow-lg bg-gradient-to-br from-[#0F0276]/[.04] to-white border-l-4 sm:border-l-8 border-[#0F0276] hover:shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
                      <CardTitle className="text-xs sm:text-sm font-black tracking-tight text-[#0F0276]">Total Missions</CardTitle>
                      <div className="bg-[#0F0276]/10 p-1.5 sm:p-2 rounded-full">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#0F0276]" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-black text-[#0F0276]">{totalBookingsAll}</div>
                    </CardContent>
                  </Card>

              <Card className="rounded-3xl shadow-lg bg-gradient-to-br from-[#D8BD2A]/[.08] to-white border-l-4 sm:border-l-8 border-[#D8BD2A] hover:shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-black tracking-tight text-[#D8BD2A]">Pending</CardTitle>
                  <div className="bg-[#D8BD2A]/10 p-1.5 sm:p-2 rounded-full">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#D8BD2A]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-black text-[#D8BD2A]">{pendingBookings}</div>
                </CardContent>
              </Card>

        <Card className="rounded-3xl shadow-lg bg-gradient-to-br from-green-100 to-white border-l-4 sm:border-l-8 border-green-500 hover:shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-black tracking-tight text-green-600">Confirmed</CardTitle>
                  <div className="bg-green-100 p-1.5 sm:p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
          <div className="text-2xl sm:text-3xl font-black text-green-600">{confirmedBookings}</div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-lg bg-gradient-to-br from-blue-100 to-white border-l-4 sm:border-l-8 border-blue-500 hover:shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-black tracking-tight text-blue-700">Total Athletes</CardTitle>
                  <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-black text-blue-700">{athletes.length}</div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-lg bg-gradient-to-br from-indigo-100 to-white border-l-4 sm:border-l-8 border-indigo-500 hover:shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-black tracking-tight text-indigo-700">Total Parents</CardTitle>
                  <div className="bg-indigo-100 p-1.5 sm:p-2 rounded-full">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-700">{totalParents}</div>
                </CardContent>
              </Card>

              {missingWaivers.length > 0 && (
                <Card className="rounded-3xl shadow-lg bg-gradient-to-br from-[#E10B0B]/[.08] to-white border-l-4 sm:border-l-8 border-[#E10B0B] hover:shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2">
                    <CardTitle className="text-sm font-black tracking-tight text-[#E10B0B]">Missing Waivers</CardTitle>
                    <AlertCircle className="h-5 w-5 text-[#E10B0B]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-[#E10B0B]">{missingWaivers.length}</div>
                    <p className="text-xs text-[#E10B0B] mt-1">
                      Athletes need waivers signed
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <Tabs value={activeTab} className="w-full max-w-full overflow-hidden">
          {/* TabsList is now hidden as we're using the sidebar instead */}
          <TabsList className="hidden">
            <TabsTrigger 
              value="bookings" 
              className="hidden"
              role="tab"
              aria-controls="bookings-panel"
              aria-label="Manage bookings and reservations"
            >
              📅 Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="hidden"
              role="tab"
              aria-controls="upcoming-panel"
              aria-label="View upcoming sessions and schedule"
            >
              🔮 Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="athletes" 
              className="hidden"
              role="tab"
              aria-controls="athletes-panel"
              aria-label="Manage athlete profiles and information"
            >
              🏆 Athletes
            </TabsTrigger>
            <TabsTrigger 
              value="parents" 
              className="hidden"
              role="tab"
              aria-controls="parents-panel"
              aria-label="Manage parent profiles and family relationships"
            >
              👪 Parents
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="hidden"
            >
              📝 Content
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="hidden"
            >
              ⏰ Schedule
            </TabsTrigger>
            <TabsTrigger 
              value="lesson-types" 
              className="hidden"
            >
              🎓 Lesson Types
            </TabsTrigger>
            <TabsTrigger 
              value="skills" 
              className="hidden"
            >
              🥇 Skills
            </TabsTrigger>
            <TabsTrigger 
              value="parentcomm" 
              className="hidden"
            >
              💬 Messages
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="hidden"
            >
              💳 Payments
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="hidden"
            >
              💬 Messages
            </TabsTrigger>
            <TabsTrigger 
              value="payouts" 
              className="hidden"
            >
              🧾 Payouts
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="hidden"
            >
              📊 Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="waivers" 
              className="hidden"
            >
              📋 Waivers
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="hidden"
            >
              ⚙️ Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" role="tabpanel" id="bookings-panel" aria-labelledby="bookings-tab" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <Calendar className="h-8 w-8 text-[#D8BD2A]" />
                  Booking Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 lg:p-8 pt-0">
                <AdminBookingManager 
                  openAthleteModal={openAthleteModal}
                  selectedBooking={selectedBooking}
                  onSelectBooking={setSelectedBooking}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lesson-types" role="tabpanel" id="lesson-types-panel" aria-labelledby="lesson-types-tab" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  {/* Graduation cap icon inline to avoid additional import churn since lucide already imported many */}
                  <span className="inline-flex items-center justify-center h-8 w-8 text-[#D8BD2A]">🎓</span>
                  Lesson Type Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 lg:p-8 pt-0">
                <AdminLessonTypeManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" role="tabpanel" id="skills-panel" aria-labelledby="skills-tab" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <span className="inline-flex items-center justify-center h-8 w-8 text-[#D8BD2A]">🥇</span>
                  Skills Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 lg:p-8 pt-0">
                <Suspense fallback={<div className="space-y-3">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>}>
                  <AdminSkillsManager />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="progress" role="tabpanel" id="progress-panel" aria-labelledby="progress-tab" className="w-full max-w-full px-0 sm:px-2">
            <div className="p-2 sm:p-4">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Athlete Progress</h2>
                <p className="text-slate-600">Track progress with filters and summary bars.</p>
              </div>
              <AthleteProgressPage />
            </div>
          </TabsContent>

          <TabsContent value="athletes" role="tabpanel" id="athletes-panel" aria-labelledby="athletes-tab" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <Users className="h-8 w-8 text-[#D8BD2A]" />
                  Athletes Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                      placeholder="Search athletes..."
                      value={athleteSearchTerm}
                      onChange={(e) => setAthleteSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 rounded-xl border-0 bg-slate-50/80 focus:ring-2 focus:ring-[#0F0276] focus:bg-white transition-all duration-200 text-base"
                    />
                  </div>
                  {/* Athletes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {athletes
                      .filter((athlete, index, self) =>
                        index === self.findIndex((a) => a.id === athlete.id)
                      )
                      .filter(athlete => {
                        // Search filter
                        if (athleteSearchTerm) {
                          const searchTerm = athleteSearchTerm.toLowerCase();
                          const athleteName = (athlete.firstName && athlete.lastName 
                            ? `${athlete.firstName} ${athlete.lastName}` 
                            : athlete.name || 'Unknown Athlete').toLowerCase();
                          if (!athleteName.includes(searchTerm)) {
                            return false;
                          }
                        }
                        return !!athlete.dateOfBirth;
                      })
                      .map((athlete) => {
                        const today = new Date();
                        const birthDate = new Date(athlete.dateOfBirth || "1970-01-01");
                        const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                        if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
                        const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        const isUpcomingBirthday = daysUntilBirthday >= 0 && daysUntilBirthday <= 7;
                        const athleteKey = `${athlete.name}-${athlete.dateOfBirth || 'no-dob'}`;
                        const parentInfo = parentMapping.get(athleteKey);
                        return (
                          <div
                            key={athlete.id}
                            className={
                              isUpcomingBirthday
                                ? 'relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'
                                : 'relative bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'
                            }
                          >
                            {/* Action buttons - responsive layout */}
                            <div className="flex justify-end gap-2 mb-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className={`h-9 w-9 p-0 rounded-xl border-0 shadow-md transition-all duration-200 ${isUpcomingBirthday ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' : 'bg-white hover:bg-blue-50 text-blue-600'}`} 
                                onClick={() => { setSelectedAthlete(athlete); setIsAthleteViewOpen(true); }} 
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className={`h-9 w-9 p-0 rounded-xl border-0 shadow-md transition-all duration-200 ${isUpcomingBirthday ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' : 'bg-white hover:bg-green-50 text-green-600'}`} 
                                onClick={() => { setSelectedAthlete(athlete); setIsAthleteEditOpen(true); }} 
                                title="Edit Athlete"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-9 w-9 p-0 rounded-xl border-0 bg-white hover:bg-red-50 text-red-600 shadow-md transition-all duration-200" 
                                onClick={() => { 
                                  const activeBookings = bookings.filter(b => (b.athlete1Name === athlete.name || b.athlete2Name === athlete.name) && (b.status === 'confirmed' || b.status === 'pending')); 
                                  if (activeBookings.length > 0) { 
                                    setDeleteAthleteError({ athlete, activeBookings }); 
                                  } else { 
                                    deleteAthleteMutation.mutate(athlete.id); 
                                  } 
                                }} 
                                title="Delete Athlete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {/* Card Content */}
                            <div className="flex items-start space-x-4">
                              {athlete.photo ? (
                                <img 
                                  src={athlete.photo} 
                                  alt={`${athlete.name}'s photo`} 
                                  className="w-16 h-16 rounded-2xl object-cover cursor-pointer hover:opacity-80 transition-all duration-200 shadow-md ring-2 ring-slate-200" 
                                  onClick={() => handlePhotoClick(athlete.photo!)} 
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-md">
                                  <User className="h-8 w-8 text-slate-500" />
                                </div>
                              )}
                              <div className="flex-1 space-y-3 pt-1">
                                <h3 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 leading-tight">
                                  🧑 {athlete.firstName && athlete.lastName ? `${athlete.firstName} ${athlete.lastName}` : athlete.name}
                                </h3>
                                {isUpcomingBirthday && (
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
                                    <span className="text-lg">🎉</span>
                                    <span className="text-sm font-semibold text-amber-800">
                                      Birthday in {daysUntilBirthday} {daysUntilBirthday === 1 ? 'day' : 'days'}!
                                    </span>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <p className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                                    🎂 <span className="font-semibold">Age:</span> {athlete.dateOfBirth ? calculateAge(athlete.dateOfBirth) : 'Unknown'} 
                                    <span className="text-slate-400">|</span> 
                                    🥇 <span className="font-semibold">Level:</span> {athlete.experience.charAt(0).toUpperCase() + athlete.experience.slice(1)}
                                  </p>
                                  {parentInfo && (
                                    <p className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                                      👨‍👦 <span className="font-semibold">Parent:</span> {parentInfo.firstName} {parentInfo.lastName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" role="tabpanel" id="payouts-panel" aria-labelledby="payouts-tab" className="w-full max-w-full px-0 sm:px-2">
            <AdminPayoutsTab />
          </TabsContent>

          <TabsContent value="parents" role="tabpanel" id="parents-panel" aria-labelledby="parents-tab" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <User className="h-8 w-8 text-[#D8BD2A]" />
                  Parents Management
                  <Badge variant="secondary" className="bg-gradient-to-r from-[#D8BD2A]/20 to-[#D8BD2A]/30 text-[#0F0276] font-bold rounded-xl px-3 py-1">
                    {parentsData?.parents?.length || 0} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {/* Search bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search parents by name, email, or phone..."
                      value={parentSearchTerm}
                      onChange={(e) => setParentSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 rounded-xl border-0 bg-slate-50/80 focus:ring-2 focus:ring-[#0F0276] focus:bg-white transition-all duration-200 text-base"
                    />
                  </div>
                  <Button
                    onClick={() => refetchParents()}
                    variant="outline"
                    size="sm"
                    disabled={parentsLoading}
                    className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl px-4 py-3 font-semibold"
                  >
                    <RefreshCw className={`h-5 w-5 ${parentsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {parentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#0F0276]" />
                      <p className="text-slate-600 font-medium">Loading parents data...</p>
                    </div>
                  </div>
                ) : parentsData?.parents?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
                      <User className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No parents found</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                      {parentSearchTerm 
                        ? `No parents match "${parentSearchTerm}". Try adjusting your search terms.`
                        : "No parent accounts have been created yet. They'll appear here when parents complete bookings."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {filteredParents.map((parent: any) => {
                        const athleteCount = typeof parent.athlete_count === 'number' ? parent.athlete_count : (parent.athletes?.length ?? 0);
                        const bookingCount = typeof parent.booking_count === 'number' ? parent.booking_count : (parent.bookings?.length ?? 0);
                        
                        return (
                          <Card 
                            key={parent.id} 
                            className="group rounded-xl border-0 bg-gradient-to-br from-white via-slate-50/50 to-white hover:from-slate-50 hover:via-white hover:to-slate-50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                          >
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0 space-y-4">
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-xl text-[#0F0276] group-hover:text-[#0F0276]/80 transition-colors">
                                      {parent.first_name} {parent.last_name}
                                    </h3>
                                    <Badge variant="outline" className="text-xs font-medium bg-slate-50/80 border-slate-200 text-slate-600">
                                      ID: {parent.id}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <Mail className="h-4 w-4 text-[#D8BD2A] flex-shrink-0" />
                                      <span className="truncate font-medium">{parent.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <Phone className="h-4 w-4 text-[#D8BD2A] flex-shrink-0" />
                                      <span className="font-medium">{parent.phone}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#D8BD2A]/10 to-[#D8BD2A]/20 rounded-lg">
                                      <Users className="h-4 w-4 text-[#0F0276]" />
                                      <span className="font-semibold text-[#0F0276]">
                                        {athleteCount} athlete{athleteCount !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg">
                                      <Calendar className="h-4 w-4 text-blue-600" />
                                      <span className="font-semibold text-blue-700">
                                        {bookingCount} booking{bookingCount !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>

                                  {parent.athletes && parent.athletes.length > 0 && (
                                    <div className="pt-3 border-t border-slate-100">
                                      <p className="text-sm font-semibold text-[#0F0276] mb-2">Athletes:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {parent.athletes.map((athlete: any, index: number) => (
                                          <Badge 
                                            key={index}
                                            variant="secondary" 
                                            className="bg-gradient-to-r from-slate-100 to-slate-200/50 text-slate-700 text-xs font-medium rounded-lg px-2 py-1"
                                          >
                                            {athlete.first_name} {athlete.last_name}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const validParent = filteredParents.find((p: any) => p.id === parent.id);
                                      if (validParent) {
                                        setViewingParent(validParent);
                                      } else {
                                        console.warn(`Parent ${parent.id} not found in current parents list`);
                                      }
                                    }}
                                    className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-3 py-2 font-semibold"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const validParent = filteredParents.find((p: any) => p.id === parent.id);
                                      if (validParent) {
                                        setEditingParent(validParent);
                                        setIsParentEditOpen(true);
                                        setViewingParent(null);
                                      } else {
                                        console.warn(`Parent ${parent.id} not found in current parents list`);
                                      }
                                    }}
                                    className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-3 py-2 font-semibold"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete ${parent.first_name} ${parent.last_name}? This action cannot be undone.`)) {
                                        deleteParentMutation.mutate(parent.id);
                                      }
                                    }}
                                    className="bg-gradient-to-r from-red-500 to-red-600 border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-3 py-2 font-semibold"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {parentsData?.pagination && parentsData.pagination.totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 pt-6 border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentParentPage <= 1}
                          onClick={() => setCurrentParentPage(Math.max(1, currentParentPage - 1))}
                          className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-4 py-2 font-semibold disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-600 px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                            Page {currentParentPage} of {parentsData.pagination.totalPages}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentParentPage >= parentsData.pagination.totalPages}
                          onClick={() => setCurrentParentPage(Math.min(parentsData.pagination.totalPages, currentParentPage + 1))}
                          className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-4 py-2 font-semibold disabled:opacity-50"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" role="tabpanel" id="upcoming-panel" aria-labelledby="upcoming-tab" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <Clock className="h-8 w-8 text-[#D8BD2A]" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 lg:p-8 pt-0">
                <UpcomingSessions 
                  onBookingSelect={async (bookingId) => {
                    // Switch to bookings tab
                    setActiveTab("bookings");
                    
                    // Fetch full booking details with athlete information
                    try {
                      const response = await apiRequest("GET", `/api/bookings/${bookingId}`);
                      const bookingData = await response.json();
                      if (bookingData) {
                        setSelectedBooking(bookingData);
                      }
                    } catch (error) {
                      console.error("Error fetching booking details:", error);
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <MessageSquare className="h-8 w-8 text-[#D8BD2A]" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <Tabs defaultValue="blog" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-gradient-to-r from-slate-100 to-slate-200/50 rounded-xl">
                    <TabsTrigger 
                      value="blog"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#0F0276] font-semibold transition-all duration-200"
                    >
                      Blog Posts
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tips"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#0F0276] font-semibold transition-all duration-200"
                    >
                      Tips & Drills
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="blog" className="space-y-6 mt-6">
                    <div className="flex justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-[#0F0276] to-[#0F0276]/90 hover:from-[#0F0276]/90 hover:to-[#0F0276] border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3 font-semibold">
                            <Plus className="h-5 w-5 mr-2" />
                            New Blog Post
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create New Blog Post</DialogTitle>
                            <DialogDescription>
                              Fill out the details to create a new blog post.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="blog-title">Title</Label>
                              <Input
                                id="blog-title"
                                value={newPost.title}
                                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                placeholder="Enter blog post title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="blog-excerpt">Excerpt</Label>
                              <Textarea
                                id="blog-excerpt"
                                value={newPost.excerpt}
                                onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                                placeholder="Brief description of the post"
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label htmlFor="blog-category">Category</Label>
                              <Input
                                id="blog-category"
                                value={newPost.category || ''}
                                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                placeholder="e.g., Training Tips, Nutrition"
                              />
                            </div>
                            <div>
                              <Label>Content</Label>
                              <SectionBasedContentEditor
                                sections={newPostSections}
                                onChange={setNewPostSections}
                              />
                            </div>
                            <Button onClick={() => {
                              const content = sectionsToContent(newPostSections);
                              createBlogPostMutation.mutate({ ...newPost, content });
                            }}>
                              Create Post
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {/* Edit Blog Post Dialog */}
                    <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Blog Post</DialogTitle>
                          <DialogDescription>
                            Edit the details of your blog post below.
                          </DialogDescription>
                        </DialogHeader>
                        {editingPost && (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const content = sectionsToContent(editingPostSections);
                            updateBlogPostMutation.mutate({ ...editingPost, content });
                          }}>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-blog-title">Title</Label>
                                <Input
                                  id="edit-blog-title"
                                  value={editingPost.title}
                                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-blog-excerpt">Excerpt</Label>
                                <Textarea
                                  id="edit-blog-excerpt"
                                  value={editingPost.excerpt}
                                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-blog-category">Category</Label>
                                <Input
                                  id="edit-blog-category"
                                  value={editingPost.category || ''}
                                  onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Content</Label>
                                <SectionBasedContentEditor
                                  sections={editingPostSections}
                                  onChange={setEditingPostSections}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button type="submit">Save Changes</Button>
                                <Button type="button" variant="outline" onClick={() => setEditingPost(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {blogPosts.map((post) => (
                        <Card 
                          key={post.id} 
                          className="group rounded-xl border-0 bg-gradient-to-br from-white via-slate-50/50 to-white hover:from-slate-50 hover:via-white hover:to-slate-50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0 space-y-3">
                                <h3 className="text-xl font-bold text-[#0F0276] group-hover:text-[#0F0276]/80 transition-colors line-clamp-2">
                                  {post.title}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                                  {post.excerpt}
                                </p>
                                <div className="flex items-center gap-3 pt-2">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-gradient-to-r from-[#D8BD2A]/20 to-[#D8BD2A]/30 text-[#0F0276] font-medium rounded-lg px-3 py-1"
                                  >
                                    {post.category}
                                  </Badge>
                                  <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">
                                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'No date'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingPost(post)}
                                  className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-3 py-2 font-semibold"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteBlogPostMutation.mutate(post.id)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-3 py-2 font-semibold"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tips" className="space-y-6 mt-6">
                    <div className="flex justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-[#0F0276] to-[#0F0276]/90 hover:from-[#0F0276]/90 hover:to-[#0F0276] border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3 font-semibold">
                            <Plus className="h-5 w-5 mr-2" />
                            New Tip
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create New Tip</DialogTitle>
                            <DialogDescription>
                              Add a new tip for athletes and parents.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="tip-title">Title</Label>
                              <Input
                                id="tip-title"
                                value={newTip.title}
                                onChange={(e) => setNewTip({ ...newTip, title: e.target.value })}
                                placeholder="Enter tip title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="tip-category">Category</Label>
                              <Select
                                value={newTip.category}
                                onValueChange={(value) => setNewTip({ ...newTip, category: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="vault">Vault</SelectItem>
                                  <SelectItem value="bars">Bars</SelectItem>
                                  <SelectItem value="beam">Beam</SelectItem>
                                  <SelectItem value="floor">Floor</SelectItem>
                                  <SelectItem value="drills">Drills</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="tip-difficulty">Difficulty</Label>
                              <Select
                                value={newTip.difficulty}
                                onValueChange={(value) => setNewTip({ ...newTip, difficulty: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                  <SelectItem value="elite">Elite</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Content</Label>
                              <SectionBasedContentEditor
                                sections={newTipSections}
                                onChange={setNewTipSections}
                              />
                            </div>
                            <div>
                              <Label htmlFor="tip-video">Video URL (optional)</Label>
                              <Input
                                id="tip-video"
                                value={newTip.videoUrl}
                                onChange={(e) => setNewTip({ ...newTip, videoUrl: e.target.value })}
                                placeholder="https://youtube.com/..."
                              />
                            </div>
                            <Button onClick={() => {
                              const content = sectionsToContent(newTipSections);
                              createTipMutation.mutate({
                                ...newTip,
                                content,
                                videoUrl: newTip.videoUrl || null
                              });
                            }}>
                              Create Tip
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {/* Edit Tip Dialog */}
                    <Dialog open={!!editingTip} onOpenChange={() => setEditingTip(null)}>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Tip</DialogTitle>
                          <DialogDescription>
                            Edit the tip details below.
                          </DialogDescription>
                        </DialogHeader>
                        {editingTip && (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const content = sectionsToContent(editingTipSections);
                            updateTipMutation.mutate({ ...editingTip, content });
                          }}>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-tip-title">Title</Label>
                                <Input
                                  id="edit-tip-title"
                                  value={editingTip.title}
                                  onChange={(e) => setEditingTip({ ...editingTip, title: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-tip-category">Category</Label>
                                <Select
                                  value={editingTip.category}
                                  onValueChange={(value) => setEditingTip({ ...editingTip, category: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="vault">Vault</SelectItem>
                                    <SelectItem value="bars">Bars</SelectItem>
                                    <SelectItem value="beam">Beam</SelectItem>
                                    <SelectItem value="floor">Floor</SelectItem>
                                    <SelectItem value="drills">Drills</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="edit-tip-difficulty">Difficulty</Label>
                                <Select
                                  value={editingTip.difficulty}
                                  onValueChange={(value) => setEditingTip({ ...editingTip, difficulty: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                    <SelectItem value="elite">Elite</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="edit-tip-video">Video URL (optional)</Label>
                                <Input
                                  id="edit-tip-video"
                                  value={editingTip.videoUrl || ''}
                                  onChange={(e) => setEditingTip({ ...editingTip, videoUrl: e.target.value })}
                                  placeholder="YouTube or Vimeo URL"
                                />
                              </div>
                              <div>
                                <Label>Content</Label>
                                <SectionBasedContentEditor
                                  sections={editingTipSections}
                                  onChange={setEditingTipSections}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button type="submit">Save Changes</Button>
                                <Button type="button" variant="outline" onClick={() => setEditingTip(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {tips.map((tip) => (
                        <Card 
                          key={tip.id} 
                          className="group rounded-xl border-0 bg-gradient-to-br from-white via-slate-50/50 to-white hover:from-slate-50 hover:via-white hover:to-slate-50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0 space-y-3">
                                <h3 className="text-xl font-bold text-[#0F0276] group-hover:text-[#0F0276]/80 transition-colors line-clamp-2">
                                  {tip.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-gradient-to-r from-[#D8BD2A]/20 to-[#D8BD2A]/30 text-[#0F0276] font-medium rounded-lg px-3 py-1"
                                  >
                                    {tip.category}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200 text-blue-700 font-medium rounded-lg px-3 py-1"
                                  >
                                    {tip.difficulty}
                                  </Badge>
                                  {tip.videoUrl && (
                                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg px-3 py-1">
                                      📹 Has Video
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingTip(tip)}
                                  className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-3 py-2 font-semibold"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteTipMutation.mutate(tip.id)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-3 py-2 font-semibold"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <Calendar className="h-8 w-8 text-[#D8BD2A]" />
                  Schedule & Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                <div className="space-y-6">
                  {/* Booking Cutoff System Overview */}
                  <Card className="rounded-xl border-0 bg-gradient-to-br from-blue-50 via-green-50/50 to-blue-50/30 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-blue-800 flex items-center gap-2">
                        🚀 Booking Cutoff System
                      </h3>
                      <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                        The system automatically prevents scheduling conflicts by restricting lesson bookings based on your availability and lesson duration.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <Card className="rounded-lg border-0 bg-white/80 shadow-md">
                          <CardContent className="p-4">
                            <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                              📅 30-minute Lessons
                            </h4>
                            <p className="text-slate-600 leading-relaxed">
                              Quick Journey & Dual Quest lessons automatically cut off 30 minutes before your end time.
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="rounded-lg border-0 bg-white/80 shadow-md">
                          <CardContent className="p-4">
                            <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                              ⏰ 60-minute Lessons
                            </h4>
                            <p className="text-slate-600 leading-relaxed">
                              Deep Dive & Partner Progression lessons automatically cut off 60 minutes before your end time.
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              Example: If you end at 3:30 PM, last 60-min lesson starts at 2:30 PM
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-[#0F0276] flex items-center gap-3">
                      <Clock className="h-7 w-7 text-[#D8BD2A]" />
                      Weekly Availability
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { value: 0, label: 'Sunday' },
                        { value: 1, label: 'Monday' },
                        { value: 2, label: 'Tuesday' },
                        { value: 3, label: 'Wednesday' },
                        { value: 4, label: 'Thursday' },
                        { value: 5, label: 'Friday' },
                        { value: 6, label: 'Saturday' }
                      ].map((day) => {
                        const dayAvailability = availability.find(a => a.dayOfWeek === day.value);
                        return (
                          <Card key={day.value} className="rounded-xl border-0 bg-gradient-to-br from-white via-slate-50/50 to-white shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-center">
                                <h4 className="text-lg font-bold text-[#0F0276]">{day.label}</h4>
                              {dayAvailability ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium">
                                      {dayAvailability.startTime} - {dayAvailability.endTime}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => deleteAvailabilityMutation.mutate(dayAvailability.id)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  {/* Booking Cutoff Visual Indicators */}
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span>📅 30-min lessons:</span>
                                      <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded">
                                        Latest start: {(() => {
                                          const endMinutes = parseInt(dayAvailability.endTime.split(':')[0]) * 60 + parseInt(dayAvailability.endTime.split(':')[1]);
                                          const latestStart30 = endMinutes - 30;
                                          const hours = Math.floor(latestStart30 / 60);
                                          const mins = latestStart30 % 60;
                                          return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                                        })()}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span>⏰ 60-min lessons:</span>
                                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Latest start: {(() => {
                                          const endMinutes = parseInt(dayAvailability.endTime.split(':')[0]) * 60 + parseInt(dayAvailability.endTime.split(':')[1]);
                                          const latestStart60 = endMinutes - 60;
                                          const hours = Math.floor(latestStart60 / 60);
                                          const mins = latestStart60 % 60;
                                          return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                                        })()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm">Set Hours</Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Set {day.label} Hours</DialogTitle>
                                      <DialogDescription>
                                        Set your available hours for {day.label}.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Start Time</Label>
                                        <Input
                                          type="time"
                                          value={newAvailability.startTime}
                                          onChange={(e) => setNewAvailability({
                                            ...newAvailability,
                                            startTime: e.target.value
                                          })}
                                        />
                                      </div>
                                      <div>
                                        <Label>End Time</Label>
                                        <Input
                                          type="time"
                                          value={newAvailability.endTime}
                                          onChange={(e) => setNewAvailability({
                                            ...newAvailability,
                                            endTime: e.target.value
                                          })}
                                        />
                                      </div>
                                      <Button onClick={() => {
                                        createAvailabilityMutation.mutate({
                                          ...newAvailability,
                                          dayOfWeek: day.value
                                        });
                                      }}>
                                        Save Hours
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-[#0F0276] flex items-center gap-3">
                        <CalendarX className="h-7 w-7 text-[#D8BD2A]" />
                        Availability Exceptions
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3 font-semibold">
                            <CalendarX className="h-5 w-5 mr-2" />
                            Block Time
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Block Time</DialogTitle>
                            <DialogDescription>
                              Block specific dates or times when you're not available
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Date</Label>
                              <Input
                                type="date"
                                value={newException.date instanceof Date ? newException.date.toISOString().split('T')[0] : newException.date}
                                onChange={(e) => setNewException({
                                  ...newException,
                                  date: new Date(e.target.value)
                                })}
                              />
                              {newException.date && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Selected: {new Date(`${newException.date}T12:00:00Z`).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label>Start Time</Label>
                              <Input
                                type="time"
                                value={newException.startTime}
                                onChange={(e) => setNewException({
                                  ...newException,
                                  startTime: e.target.value
                                })}
                              />
                            </div>
                            <div>
                              <Label>End Time</Label>
                              <Input
                                type="time"
                                value={newException.endTime}
                                onChange={(e) => setNewException({
                                  ...newException,
                                  endTime: e.target.value
                                })}
                              />
                            </div>
                            <div>
                              <Label>Reason (optional)</Label>
                              <Input
                                value={newException.reason || ''}
                                onChange={(e) => setNewException({
                                  ...newException,
                                  reason: e.target.value
                                })}
                                placeholder="e.g., Personal appointment, Holiday"
                              />
                            </div>
                            <Button onClick={() => createExceptionMutation.mutate(newException)}>
                              Block Time
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {availabilityExceptions
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((exception) => (
                          <Card key={exception.id} className="rounded-xl border-0 bg-gradient-to-br from-red-50 via-orange-50/50 to-red-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                  <p className="font-bold text-lg text-red-800">
                                    {new Date(`${exception.date}T12:00:00Z`).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-red-600">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">
                                      {exception.startTime} - {exception.endTime}
                                    </span>
                                    {exception.reason && (
                                      <>
                                        <span className="text-red-400">•</span>
                                        <span className="font-medium">{exception.reason}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteExceptionMutation.mutate(exception.id)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-3 py-2 font-semibold"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parentcomm" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                    <MessageCircle className="h-8 w-8 text-[#D8BD2A]" />
                    Parent Communication
                  </CardTitle>
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-blue-200/50 text-blue-700 font-bold rounded-xl px-4 py-2 w-fit">
                    Frontend Only - Coming Soon
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Message List */}
                  <div className="lg:col-span-1">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-[#0F0276]">Messages</h3>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-gradient-to-r from-[#0F0276] to-[#0F0276]/90 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl px-4 py-2 font-semibold"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        New
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { id: 1, parent: "Sarah Johnson", athlete: "Emma Johnson", lastMessage: "Thank you for the great lesson!", time: "2h ago", unread: true },
                        { id: 2, parent: "Mike Chen", athlete: "Lucas Chen", lastMessage: "Can we reschedule Friday's session?", time: "5h ago", unread: false },
                        { id: 3, parent: "Lisa Rodriguez", athlete: "Sofia Rodriguez", lastMessage: "Sofia loved the new routine!", time: "1d ago", unread: false },
                      ].map((thread) => (
                        <Card 
                          key={thread.id} 
                          className={`rounded-xl border-0 cursor-pointer transition-all duration-300 ${
                            thread.unread 
                              ? 'bg-gradient-to-br from-blue-50 via-blue-25 to-blue-50/30 shadow-lg hover:shadow-xl' 
                              : 'bg-gradient-to-br from-white via-slate-50/50 to-white shadow-md hover:shadow-lg'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#0F0276] truncate">{thread.parent}</p>
                                <p className="text-sm text-slate-600 font-medium truncate">{thread.athlete}</p>
                                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{thread.lastMessage}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs text-slate-500 font-medium">{thread.time}</p>
                                {thread.unread && (
                                  <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mt-1 ml-auto shadow-sm"></div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Message Thread */}
                  <div className="lg:col-span-2">
                    <Card className="rounded-xl border-0 bg-gradient-to-br from-white via-slate-50/30 to-white shadow-lg h-fit">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-bold text-[#0F0276]">Sarah Johnson</h3>
                            <p className="text-sm text-slate-600 font-medium">Parent of Emma Johnson</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-3 py-2"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-3 py-2"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <div className="space-y-4 max-h-96 overflow-y-auto px-2">
                          <div className="flex justify-start">
                            <div className="bg-gradient-to-br from-slate-100 to-slate-200/50 rounded-xl p-4 max-w-xs shadow-md">
                              <p className="text-sm text-slate-700 leading-relaxed">Hi Coach Will! Emma is really excited about her upcoming competition.</p>
                              <p className="text-xs text-slate-500 mt-2 font-medium">Yesterday, 3:45 PM</p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <div className="bg-gradient-to-br from-[#0F0276] to-[#0F0276]/90 text-white rounded-xl p-4 max-w-xs shadow-lg">
                              <p className="text-sm leading-relaxed">That's wonderful! Emma has been working so hard. She's definitely ready!</p>
                              <p className="text-xs text-blue-100 mt-2 font-medium">Yesterday, 4:10 PM</p>
                            </div>
                          </div>
                          <div className="flex justify-start">
                            <div className="bg-gradient-to-br from-slate-100 to-slate-200/50 rounded-xl p-4 max-w-xs shadow-md">
                              <p className="text-sm text-slate-700 leading-relaxed">Thank you for the great lesson!</p>
                              <p className="text-xs text-slate-500 mt-2 font-medium">Today, 10:30 AM</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 space-y-4">
                          <div className="flex gap-2">
                            <Select defaultValue="custom">
                              <SelectTrigger className="w-48 rounded-lg border-0 bg-slate-50 shadow-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="custom">Custom Message</SelectItem>
                                <SelectItem value="reschedule">Reschedule Template</SelectItem>
                                <SelectItem value="policy">Policy Reminder</SelectItem>
                                <SelectItem value="thanks">Thank You</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-3">
                            <Textarea 
                              placeholder="Type your message..." 
                              className="flex-1 rounded-lg border-0 bg-slate-50 focus:ring-2 focus:ring-[#0F0276] resize-none"
                              rows={3}
                            />
                            <Button className="self-end bg-gradient-to-r from-[#0F0276] to-[#0F0276]/90 border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-6 py-2 font-semibold">
                              Send
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Email Testing Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Email System Testing</h3>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Test Email Templates</CardTitle>
                      <p className="text-sm text-gray-600">Send test emails to verify the system is working properly</p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const email = formData.get('email') as string;
                        const type = formData.get('type') as string;
                        
                        if (email && type) {
                          testEmailMutation.mutate({ type, email });
                        }
                      }} className="space-y-4">
                        <div>
                          <Label htmlFor="test-email">Email Address</Label>
                          <Input
                            id="test-email"
                            name="email"
                            type="email"
                            placeholder="test@example.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email-type">Email Type</Label>
                          <Select name="type" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select email type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="session-confirmation">Session Confirmation</SelectItem>
                              <SelectItem value="session-cancellation">Session Cancellation</SelectItem>
                              <SelectItem value="new-tip">New Tip/Blog Notification</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={testEmailMutation.isPending}
                        >
                          {testEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <DollarSign className="h-8 w-8 text-[#D8BD2A]" />
                  Payment Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 lg:p-8 pt-0">
                <PaymentsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <BarChart className="h-8 w-8 text-[#D8BD2A]" />
                  Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="space-y-4 sm:space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    <Card className="rounded-xl border-0 bg-gradient-to-br from-blue-50 via-blue-25 to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-blue-800">Total Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-black text-blue-900">{allBookings.length}</div>
                        <p className="text-xs text-blue-600 font-medium mt-1">All time</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="rounded-xl border-0 bg-gradient-to-br from-green-50 via-green-25 to-green-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-green-800">This Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-black text-green-900">
                          {allBookings.filter(b => {
                            if (!b.preferredDate) return false;
                            const bookingDate = new Date(b.preferredDate);
                            const thisMonth = new Date();
                            return bookingDate.getMonth() === thisMonth.getMonth() && 
                                   bookingDate.getFullYear() === thisMonth.getFullYear();
                          }).length}
                        </div>
                        <p className="text-xs text-green-600 font-medium mt-1">Monthly bookings</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="rounded-xl border-0 bg-gradient-to-br from-purple-50 via-purple-25 to-purple-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-purple-800">Conversion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-black text-purple-900">
                          {allBookings.length > 0 
                            ? Math.round((allBookings.filter(b => b.attendanceStatus === 'confirmed' || b.attendanceStatus === 'completed').length / allBookings.length) * 100)
                            : 0}%
                        </div>
                        <p className="text-xs text-purple-600 font-medium mt-1">Form to payment</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="rounded-xl border-0 bg-gradient-to-br from-orange-50 via-orange-25 to-orange-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-orange-800">Avg Booking Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-black text-orange-900">
                          $
                          {(() => {
                            if (!allBookings.length) return '0.00';
                            const toNumber = (v: any) => {
                              const n = Number(v);
                              return Number.isFinite(n) ? n : 0;
                            };
                            const sum = allBookings.reduce((acc, b) => {
                              // Only use the base lesson price from the booking snapshot if present; never include reservation fees
                              const bookingAmount = (b as any).amount; // legacy snapshot of full lesson price
                              const amountNum = toNumber(bookingAmount);
                              if (amountNum > 0) return acc + amountNum;

                              // Otherwise, derive by lesson type (full lesson price only)
                              const lt: any = (b as any).lessonType;
                              if ((b as any).lessonTypeId && lessonTypesById.has((b as any).lessonTypeId)) {
                                const match: any = lessonTypesById.get((b as any).lessonTypeId);
                                return acc + toNumber(match?.price);
                              }
                              if (lt && typeof lt === 'object' && 'price' in lt) {
                                return acc + toNumber(lt.price);
                              }
                              // Fallback by name if available
                              const name = typeof lt === 'string' ? lt : undefined;
                              if (name && lessonTypesByName.has(name)) {
                                const match: any = lessonTypesByName.get(name);
                                return acc + toNumber(match?.price);
                              }
                              return acc;
                            }, 0);
                            return (sum / allBookings.length).toFixed(2);
                          })()}
                        </div>
                        <p className="text-xs text-orange-600 font-medium mt-1">Per booking</p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl border-0 bg-gradient-to-br from-cyan-50 via-cyan-25 to-cyan-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-cyan-800">Online Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-black text-cyan-900">
                          {allBookings.length > 0
                            ? Math.round((allBookings.filter(b => (b as any).bookingMethod === 'Website').length / allBookings.length) * 100)
                            : 0}%
                        </div>
                        <p className="text-xs text-cyan-600 font-medium mt-1">Booked on website</p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-xl border-0 bg-gradient-to-br from-rose-50 via-rose-25 to-rose-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-rose-800">Admin Booked</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-black text-rose-900">
                          {allBookings.length > 0
                            ? Math.round((allBookings.filter(b => (b as any).bookingMethod === 'Admin').length / allBookings.length) * 100)
                            : 0}%
                        </div>
                        <p className="text-xs text-rose-600 font-medium mt-1">Created by admin</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Date Range Filter - Mobile Responsive */}
                  <Card className="rounded-xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-[#0F0276] flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#D8BD2A]" />
                        Date Range Filter
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-slate-700">Start Date</Label>
                          <Input
                            type="date"
                            value={analyticsDateRange.start}
                            onChange={(e) => setAnalyticsDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="rounded-lg border-0 bg-slate-50 focus:ring-2 focus:ring-[#0F0276] transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-slate-700">End Date</Label>
                          <Input
                            type="date"
                            value={analyticsDateRange.end}
                            onChange={(e) => setAnalyticsDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="rounded-lg border-0 bg-slate-50 focus:ring-2 focus:ring-[#0F0276] transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-slate-700">Lesson Type</Label>
                          <Select value={analyticsLessonType} onValueChange={setAnalyticsLessonType}>
                            <SelectTrigger className="rounded-lg border-0 bg-slate-50 focus:ring-2 focus:ring-[#0F0276] transition-all duration-200">
                              <SelectValue placeholder="All lessons" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All lessons</SelectItem>
                              {(lessonTypes || []).map((lt: any) => (
                                <SelectItem key={lt.id} value={lt.name}>{lt.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-slate-700 sm:opacity-0 lg:opacity-100">Actions</Label>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setAnalyticsDateRange({ start: '', end: '' });
                              setAnalyticsLessonType('all');
                            }}
                            className="w-full bg-white border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-4 py-2 font-semibold"
                          >
                            Reset Filters
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>                  {/* Popular Focus Areas Chart */}
                  <Card className="rounded-xl border-0 bg-gradient-to-br from-white via-slate-50/30 to-white shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-[#0F0276] flex items-center gap-2">
                        <BarChart className="h-6 w-6 text-[#D8BD2A]" />
                        Popular Focus Areas (All bookings in selected filters)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {focusAreaStats.slice(0, 10).map((stat, index) => (
                          <div key={stat.area} className="flex items-center gap-4">
                            <div className="w-40 text-sm font-bold text-slate-700 truncate">{stat.area}</div>
                            <div className="flex-1">
                              <div className="bg-slate-200 rounded-full h-8 relative overflow-hidden shadow-inner">
                                <div
                                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                                    index % 4 === 0 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                                    index % 4 === 1 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                    index % 4 === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                                    'bg-gradient-to-r from-orange-400 to-orange-500'
                                  }`}
                                  style={{ width: `${(stat.count / Math.max(...focusAreaStats.map(s => s.count), 1)) * 100}%` }}
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                                  {stat.count} bookings
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {focusAreaStats.length === 0 && (
                          <p className="text-gray-500 text-center">No focus areas found in selected period</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Booking Trends Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Booking Trends (All bookings, last 6 months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {bookingTrendData.map((month) => (
                          <div key={month.month} className="flex items-center gap-4">
                            <div className="w-24 text-sm font-medium">{month.month}</div>
                            <div className="flex-1">
                              <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div
                                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                                  style={{ width: `${(month.count / Math.max(...bookingTrendData.map(m => m.count), 1)) * 100}%` }}
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                  {month.count} bookings
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lesson Type Distribution */}
                  <Card className="rounded-xl border-0 bg-gradient-to-br from-white via-slate-50/30 to-white shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-[#0F0276] flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-[#D8BD2A]" />
                        Lesson Type Distribution (All bookings in selected filters)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {(() => {
                          // Use ALL bookings (active + archived) within filters
                          const total = filteredBookingsForAnalytics.length || 0;
                          const colorPool = ['blue','green','purple','orange','indigo','emerald','rose','amber'];
                          const items = (lessonTypes || []).map((lt: any, idx: number) => {
                            const count = filteredBookingsForAnalytics.filter(b => {
                              const name = (() => {
                                const lto: any = b.lessonType;
                                if (lto && typeof lto === 'object' && 'name' in lto) return lto.name;
                                if (typeof lto === 'string') return lto;
                                if (b.lessonTypeId && lessonTypesById.has(b.lessonTypeId)) return lessonTypesById.get(b.lessonTypeId)?.name;
                                return undefined;
                              })();
                              return name === lt.name;
                            }).length;
                            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                            const color = colorPool[idx % colorPool.length];
                            return { key: lt.id, label: lt.name, count, percentage, color };
                          });

                          if (!items.length) {
                            return <p className="text-gray-500">No lesson types found.</p>;
                          }

                          return items.map((type) => (
                            <Card key={type.key} className={`text-center rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                              type.color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-blue-100/50' :
                              type.color === 'green' ? 'bg-gradient-to-br from-green-50 to-green-100/50' :
                              type.color === 'purple' ? 'bg-gradient-to-br from-purple-50 to-purple-100/50' :
                              type.color === 'orange' ? 'bg-gradient-to-br from-orange-50 to-orange-100/50' :
                              type.color === 'indigo' ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/50' :
                              type.color === 'emerald' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50' :
                              type.color === 'rose' ? 'bg-gradient-to-br from-rose-50 to-rose-100/50' :
                              'bg-gradient-to-br from-amber-50 to-amber-100/50'
                            }`}>
                              <CardContent className="p-6">
                                <div className={`text-4xl font-black mb-2 ${
                                  type.color === 'blue' ? 'text-blue-700' :
                                  type.color === 'green' ? 'text-green-700' :
                                  type.color === 'purple' ? 'text-purple-700' :
                                  type.color === 'orange' ? 'text-orange-700' :
                                  type.color === 'indigo' ? 'text-indigo-700' :
                                  type.color === 'emerald' ? 'text-emerald-700' :
                                  type.color === 'rose' ? 'text-rose-700' :
                                  'text-amber-700'
                                }`}>{type.percentage}%</div>
                                <p className="text-sm font-bold text-slate-700 mb-1">{type.label}</p>
                                <p className="text-xs text-slate-500 font-medium">{type.count} bookings</p>
                              </CardContent>
                            </Card>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waivers" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <MessageSquare className="h-8 w-8 text-[#D8BD2A]" />
                  Waiver Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 lg:p-8 pt-0">
                <AdminWaiverManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <MessageSquare className="h-8 w-8 text-[#D8BD2A]" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 lg:p-8 pt-0">
                <AdminMessagesTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="w-full max-w-full px-0 sm:px-2">
            <Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
              <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
                  <AlertCircle className="h-8 w-8 text-[#D8BD2A]" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <Tabs defaultValue="developer" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 p-1 bg-gradient-to-r from-slate-100 to-slate-200/50 rounded-xl">
                    <TabsTrigger 
                      value="developer"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#0F0276] font-semibold transition-all duration-200"
                    >
                      Developer
                    </TabsTrigger>
                    <TabsTrigger 
                      value="general"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#0F0276] font-semibold transition-all duration-200"
                    >
                      General
                    </TabsTrigger>
                    <TabsTrigger 
                      value="site-content"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#0F0276] font-semibold transition-all duration-200"
                    >
                      Site Content
                    </TabsTrigger>
                    <TabsTrigger 
                      value="backup"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#0F0276] font-semibold transition-all duration-200"
                    >
                      Backup
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="developer" className="space-y-6 mt-6">
                    <Card className="rounded-xl border-0 bg-gradient-to-br from-yellow-50 via-orange-50/50 to-yellow-50/30 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertCircle className="h-6 w-6 text-yellow-600" />
                          <h3 className="text-lg font-bold text-yellow-800">Developer Tools</h3>
                        </div>
                        <p className="text-sm text-yellow-700 leading-relaxed">
                          These tools are for testing and development purposes only. Use with caution as they can alter or delete data.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Data Management */}
                      <Card className="rounded-xl border-0 bg-gradient-to-br from-red-50 via-red-25 to-red-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-red-800 flex items-center gap-3">
                            <Trash2 className="h-6 w-6 text-red-600" />
                            Data Management
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Clear Test Data</Label>
                            <p className="text-sm text-gray-600">
                              Remove all parents, athletes, bookings, and auth codes from the database.
                            </p>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Clear All Test Data
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirm Data Deletion</DialogTitle>
                                  <DialogDescription>
                                    <span>This action will permanently delete ALL:</span>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                      <li>Parent profiles</li>
                                      <li>Athlete profiles</li>
                                      <li>Booking records</li>
                                      <li>Authentication codes</li>
                                    </ul>
                                    This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleClearTestData}
                                    disabled={clearDataMutation.isPending}
                                  >
                                    {clearDataMutation.isPending ? (
                                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    Delete All Data
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Test Data Generation */}
                      <Card className="rounded-xl border-0 bg-gradient-to-br from-blue-50 via-blue-25 to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-3">
                            <Plus className="h-6 w-6 text-blue-600" />
                            Test Data Generation
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Generate Sample Bookings</Label>
                            <p className="text-sm text-gray-600">
                              Create realistic sample bookings for testing purposes.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleGenerateTestBookings}
                              disabled={generateBookingsMutation.isPending}
                            >
                              {generateBookingsMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Plus className="h-4 w-4 mr-2" />
                              )}
                              Generate 5 Sample Bookings
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Create Test Parent Account</Label>
                            <p className="text-sm text-gray-600">
                              Create a test parent account for authentication testing.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCreateTestParent}
                              disabled={createParentMutation.isPending}
                            >
                              {createParentMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <User className="h-4 w-4 mr-2" />
                              )}
                              Create Test Parent
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label>Delete User Accounts</Label>
                            <p className="text-sm text-gray-600">
                              Delete all user accounts created during booking process.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsDeleteUsersConfirmOpen(true)}
                              disabled={deleteUserAccountsMutation.isPending}
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              {deleteUserAccountsMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Delete User Accounts
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Payment Testing */}
                      <Card className="rounded-xl border-0 bg-gradient-to-br from-green-50 via-green-25 to-green-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-3">
                            <DollarSign className="h-6 w-6 text-green-600" />
                            Payment Testing
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Simulate Payment Success</Label>
                            <p className="text-sm text-gray-600">
                              Mark reservation-paid bookings as session-paid for testing.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSimulatePaymentSuccess}
                              disabled={paymentSimulationMutation.isPending}
                            >
                              {paymentSimulationMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Simulate Payment Success
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Reset Payment Status</Label>
                            <p className="text-sm text-gray-600">
                              Reset all bookings to reservation-paid status.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleResetPaymentStatus}
                              disabled={paymentResetMutation.isPending}
                            >
                              {paymentResetMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <X className="h-4 w-4 mr-2" />
                              )}
                              Reset Payment Status
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* System Status */}
                      <Card className="rounded-xl border-0 bg-gradient-to-br from-purple-50 via-purple-25 to-purple-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-3">
                            <BarChart className="h-6 w-6 text-purple-600" />
                            System Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Run System Health Check</Label>
                            <p className="text-sm text-gray-600">
                              Test all system components and API endpoints.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSystemHealthCheck}
                              disabled={healthCheckMutation.isPending}
                            >
                              {healthCheckMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Run Health Check
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Database Connection Test</Label>
                            <p className="text-sm text-gray-600">
                              Verify Supabase database connectivity and permissions.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDatabaseTest}
                              disabled={databaseTestMutation.isPending}
                            >
                              {databaseTestMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Test Database
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="general">
                    <Card className="rounded-xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-[#0F0276] flex items-center gap-3">
                          <AlertCircle className="h-6 w-6 text-[#D8BD2A]" />
                          General Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-600">General application settings will be implemented here.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="site-content">
                    <Card className="rounded-xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-[#0F0276] flex items-center gap-3">
                          <MessageSquare className="h-6 w-6 text-[#D8BD2A]" />
                          Site Content Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <AdminSiteContentManager />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="backup">
                    <Card className="rounded-xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-[#0F0276] flex items-center gap-3">
                          <RefreshCw className="h-6 w-6 text-[#D8BD2A]" />
                          Backup & Restore
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-600">Data backup and restore functionality will be implemented here.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Parent Details Dialog */}
        <Dialog 
          open={!!viewingParent} 
          onOpenChange={() => setViewingParent(null)}
        >
          <DialogContent 
            className="max-w-4xl max-h-[90vh] overflow-y-auto p-0"
            // Adding explicit ARIA attributes to prevent accessibility issues
            aria-labelledby="parent-details-title"
            aria-describedby="parent-details-description"
          >
            <DialogHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 px-6 py-4 rounded-t-lg mb-0">
              <DialogTitle id="parent-details-title" className="text-2xl font-bold text-indigo-900 flex items-center gap-3">
                <div className="p-2 bg-indigo-200 rounded-lg shadow-sm">
                  <User className="h-6 w-6 text-indigo-700" />
                </div>
                Parent Details
                {viewingParent && (
                  <Badge variant="outline" className="ml-2 bg-white border-indigo-200 text-indigo-700 font-medium">ID: {viewingParent.id}</Badge>
                )}
              </DialogTitle>
              <DialogDescription id="parent-details-description" className="text-indigo-700/70 font-medium">
                Complete parent profile with athletes and booking history
              </DialogDescription>
            </DialogHeader>
            
            {viewingParent && selectedParentDetails && (() => {
              return (
              <div className="space-y-6 p-6 bg-gradient-to-br from-white to-slate-50">
                {/* Basic Info */}
                <Card className="rounded-xl border shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-xl">
                    <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-700" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4 bg-gradient-to-br from-white to-blue-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                        <p className="text-lg font-semibold text-blue-900">
                          {selectedParentDetails.firstName || selectedParentDetails.first_name} {selectedParentDetails.lastName || selectedParentDetails.last_name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Parent ID</Label>
                        <p className="text-lg text-gray-800">{selectedParentDetails.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <p className="text-lg text-gray-800 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          {selectedParentDetails.email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Phone</Label>
                        <p className="text-lg text-gray-800 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                          {selectedParentDetails.phone}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Emergency Contact</Label>
                        <p className="text-lg text-gray-800">
                          {selectedParentDetails.emergencyContactName || selectedParentDetails.emergency_contact_name || 'Not provided'}
                          {(selectedParentDetails.emergencyContactPhone || selectedParentDetails.emergency_contact_phone) && (
                            <span className="block text-sm text-gray-600 flex items-center gap-2 mt-1">
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              {selectedParentDetails.emergencyContactPhone || selectedParentDetails.emergency_contact_phone}
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                        <p className="text-lg text-gray-800 flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-blue-600" />
                          {(selectedParentDetails.createdAt || selectedParentDetails.created_at) ? new Date(selectedParentDetails.createdAt || selectedParentDetails.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Athletes */}
                {selectedParentDetails.athletes && selectedParentDetails.athletes.length > 0 && (
                  <Card className="rounded-xl border shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
                    <CardHeader className="pb-2 bg-gradient-to-r from-teal-100 to-green-100 rounded-t-xl">
                      <CardTitle className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-teal-700" />
                        Athletes
                        <Badge variant="secondary" className="bg-teal-100 text-teal-800 border-teal-200">{selectedParentDetails.athletes.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 bg-gradient-to-br from-white to-teal-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedParentDetails.athletes.map((athlete: any) => (
                          <Card
                            key={athlete.id}
                            className="p-4 cursor-pointer border border-teal-100 shadow-sm hover:shadow-md hover:bg-gradient-to-br hover:from-teal-50/50 hover:to-blue-50/50 focus:bg-blue-100 transition-all duration-300"
                            tabIndex={0}
                            role="button"
                            aria-label={`View details for ${athlete.firstName || athlete.first_name || ''} ${athlete.lastName || athlete.last_name || ''}`}
                            onClick={() => {
                              setSelectedAthlete({
                                ...athlete,
                                // Normalize name fields for detail modal
                                name: `${athlete.firstName || athlete.first_name || ''} ${athlete.lastName || athlete.last_name || ''}`.trim(),
                                dateOfBirth: athlete.date_of_birth || athlete.dateOfBirth || athlete.birth_date || '',
                                photo: athlete.photo,
                              });
                              setIsAthleteViewOpen(true);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedAthlete({
                                  ...athlete,
                                  name: `${athlete.firstName || athlete.first_name || ''} ${athlete.lastName || athlete.last_name || ''}`.trim(),
                                  dateOfBirth: athlete.date_of_birth || athlete.dateOfBirth || athlete.birth_date || '',
                                  photo: athlete.photo,
                                });
                                setIsAthleteViewOpen(true);
                              }
                            }}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-teal-900 flex items-center gap-2">
                                  <UserCircle className="h-4 w-4 text-teal-600" />
                                  {athlete.firstName || athlete.first_name || ''} {athlete.lastName || athlete.last_name || athlete.name?.split(' ').slice(1).join(' ') || ''}
                                </h4>
                                <Badge variant="outline" className="bg-white border-teal-200 text-teal-700 font-medium">ID: {athlete.id}</Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  <strong>Age:</strong>{' '}
                                  {(() => {
                                    const dob = athlete.date_of_birth || athlete.dateOfBirth || athlete.birth_date;
                                    if (dob) {
                                      const age = calculateAge(dob);
                                      return isNaN(age) ? 'Not provided' : age;
                                    }
                                    return 'Not provided';
                                  })()}
                                </p>
                                <p>
                                  <strong>Gender:</strong> {(() => {
                                    const genderRaw = athlete.gender || athlete.gender_identity || athlete.genderIdentity || '';
                                    if (!genderRaw) return 'Not provided';
                                    const g = genderRaw.toLowerCase().replace(/\s|_/g, '');
                                    if (g === 'male') return 'Male';
                                    if (g === 'female') return 'Female';
                                    if (g === 'other') return 'Other';
                                    if (g === 'prefernottosay' || g === 'prefernotosay' || g === 'prefer_not_to_say') return 'Prefer not to say';
                                    return genderRaw;
                                  })()}
                                </p>
                                {athlete.skill_level && (
                                  <p>
                                    <strong>Skill Level:</strong> {athlete.skill_level}
                                  </p>
                                )}
                                {athlete.medical_conditions && (
                                  <p>
                                    <strong>Medical Conditions:</strong> {athlete.medical_conditions}
                                  </p>
                                )}
                              </div>
                              {athlete.waivers && athlete.waivers.length > 0 && (
                                <div className="mt-2">
                                  <WaiverStatusDisplay 
                                    athleteId={athlete.id} 
                                    athleteName={`${athlete.firstName || athlete.first_name || ''} ${athlete.lastName || athlete.last_name || ''}`}
                                  />
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Booking History */}
                {selectedParentDetails.bookings && selectedParentDetails.bookings.length > 0 && (
                  <Card className="rounded-xl border shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
                    <CardHeader className="pb-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-t-xl">
                      <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-700" />
                        Booking History
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">{selectedParentDetails.bookings.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 bg-gradient-to-br from-white to-blue-50/30">
                      <div className="space-y-3">
                        {editingParent.bookings
                          .sort((a: any, b: any) => new Date(b.preferred_date).getTime() - new Date(a.preferred_date).getTime())
                          .slice(0, 10) // Show last 10 bookings
                          .map((booking: any) => (
                          <div key={booking.id} className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-blue-50/20">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">
                                    {new Date(`${booking.preferred_date}T12:00:00Z`).toLocaleDateString()}
                                  </span>
                                  <Badge variant="outline" className="bg-white border-blue-200 text-blue-700 font-medium">#{booking.id}</Badge>
                                </div>
                                <p className="text-sm text-gray-700 flex items-center gap-2">
                                  <Dumbbell className="h-4 w-4 text-blue-600" />
                                  <strong>Lesson:</strong> {booking.lesson_type}
                                </p>
                                {booking.special_requests && (
                                  <p className="text-sm text-gray-700 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                    <strong>Notes:</strong> {booking.special_requests}
                                  </p>
                                )}
                              </div>
                              <div className="text-right space-y-1">
                                <Badge 
                                  variant={
                                    booking.payment_status === 'reservation-paid' ? 'default' :
                                    booking.payment_status === 'reservation-pending' ? 'secondary' : 'destructive'
                                  }
                                  className={`px-3 py-1 ${booking.payment_status === 'reservation-paid' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}`}
                                >
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {booking.payment_status}
                                </Badge>
                                <Badge 
                                  variant={
                                    booking.attendance_status === 'confirmed' ? 'default' :
                                    booking.attendance_status === 'completed' ? 'default' : 'secondary'
                                  }
                                  className={`block mt-1 px-3 py-1 ${booking.attendance_status === 'completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}`}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {booking.attendance_status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {editingParent.bookings.length > 10 && (
                          <div className="flex items-center justify-center bg-blue-50 rounded-lg p-2 mt-2">
                            <Info className="h-4 w-4 text-blue-600 mr-2" />
                            <p className="text-sm text-blue-700 font-medium">
                              Showing 10 most recent bookings of {editingParent.bookings.length} total
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}
          </DialogContent>
        </Dialog>
        
        {/* Photo Enlargement Modal */}
        <Dialog open={isPhotoEnlarged} onOpenChange={setIsPhotoEnlarged}>
          <DialogContent 
            className="max-w-4xl max-h-[90vh] overflow-y-auto" 
            aria-labelledby="athlete-photo-title"
            aria-describedby="athlete-photo-description"
          >
            <DialogHeader className="bg-gradient-to-r from-[#0F0276]/10 to-[#D8BD2A]/10 px-6 py-4 rounded-t-lg -mt-6 -mx-6 mb-6">
              <DialogTitle id="athlete-photo-title" className="text-2xl font-black text-[#0F0276] tracking-tight flex items-center gap-3">
                <div className="p-2 bg-[#D8BD2A]/20 rounded-lg">
                  <User className="h-5 w-5 text-[#D8BD2A]" />
                </div>
                Athlete Photo
              </DialogTitle>
              <DialogDescription id="athlete-photo-description" className="text-slate-600">
                Enlarged view of the athlete's photo
              </DialogDescription>
            </DialogHeader>
            {enlargedPhoto && (
              <div className="flex justify-center">
                <img
                  src={enlargedPhoto}
                  alt="Enlarged athlete photo"
                  className="max-w-full max-h-[70vh] rounded-lg shadow-lg border-4 border-white"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Athlete Edit Modal */}
        <Dialog open={isAthleteEditOpen} onOpenChange={setIsAthleteEditOpen}>
          <DialogContent 
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            aria-labelledby="edit-athlete-title"
            aria-describedby="edit-athlete-description"
          >
            <DialogHeader className="bg-gradient-to-r from-[#0F0276]/10 to-[#D8BD2A]/10 px-6 py-4 rounded-t-lg -mt-6 -mx-6 mb-6">
              <DialogTitle id="edit-athlete-title" className="text-2xl font-black text-[#0F0276] tracking-tight flex items-center gap-3">
                <div className="p-2 bg-[#D8BD2A]/20 rounded-lg">
                  <Edit className="h-5 w-5 text-[#D8BD2A]" />
                </div>
                Edit Athlete
              </DialogTitle>
              <DialogDescription id="edit-athlete-description" className="text-slate-600">
                {selectedAthlete ? `Update information for ${selectedAthlete.name}` : "Edit athlete information"}
              </DialogDescription>
            </DialogHeader>
      {selectedAthlete && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const firstName = formData.get('firstName') as string;
                const lastName = formData.get('lastName') as string;
                updateAthleteMutation.mutate({
                  id: selectedAthlete.id,
                  data: {
                    firstName,
                    lastName,
                    name: `${firstName} ${lastName}`,
                    dateOfBirth: formData.get('dateOfBirth') as string,
                    gender: (formData.get('gender') as "Male" | "Female" | "Other" | "Prefer not to say") || undefined,
                    experience: formData.get('experience') as any,
        allergies: formData.get('allergies') as string || null,
        isGymMember: editIsGymMember,
                  }
                });
              }}>
                <div className="space-y-4">
                  {/* Photo Upload Section */}
                  <div className="flex flex-col items-center space-y-3 mb-4">
                    <Label className="text-blue-800 font-medium">Athlete Photo</Label>
                    <div className="relative">
                      {selectedAthlete.photo ? (
                        <img
                          src={selectedAthlete.photo}
                          alt={`${selectedAthlete.name}'s photo`}
                          className="w-28 h-28 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-blue-100 ring-offset-2 shadow-md"
                          onClick={() => handlePhotoClick(selectedAthlete.photo!)}
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ring-2 ring-blue-100 ring-offset-2 shadow-md">
                          <User className="h-12 w-12 text-blue-300" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, selectedAthlete.id)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingPhoto}
                      />
                      {uploadingPhoto && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 font-medium flex items-center">
                      <span className="p-1 bg-blue-100 rounded-full mr-1">
                        <Edit className="h-3 w-3" />
                      </span>
                      Click photo to enlarge or upload new
                    </p>
                  </div>

                  {/* Basic Info Card */}
                  <Card className="rounded-xl border shadow-sm mb-6">
                    <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                      <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-firstName" className="text-slate-700 font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
                            First Name
                          </Label>
                          <Input
                            id="edit-firstName"
                            name="firstName"
                            defaultValue={selectedAthlete.firstName || (selectedAthlete.name ? selectedAthlete.name.split(' ')[0] : '')}
                            required
                            aria-describedby="edit-firstName-error"
                            autoComplete="given-name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-lastName" className="text-slate-700 font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
                            Last Name
                          </Label>
                          <Input
                            id="edit-lastName"
                            name="lastName"
                            defaultValue={selectedAthlete.lastName || (selectedAthlete.name ? selectedAthlete.name.split(' ').slice(1).join(' ') : '')}
                            required
                            aria-describedby="edit-lastName-error"
                            autoComplete="family-name"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between rounded-md border p-3">
                          <div>
                            <Label className="text-slate-700 font-medium">Gym Membership</Label>
                            <p className="text-sm text-muted-foreground">Toggle on if athlete is already in gym classes.</p>
                          </div>
                          <Switch
                            checked={editIsGymMember}
                            onCheckedChange={setEditIsGymMember}
                            aria-label="Toggle gym membership"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-dob" className="text-slate-700 font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
                            Date of Birth
                          </Label>
                          <Input
                            id="edit-dob"
                            name="dateOfBirth"
                            type="date"
                            defaultValue={selectedAthlete.dateOfBirth || ''}
                            required
                            aria-describedby="edit-dob-help"
                            autoComplete="bday"
                            className="mt-1"
                          />
                          <p id="edit-dob-help" className="text-xs text-blue-600 mt-2 flex items-center">
                            <span className="p-1 bg-blue-100 rounded-full mr-1">
                              <Calendar className="h-3 w-3" />
                            </span>
                            Used to calculate age for appropriate class placement
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="edit-gender" className="text-slate-700 font-medium">
                            Gender
                          </Label>
                          <GenderSelect
                            name="gender"
                            defaultValue={selectedAthlete.gender || ""}
                            id="edit-gender"
                            aria-describedby="edit-gender-help"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Training Info Card */}
                  <Card className="rounded-xl border shadow-sm mb-6">
                    <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                      <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-green-600" />
                        Training Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div>
                        <Label htmlFor="edit-experience" className="text-slate-700 font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
                          Experience Level
                        </Label>
                        <Select
                          name="experience"
                          defaultValue={selectedAthlete.experience}
                          required
                        >
                          <SelectTrigger 
                            id="edit-experience"
                            aria-describedby="edit-experience-help"
                            className="mt-1"
                          >
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner" aria-label="Beginner level">Beginner</SelectItem>
                            <SelectItem value="intermediate" aria-label="Intermediate level">Intermediate</SelectItem>
                            <SelectItem value="advanced" aria-label="Advanced level">Advanced</SelectItem>
                            <SelectItem value="elite" aria-label="Elite level">Elite</SelectItem>
                          </SelectContent>
                        </Select>
                        <p id="edit-experience-help" className="text-xs text-blue-600 mt-2 flex items-center">
                          <span className="p-1 bg-blue-100 rounded-full mr-1">
                            <Star className="h-3 w-3" />
                          </span>
                          Used to match appropriate coaching and skill development
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Medical Info Card */}
                  <Card className="rounded-xl border shadow-sm mb-6">
                    <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-xl">
                      <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        Medical Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div>
                        <Label htmlFor="edit-allergies" className="text-slate-700 font-medium">Allergies/Medical Notes</Label>
                        <Textarea
                          id="edit-allergies"
                          name="allergies"
                          defaultValue={selectedAthlete.allergies || ''}
                          placeholder="Any allergies or medical conditions..."
                          aria-describedby="edit-allergies-help"
                          rows={3}
                          className="mt-1"
                        />
                        <p id="edit-allergies-help" className="text-xs text-blue-600 mt-2 flex items-center">
                          <span className="p-1 bg-red-100 rounded-full mr-1">
                            <AlertCircle className="h-3 w-3" />
                          </span>
                          Important medical information for coaches to be aware of
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-between pt-6 mt-2 border-t border-dashed border-slate-200">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAthleteEditOpen(false)}
                      className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-800"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      aria-label={`Save changes for ${selectedAthlete.name}`}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-1">
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </div>
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Athlete View Modal */}
        <AthleteDetailDialog
          open={isAthleteViewOpen && !!selectedAthlete}
          onOpenChange={setIsAthleteViewOpen}
          athlete={selectedAthlete}
          bookings={bookings}
          parentInfo={selectedAthlete ? parentMapping.get(`${selectedAthlete.name}-${selectedAthlete.dateOfBirth}`) : undefined}
          onBookSession={() => {
            setIsAthleteViewOpen(false);
            setAdminBookingContext('from-athlete');
            setPreSelectedAthleteId(selectedAthlete?.id);
            setShowUnifiedBooking(true);
          }}
          onEditAthlete={() => {
            setIsAthleteViewOpen(false);
            setIsAthleteEditOpen(true);
          }}
          showActionButtons={true}
        />

        {/* Delete Athlete Error Modal */}
        <Dialog open={!!deleteAthleteError} onOpenChange={() => setDeleteAthleteError(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cannot Delete Athlete</DialogTitle>
              <DialogDescription>
                {deleteAthleteError && (
                  <>
                    <p className="mb-3">
                      {deleteAthleteError.athlete.name} has {deleteAthleteError.activeBookings.length} active booking{deleteAthleteError.activeBookings.length > 1 ? 's' : ''} that must be cancelled first.
                    </p>
                    <div className="space-y-2">
                      {deleteAthleteError.activeBookings.map((booking) => (
                        <div key={booking.id} className="text-sm border rounded p-2">
                          <p className="font-medium">{booking.preferredDate} at {booking.preferredTime}</p>
                          <p className="text-gray-600">{(() => {
                            const lt = booking.lessonType;
                            const name = (typeof lt === 'object' && lt && 'name' in lt) 
                              ? (lt as any).name 
                              : lt;
                            return name || 'Unknown';
                          })()} - Status: {booking.status}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm">
                      Please cancel these sessions before deleting the athlete.
                    </p>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button onClick={() => setDeleteAthleteError(null)}>Understood</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Parent Edit Modal */}
        <Dialog open={isParentEditOpen} onOpenChange={setIsParentEditOpen}>
          <DialogContent 
            className="max-w-2xl"
            // Adding explicit ARIA attributes to prevent accessibility issues
            aria-labelledby="edit-parent-title"
            aria-describedby="edit-parent-description"
          >
            <DialogHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 rounded-t-lg -mt-6 -mx-6 mb-6">
              <DialogTitle id="edit-parent-title" className="text-2xl font-bold text-indigo-800 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                Edit Parent Information
              </DialogTitle>
              <DialogDescription id="edit-parent-description" className="text-slate-600">
                Update the parent's information below.
              </DialogDescription>
            </DialogHeader>
            {editingParent && (
              <div className="space-y-6">
                {/* Contact Info Card */}
                <Card className="rounded-xl border shadow-sm mb-6">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                    <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="parent-first-name" className="text-slate-700 font-medium">First Name</Label>
                        <Input 
                          id="parent-first-name"
                          defaultValue={editingParent.first_name}
                          placeholder="First Name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="parent-last-name" className="text-slate-700 font-medium">Last Name</Label>
                        <Input 
                          id="parent-last-name"
                          defaultValue={editingParent.last_name}
                          placeholder="Last Name"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="parent-email" className="text-slate-700 font-medium">Email</Label>
                      <Input 
                        id="parent-email"
                        type="email"
                        defaultValue={editingParent.email}
                        placeholder="Email"
                        className="mt-1"
                      />
                      <p className="text-xs text-blue-600 mt-2 flex items-center">
                        <span className="p-1 bg-blue-100 rounded-full mr-1">
                          <Mail className="h-3 w-3" />
                        </span>
                        Used for account access and communication
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="parent-phone" className="text-slate-700 font-medium">Phone</Label>
                      <Input 
                        id="parent-phone"
                        defaultValue={editingParent.phone}
                        placeholder="Phone Number"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact Card */}
                <Card className="rounded-xl border shadow-sm mb-6">
                  <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-xl">
                    <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergency-name" className="text-slate-700 font-medium">Contact Name</Label>
                        <Input 
                          id="emergency-name"
                          defaultValue={editingParent?.emergencyContactName || editingParent?.emergency_contact_name || ''}
                          placeholder="Emergency Contact Name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergency-phone" className="text-slate-700 font-medium">Contact Phone</Label>
                        <Input 
                          id="emergency-phone"
                          defaultValue={editingParent?.emergencyContactPhone || editingParent?.emergency_contact_phone || ''}
                          placeholder="Emergency Contact Phone"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-dashed border-slate-200">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsParentEditOpen(false)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-800"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      // TODO: Implement save functionality
                      console.log('Save parent changes');
                      setIsParentEditOpen(false);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Unified Booking Modal for Admin Flows */}
        <UnifiedBookingModal
          isOpen={showUnifiedBooking}
          onClose={() => {
            setShowUnifiedBooking(false);
            setPreSelectedAthleteId(undefined);
          }}
          isAdminFlow={true}
          adminContext={adminBookingContext}
          preSelectedAthleteId={preSelectedAthleteId}
        />

        {/* Manual Booking Modal from Athlete Profile - DEPRECATED */}
        {/* This has been replaced with UnifiedBookingModal above */}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Clear Test Data</DialogTitle>
              <DialogDescription>
                <div className="space-y-2">
                  <p>Are you sure you want to clear all test data? This action will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All bookings</li>
                    <li>All athletes</li>
                    <li>All parents</li>
                    <li>All authentication codes</li>
                    <li>All test waiver files</li>
                  </ul>
                  <p className="font-semibold text-red-600">This action cannot be undone!</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  clearDataMutation.mutate();
                  setIsDeleteConfirmOpen(false);
                }}
                disabled={clearDataMutation.isPending}
              >
                {clearDataMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Clearing...
                  </>
                ) : (
                  'Clear All Test Data'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Accounts Confirmation Dialog */}
        <Dialog open={isDeleteUsersConfirmOpen} onOpenChange={setIsDeleteUsersConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete User Accounts</DialogTitle>
              <DialogDescription>
                <div className="space-y-2">
                  <p>Are you sure you want to delete all user accounts created during booking?</p>
                  <p>This will remove all non-admin user accounts from the system.</p>
                  <p className="font-semibold text-red-600">This action cannot be undone!</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteUsersConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteUserAccountsMutation.mutate();
                }}
                disabled={deleteUserAccountsMutation.isPending}
              >
                {deleteUserAccountsMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete User Accounts'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}