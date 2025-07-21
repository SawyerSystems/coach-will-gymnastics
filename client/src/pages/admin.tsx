import { GenderSelect } from "@/components/GenderSelect";
import { PaymentsTab } from "@/components/PaymentsTab";
import { UnifiedBookingModal } from "@/components/UnifiedBookingModal";
import { UpcomingSessions } from "@/components/UpcomingSessions";
import { WaiverStatusDisplay } from "@/components/WaiverStatusDisplay";
import { AdminBookingManager } from "@/components/admin-booking-manager";
import { AdminSiteContentManager } from "@/components/admin-site-content-manager";
import { AdminWaiverManagement } from "@/components/admin-waiver-management";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAvailability, useCreateAvailabilityException, useDeleteAvailability, useDeleteAvailabilityException, useUpdateAvailability } from "@/hooks/use-availability";
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
  CalendarX,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Mail,
  MessageCircle,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function Admin() {
  const [, setLocation] = useLocation();
  
  // ALL STATE HOOKS FIRST
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
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

  // Query for detailed parent information when one is selected
  const { data: selectedParentDetails } = useQuery({
    queryKey: ['/api/parents', selectedParent?.id],
    queryFn: async () => {
      if (!selectedParent?.id) return null;
      try {
        const response = await apiRequest('GET', `/api/parents/${selectedParent.id}`);
        if (!response.ok) return null; // Handle 404 gracefully
        return await response.json();
      } catch (error) {
        console.warn(`Parent ${selectedParent.id} not found:`, error);
        return null;
      }
    },
    enabled: !!authStatus?.loggedIn && !!selectedParent?.id,
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update athlete",
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

  const openAthleteModal = (athleteId: string) => {
    const athlete = athletes.find(a => a.id.toString() === athleteId);
    if (athlete) {
      setSelectedAthlete(athlete);
      setIsAthleteViewOpen(true);
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
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;

  // ANALYTICS COMPUTED DATA
  const filteredBookingsForAnalytics = bookings.filter(booking => {
    // Filter by date range
    if (analyticsDateRange.start && booking.preferredDate && booking.preferredDate < analyticsDateRange.start) return false;
    if (analyticsDateRange.end && booking.preferredDate && booking.preferredDate > analyticsDateRange.end) return false;
    
    // Filter by lesson type
    const lessonTypeName = (() => {
      const lt = booking.lessonType;
      if (typeof lt === 'object' && lt && 'name' in lt) {
        return (lt as any).name;
      }
      return lt;
    })();
    if (analyticsLessonType !== 'all' && lessonTypeName !== analyticsLessonType) return false;
    
    return true;
  });

  // Calculate focus area statistics
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

  // Calculate booking trends by month
  const bookingTrendData = (() => {
    const monthCount = new Map<string, number>();
    filteredBookingsForAnalytics.forEach(booking => {
      if (!booking.preferredDate) return;
      const date = new Date(booking.preferredDate);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthCount.set(monthKey, (monthCount.get(monthKey) || 0) + 1);
    });
    
    // Get last 6 months
    const months: string[] = [];
    const today = new Date();
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

  // RENDER
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 mb-8">
          {!bookings || !athletes ? (
            // Loading skeletons
            [...Array(4)].map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            // Actual data cards
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{pendingBookings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{confirmedBookings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Athletes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{athletes.length}</div>
                </CardContent>
              </Card>

              {missingWaivers.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-800">Missing Waivers</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{missingWaivers.length}</div>
                    <p className="text-xs text-orange-700 mt-1">
                      Athletes need waivers signed
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList 
            className="w-full grid grid-cols-3 grid-rows-4 gap-2 bg-gray-100 p-2 rounded-lg h-auto"
            role="tablist"
            aria-label="Admin dashboard sections"
          >
            <TabsTrigger 
              value="bookings" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="tab"
              aria-controls="bookings-panel"
              aria-label="Manage bookings and reservations"
            >
              📅 Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              role="tab"
              aria-controls="upcoming-panel"
              aria-label="View upcoming sessions and schedule"
            >
              🔮 Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="athletes" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              role="tab"
              aria-controls="athletes-panel"
              aria-label="Manage athlete profiles and information"
            >
              🏆 Athletes
            </TabsTrigger>
            <TabsTrigger 
              value="parents" 
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              role="tab"
              aria-controls="parents-panel"
              aria-label="Manage parent profiles and family relationships"
            >
              👪 Parents
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-purple-100"
            >
              📝 Content
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-teal-100"
            >
              ⏰ Schedule
            </TabsTrigger>
            <TabsTrigger 
              value="parentcomm" 
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-indigo-100"
            >
              💬 Messages
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-emerald-100"
            >
              💳 Payments
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-rose-100"
            >
              📊 Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="waivers" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-amber-100"
            >
              📋 Waivers
            </TabsTrigger>
            <TabsTrigger 
              value="site-content" 
              className="data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-violet-100"
            >
              🎨 Site Content
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-slate-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-slate-100"
            >
              ⚙️ Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" role="tabpanel" id="bookings-panel" aria-labelledby="bookings-tab">
            <AdminBookingManager openAthleteModal={openAthleteModal} />
          </TabsContent>

          <TabsContent value="athletes" role="tabpanel" id="athletes-panel" aria-labelledby="athletes-tab">
            <Card>
              <CardHeader>
                <CardTitle>Athletes Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search athletes..."
                      value={athleteSearchTerm}
                      onChange={(e) => setAthleteSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {/* Show all athletes with search filter */}
                  {/* Upcoming birthdays (yellow cards, next 7 days only, no overlap) */}
                  {athletes
                    .filter((athlete, index, self) =>
                      index === self.findIndex((a) => a.id === athlete.id)
                    )
                    .filter(athlete => {
                      if (!athlete.dateOfBirth) return false;
                      const today = new Date();
                      const birthDate = new Date(athlete.dateOfBirth);
                      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                      if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
                      const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return daysUntilBirthday >= 0 && daysUntilBirthday <= 7;
                    })
                    .map((athlete) => {
                      const athleteKey = `${athlete.name}-${athlete.dateOfBirth || 'no-dob'}`;
                      const parentInfo = parentMapping.get(athleteKey);
                      const today = new Date();
                      let daysUntilBirthday: number | null = null;
                      if (athlete.dateOfBirth) {
                        const birthDate = new Date(athlete.dateOfBirth);
                        const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                        if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
                        daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      }
                      return (
                        <div key={athlete.id} className="relative bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-5 shadow-sm">
                          {/* Action buttons in top-right corner */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover:bg-yellow-100" onClick={() => { setSelectedAthlete(athlete); setIsAthleteViewOpen(true); }} title="View Details"><Eye className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover:bg-yellow-100" onClick={() => { setSelectedAthlete(athlete); setIsAthleteEditOpen(true); }} title="Edit Athlete"><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover:bg-red-100 text-red-600" onClick={() => { const activeBookings = bookings.filter(b => (b.athlete1Name === athlete.name || b.athlete2Name === athlete.name) && (b.status === 'confirmed' || b.status === 'pending')); if (activeBookings.length > 0) { setDeleteAthleteError({ athlete, activeBookings }); } else { deleteAthleteMutation.mutate(athlete.id); } }} title="Delete Athlete"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          {/* Card Content */}
                          <div className="flex items-start space-x-4">
                            {athlete.photo ? (
                              <img src={athlete.photo} alt={`${athlete.name}'s photo`} className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handlePhotoClick(athlete.photo!)} />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center"><User className="h-8 w-8 text-gray-400" /></div>
                            )}
                            <div className="flex-1 space-y-2">
                              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">🧑 {athlete.firstName && athlete.lastName ? `${athlete.firstName} ${athlete.lastName}` : athlete.name}</h3>
                              <p className="text-sm font-medium text-orange-700 flex items-center gap-1">🎉 Birthday in {daysUntilBirthday} {daysUntilBirthday === 1 ? 'day' : 'days'}!</p>
                              <p className="text-sm text-gray-600 flex items-center gap-2">🎂 Age: {athlete.dateOfBirth ? calculateAge(athlete.dateOfBirth) : 'Unknown'} | 🥇 {athlete.experience.charAt(0).toUpperCase() + athlete.experience.slice(1)}</p>
                              {parentInfo && (<p className="text-sm text-gray-600 flex items-center gap-1">👨‍👦 Parent: {parentInfo.firstName} {parentInfo.lastName}</p>)}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {/* Regular athletes (white cards, not in yellow cards) */}
                  {athletes
                    .filter((athlete, index, self) =>
                      index === self.findIndex((a) => a.id === athlete.id)
                    )
                    .filter(athlete => {
                      if (!athlete.dateOfBirth) return false;
                      const today = new Date();
                      const birthDate = new Date(athlete.dateOfBirth);
                      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                      if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
                      const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return daysUntilBirthday > 7;
                    })
                    .map((athlete) => {
                      const athleteKey = `${athlete.name}-${athlete.dateOfBirth}`;
                      const parentInfo = parentMapping.get(athleteKey);
                      return (
                        <div key={`regular-${athlete.id}`} className="relative bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                          {/* Action buttons in top-right corner */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover:bg-blue-100" onClick={() => { setSelectedAthlete(athlete); setIsAthleteViewOpen(true); }} title="View Details"><Eye className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover:bg-blue-100" onClick={() => { setSelectedAthlete(athlete); setIsAthleteEditOpen(true); }} title="Edit Athlete"><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover:bg-red-100 text-red-600" onClick={() => { const activeBookings = bookings.filter(b => (b.athlete1Name === athlete.name || b.athlete2Name === athlete.name) && (b.status === 'confirmed' || b.status === 'pending')); if (activeBookings.length > 0) { setDeleteAthleteError({ athlete, activeBookings }); } else { deleteAthleteMutation.mutate(athlete.id); } }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          {/* Card Content */}
                          <div className="flex items-start space-x-4">
                            {athlete.photo ? (
                              <img src={athlete.photo} alt={`${athlete.name}'s photo`} className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handlePhotoClick(athlete.photo!)} />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center"><User className="h-8 w-8 text-gray-400" /></div>
                            )}
                            <div className="flex-1 space-y-2">
                              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">🧑 {athlete.firstName && athlete.lastName ? `${athlete.firstName} ${athlete.lastName}` : athlete.name}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-2">🎂 {athlete.dateOfBirth ? calculateAge(athlete.dateOfBirth) : 'Unknown'} years old | 🥇 {athlete.experience.charAt(0).toUpperCase() + athlete.experience.slice(1)}</p>
                              {parentInfo && (<p className="text-sm text-gray-600 flex items-center gap-1">👨‍👦 Parent: {parentInfo.firstName} {parentInfo.lastName}</p>)}
                            </div>
                          </div>
                        </div>
                    );
                  })}
                  
                  {/* Show regular athletes */}
                  {athletes
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
                      
                      const today = new Date();
                      if (!athlete.dateOfBirth) {
                        return false; // Skip athletes without birth dates
                      }
                      const birthDate = new Date(athlete.dateOfBirth);
                      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                      if (nextBirthday < today) {
                        nextBirthday.setFullYear(today.getFullYear() + 1);
                      }
                      const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return daysUntilBirthday > 7 || daysUntilBirthday < 0;
                    })
                    .map((athlete) => {
                      // Use consistent key format: athlete.name should be the full name
                      const athleteKey = `${athlete.name}-${athlete.dateOfBirth}`;
                      const parentInfo = parentMapping.get(athleteKey);
                      
                      return (
                        <div key={`regular-${athlete.id}`} className="relative bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                          {/* Action buttons in top-right corner */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                              onClick={() => {
                                setSelectedAthlete(athlete);
                                setIsAthleteViewOpen(true);
                              }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                              onClick={() => {
                                setSelectedAthlete(athlete);
                                setIsAthleteEditOpen(true);
                              }}
                              title="Edit Athlete"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                              onClick={() => {
                                const activeBookings = bookings.filter(b => 
                                  (b.athlete1Name === athlete.name || b.athlete2Name === athlete.name) && 
                                  (b.status === 'confirmed' || b.status === 'pending')
                                );
                                
                                if (activeBookings.length > 0) {
                                  setDeleteAthleteError({
                                    athlete,
                                    activeBookings
                                  });
                                } else {
                                  deleteAthleteMutation.mutate(athlete.id);
                                }
                              }}
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
                                className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handlePhotoClick(athlete.photo!)}
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            
                            <div className="flex-1 space-y-2">
                              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                🧑 {athlete.firstName && athlete.lastName 
                                  ? `${athlete.firstName} ${athlete.lastName}`
                                  : athlete.name}
                              </h3>
                              
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                🎂 {athlete.dateOfBirth ? calculateAge(athlete.dateOfBirth) : 'Unknown'} years old | 
                                🥇 {athlete.experience.charAt(0).toUpperCase() + athlete.experience.slice(1)}
                              </p>
                              
                              {parentInfo && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  👨‍👦 Parent: {parentInfo.firstName} {parentInfo.lastName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parents" role="tabpanel" id="parents-panel" aria-labelledby="parents-tab">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👪 Parents Management
                  <Badge variant="secondary">{parentsData?.parents?.length || 0} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search bar */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search parents by name, email, or phone..."
                      value={parentSearchTerm}
                      onChange={(e) => setParentSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => refetchParents()}
                    variant="outline"
                    size="sm"
                    disabled={parentsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${parentsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {parentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : parentsData?.parents?.length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <p className="text-gray-500 mb-4">No parents found</p>
                    {parentSearchTerm && (
                      <p className="text-sm text-gray-400">
                        Try adjusting your search terms
                      </p>
                    )}
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredParents.map((parent: any) => {
                      const athleteCount = parent.athletes?.length || 0;
                      const bookingCount = parent.bookings?.length || 0;
                      
                      return (
                        <Card key={parent.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">
                                  {parent.first_name} {parent.last_name}
                                </h3>
                                <Badge variant="outline">{parent.id}</Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <p className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {parent.email}
                                </p>
                                <p className="flex items-center gap-1">
                                  📞 {parent.phone}
                                </p>
                              </div>

                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  🏆 {athleteCount} athlete{athleteCount !== 1 ? 's' : ''}
                                </span>
                                <span className="flex items-center gap-1">
                                  📅 {bookingCount} booking{bookingCount !== 1 ? 's' : ''}
                                </span>
                              </div>

                              {parent.athletes && parent.athletes.length > 0 && (
                                <div className="text-sm">
                                  <strong>Athletes:</strong>{' '}
                                  {parent.athletes.map((athlete: any) => athlete.first_name + ' ' + athlete.last_name).join(', ')}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Use filteredParents instead of parents
                                  const validParent = filteredParents.find((p: any) => p.id === parent.id);
                                  if (validParent) {
                                    setSelectedParent(validParent);
                                  } else {
                                    console.warn(`Parent ${parent.id} not found in current parents list`);
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Use filteredParents instead of parents
                                  const validParent = filteredParents.find((p: any) => p.id === parent.id);
                                  if (validParent) {
                                    setSelectedParent(validParent);
                                    setIsParentEditOpen(true);
                                  } else {
                                    console.warn(`Parent ${parent.id} not found in current parents list`);
                                  }
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${parent.first_name} ${parent.last_name}? This action cannot be undone.`)) {
                                    // TODO: Implement delete functionality
                                    console.log('Delete parent:', parent.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}

                    {/* Pagination */}
                    {parentsData?.pagination && parentsData.pagination.totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentParentPage <= 1}
                          onClick={() => setCurrentParentPage(Math.max(1, currentParentPage - 1))}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                          Page {currentParentPage} of {parentsData.pagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentParentPage >= parentsData.pagination.totalPages}
                          onClick={() => setCurrentParentPage(Math.min(parentsData.pagination.totalPages, currentParentPage + 1))}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" role="tabpanel" id="upcoming-panel" aria-labelledby="upcoming-tab">
            <UpcomingSessions />
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="blog" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="blog">Blog Posts</TabsTrigger>
                    <TabsTrigger value="tips">Tips & Drills</TabsTrigger>
                  </TabsList>
                  <TabsContent value="blog" className="space-y-4">
                    <div className="flex justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Blog Post
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create New Blog Post</DialogTitle>
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
                    
                    <div className="space-y-4">
                      {blogPosts.map((post) => (
                        <div key={post.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{post.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">{post.category}</Badge>
                                <span className="text-sm text-gray-500">
                                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'No date'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingPost(post)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteBlogPostMutation.mutate(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tips" className="space-y-4">
                    <div className="flex justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Tip
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create New Tip</DialogTitle>
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
                    
                    <div className="space-y-4">
                      {tips.map((tip) => (
                        <div key={tip.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{tip.title}</h3>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">{tip.category}</Badge>
                                <Badge variant="outline">{tip.difficulty}</Badge>
                                {tip.videoUrl && <Badge>Has Video</Badge>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingTip(tip)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteTipMutation.mutate(tip.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Schedule & Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Booking Cutoff System Overview */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 text-blue-800">🚀 Booking Cutoff System</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      The system automatically prevents scheduling conflicts by restricting lesson bookings based on your availability and lesson duration.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-green-700 mb-1">📅 30-minute Lessons</h4>
                        <p>Quick Journey & Dual Quest lessons automatically cut off 30 minutes before your end time.</p>
                        <p className="text-xs text-gray-600 mt-1">Example: If you end at 3:30 PM, last 30-min lesson starts at 3:00 PM</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-blue-700 mb-1">⏰ 60-minute Lessons</h4>
                        <p>Deep Dive & Partner Progression lessons automatically cut off 60 minutes before your end time.</p>
                        <p className="text-xs text-gray-600 mt-1">Example: If you end at 3:30 PM, last 60-min lesson starts at 2:30 PM</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Weekly Availability</h3>
                    <div className="space-y-4">
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
                          <div key={day.value} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{day.label}</h4>
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
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Availability Exceptions</h3>
                    <div className="flex justify-end mb-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <CalendarX className="h-4 w-4 mr-2" />
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
                                  Selected: {new Date(newException.date + 'T00:00:00').toLocaleDateString('en-US', {
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
                    
                    <div className="space-y-3">
                      {availabilityExceptions
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((exception) => (
                          <div key={exception.id} className="border rounded-lg p-3 bg-red-50">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">
                                  {new Date(exception.date + 'T00:00:00').toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {exception.startTime} - {exception.endTime}
                                  {exception.reason && ` • ${exception.reason}`}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteExceptionMutation.mutate(exception.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parentcomm">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Parent Communication</CardTitle>
                  <Badge variant="secondary">Frontend Only - Coming Soon</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Message List */}
                  <div className="lg:col-span-1 border-r pr-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Messages</h3>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        New
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { id: 1, parent: "Sarah Johnson", athlete: "Emma Johnson", lastMessage: "Thank you for the great lesson!", time: "2h ago", unread: true },
                        { id: 2, parent: "Mike Chen", athlete: "Lucas Chen", lastMessage: "Can we reschedule Friday's session?", time: "5h ago", unread: false },
                        { id: 3, parent: "Lisa Rodriguez", athlete: "Sofia Rodriguez", lastMessage: "Sofia loved the new routine!", time: "1d ago", unread: false },
                      ].map((thread) => (
                        <div 
                          key={thread.id} 
                          className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${thread.unread ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{thread.parent}</p>
                              <p className="text-sm text-gray-600">{thread.athlete}</p>
                              <p className="text-sm text-gray-500 mt-1">{thread.lastMessage}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{thread.time}</p>
                              {thread.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Thread */}
                  <div className="lg:col-span-2">
                    <div className="border-b pb-4 mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">Sarah Johnson</h3>
                          <p className="text-sm text-gray-600">Parent of Emma Johnson</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                          <p className="text-sm">Hi Coach Will! Emma is really excited about her upcoming competition.</p>
                          <p className="text-xs text-gray-500 mt-1">Yesterday, 3:45 PM</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
                          <p className="text-sm">That's wonderful! Emma has been working so hard. She's definitely ready!</p>
                          <p className="text-xs text-blue-100 mt-1">Yesterday, 4:10 PM</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                          <p className="text-sm">Thank you for the great lesson!</p>
                          <p className="text-xs text-gray-500 mt-1">Today, 10:30 AM</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex gap-2 mb-3">
                        <Select defaultValue="custom">
                          <SelectTrigger className="w-48">
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
                      <div className="flex gap-2">
                        <Textarea 
                          placeholder="Type your message..." 
                          className="flex-1"
                          rows={3}
                        />
                        <Button className="self-end">Send</Button>
                      </div>
                    </div>
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

          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{bookings.length}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {bookings.filter(b => {
                            if (!b.preferredDate) return false;
                            const bookingDate = new Date(b.preferredDate);
                            const thisMonth = new Date();
                            return bookingDate.getMonth() === thisMonth.getMonth() && 
                                   bookingDate.getFullYear() === thisMonth.getFullYear();
                          }).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Bookings</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {bookings.length > 0 
                            ? Math.round((bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length / bookings.length) * 100)
                            : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Form to payment</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          $
                          {bookings.length > 0
                            ? (bookings.reduce((sum, b) => {
                                const lt = b.lessonType;
                                const price = (typeof lt === 'object' && lt && 'price' in lt) 
                                  ? (lt as any).price 
                                  : b.paidAmount || '0';
                                return sum + parseFloat(price);
                              }, 0) / bookings.length).toFixed(2)
                            : '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">Per booking</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Date Range Filter - Mobile Responsive */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex flex-col space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={analyticsDateRange.start}
                        onChange={(e) => setAnalyticsDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={analyticsDateRange.end}
                        onChange={(e) => setAnalyticsDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label>Lesson Type</Label>
                      <Select value={analyticsLessonType} onValueChange={setAnalyticsLessonType}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All lessons" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All lessons</SelectItem>
                          <SelectItem value="30-min-private">30-min Private</SelectItem>
                          <SelectItem value="1-hour-private">1-hour Private</SelectItem>
                          <SelectItem value="30-min-semi-private">30-min Semi-Private</SelectItem>
                          <SelectItem value="1-hour-semi-private">1-hour Semi-Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label className="opacity-0 md:opacity-100">Actions</Label>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAnalyticsDateRange({ start: '', end: '' });
                          setAnalyticsLessonType('all');
                        }}
                        className="w-full"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </div>

                  {/* Popular Focus Areas Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Popular Focus Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {focusAreaStats.slice(0, 10).map((stat) => (
                          <div key={stat.area} className="flex items-center gap-4">
                            <div className="w-40 text-sm font-medium truncate">{stat.area}</div>
                            <div className="flex-1">
                              <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div
                                  className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-500"
                                  style={{ width: `${(stat.count / Math.max(...focusAreaStats.map(s => s.count), 1)) * 100}%` }}
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
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
                      <CardTitle className="text-lg">Booking Trends (Last 6 Months)</CardTitle>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Lesson Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {(() => {
                          const lessonTypes = [
                            { key: 'quick-journey', label: 'Quick Journey' },
                            { key: 'deep-dive', label: 'Deep Dive' },
                            { key: 'dual-quest', label: 'Dual Quest' },
                            { key: 'partner-progression', label: 'Partner Progression' }
                          ];
                          
                          return lessonTypes.map(type => {
                            const count = filteredBookingsForAnalytics.filter(b => {
                              const lt = b.lessonType;
                              const lessonTypeName = (typeof lt === 'object' && lt && 'name' in lt) 
                                ? (lt as any).name 
                                : lt;
                              return lessonTypeName === type.key;
                            }).length;
                            const percentage = filteredBookingsForAnalytics.length > 0 
                              ? Math.round((count / filteredBookingsForAnalytics.length) * 100) 
                              : 0;
                            
                            return (
                              <div key={type.key} className="text-center p-4 border rounded-lg">
                                <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                                <p className="text-sm font-medium mt-1">{type.label}</p>
                                <p className="text-xs text-gray-500 mt-1">{count} bookings</p>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waivers">
            <AdminWaiverManagement />
          </TabsContent>

          <TabsContent value="site-content">
            <AdminSiteContentManager />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="developer" className="w-full">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
                    <TabsTrigger value="developer">Developer Settings</TabsTrigger>
                    <TabsTrigger value="general">General Settings</TabsTrigger>
                    <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="developer" className="space-y-6">
                    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <h3 className="font-semibold text-yellow-800">Developer Tools</h3>
                      </div>
                      <p className="text-sm text-yellow-700">
                        These tools are for testing and development purposes only. Use with caution as they can alter or delete data.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Data Management */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Trash2 className="h-5 w-5" />
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
                                  </DialogDescription>
                                  <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Parent profiles</li>
                                    <li>Athlete profiles</li>
                                    <li>Booking records</li>
                                    <li>Authentication codes</li>
                                  </ul>
                                  <DialogDescription>
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
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="h-5 w-5" />
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
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
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
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart className="h-5 w-5" />
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
                    <Card>
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">General application settings will be implemented here.</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="backup">
                    <Card>
                      <CardHeader>
                        <CardTitle>Backup & Restore</CardTitle>
                      </CardHeader>
                      <CardContent>
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
        <Dialog open={!!selectedParent} onOpenChange={() => setSelectedParent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                👪 Parent Details
                {selectedParent && (
                  <Badge variant="outline">ID: {selectedParent.id}</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Complete parent profile with athletes and booking history
              </DialogDescription>
            </DialogHeader>
            
            {selectedParent && (() => {
              // Use detailed data if available, fallback to basic parent data
              const parentData = selectedParentDetails || selectedParent;
              return (
              <div className="space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                        <p className="text-lg font-semibold">
                          {parentData.first_name} {parentData.last_name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Parent ID</Label>
                        <p className="text-lg">{parentData.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <p className="text-lg">{parentData.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Phone</Label>
                        <p className="text-lg">{parentData.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Emergency Contact</Label>
                        <p className="text-lg">
                          {parentData.emergency_contact_name || 'Not provided'}
                          {parentData.emergency_contact_phone && (
                            <span className="block text-sm text-gray-600">
                              {parentData.emergency_contact_phone}
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                        <p className="text-lg">
                          {parentData.created_at ? new Date(parentData.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Athletes */}
                {parentData.athletes && parentData.athletes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        🏆 Athletes
                        <Badge variant="secondary">{parentData.athletes.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {parentData.athletes.map((athlete: any) => (
                          <Card key={athlete.id} className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">
                                  {athlete.first_name} {athlete.last_name}
                                </h4>
                                <Badge variant="outline">ID: {athlete.id}</Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  <strong>Age:</strong>{' '}
                                  {athlete.birth_date 
                                    ? calculateAge(athlete.birth_date) 
                                    : 'Not provided'
                                  }
                                </p>
                                <p>
                                  <strong>Gender:</strong> {athlete.gender || 'Not specified'}
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
                                    athleteName={`${athlete.firstName} ${athlete.lastName}`}
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
                {parentData.bookings && parentData.bookings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        📅 Booking History
                        <Badge variant="secondary">{parentData.bookings.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {parentData.bookings
                          .sort((a: any, b: any) => new Date(b.preferred_date).getTime() - new Date(a.preferred_date).getTime())
                          .slice(0, 10) // Show last 10 bookings
                          .map((booking: any) => (
                          <div key={booking.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {new Date(booking.preferred_date).toLocaleDateString()}
                                  </span>
                                  <Badge variant="outline">#{booking.id}</Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  <strong>Lesson:</strong> {booking.lesson_type}
                                </p>
                                {booking.special_requests && (
                                  <p className="text-sm text-gray-600">
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
                                >
                                  {booking.payment_status}
                                </Badge>
                                <Badge 
                                  variant={
                                    booking.attendance_status === 'confirmed' ? 'default' :
                                    booking.attendance_status === 'completed' ? 'default' : 'secondary'
                                  }
                                  className="block"
                                >
                                  {booking.attendance_status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {parentData.bookings.length > 10 && (
                          <p className="text-sm text-gray-500 text-center">
                            Showing 10 most recent bookings of {parentData.bookings.length} total
                          </p>
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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Athlete Photo</DialogTitle>
            </DialogHeader>
            {enlargedPhoto && (
              <img
                src={enlargedPhoto}
                alt="Enlarged athlete photo"
                className="w-full h-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Athlete Edit Modal */}
        <Dialog open={isAthleteEditOpen} onOpenChange={setIsAthleteEditOpen}>
          <DialogContent aria-describedby="edit-athlete-description">
            <DialogHeader>
              <DialogTitle id="edit-athlete-title">
                Edit Athlete
              </DialogTitle>
              <DialogDescription id="edit-athlete-description">
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
                  }
                });
              }}>
                <div className="space-y-4">
                  {/* Photo Upload Section */}
                  <div className="flex flex-col items-center space-y-3">
                    <Label>Athlete Photo</Label>
                    <div className="relative">
                      {selectedAthlete.photo ? (
                        <img
                          src={selectedAthlete.photo}
                          alt={`${selectedAthlete.name}'s photo`}
                          className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handlePhotoClick(selectedAthlete.photo!)}
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-10 w-10 text-gray-400" />
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
                    <p className="text-sm text-gray-500 text-center">Click photo to upload new image</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-firstName" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        First Name
                      </Label>
                      <Input
                        id="edit-firstName"
                        name="firstName"
                        defaultValue={selectedAthlete.firstName || (selectedAthlete.name ? selectedAthlete.name.split(' ')[0] : '')}
                        required
                        aria-describedby="edit-firstName-error"
                        autoComplete="given-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-lastName" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                        Last Name
                      </Label>
                      <Input
                        id="edit-lastName"
                        name="lastName"
                        defaultValue={selectedAthlete.lastName || (selectedAthlete.name ? selectedAthlete.name.split(' ').slice(1).join(' ') : '')}
                        required
                        aria-describedby="edit-lastName-error"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-dob" className="after:content-['*'] after:ml-0.5 after:text-red-500">
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
                    />
                    <p id="edit-dob-help" className="text-xs text-gray-500 mt-1">
                      Used to calculate age for appropriate class placement
                    </p>
                  </div>
                  <GenderSelect
                    name="gender"
                    defaultValue={selectedAthlete.gender || ""}
                    id="edit-gender"
                    aria-describedby="edit-gender-help"
                  />
                  <div>
                    <Label htmlFor="edit-experience" className="after:content-['*'] after:ml-0.5 after:text-red-500">
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
                      >
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner" aria-label="Beginner level">Beginner</SelectItem>
                        <SelectItem value="intermediate" aria-label="Intermediate level">Intermediate</SelectItem>
                        <SelectItem value="advanced" aria-label="Advanced level">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <p id="edit-experience-help" className="text-xs text-gray-500 mt-1">
                      Used to match appropriate coaching and skill development
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="edit-allergies">Allergies/Medical Notes</Label>
                    <Textarea
                      id="edit-allergies"
                      name="allergies"
                      defaultValue={selectedAthlete.allergies || ''}
                      placeholder="Any allergies or medical conditions..."
                      aria-describedby="edit-allergies-help"
                      rows={3}
                    />
                    <p id="edit-allergies-help" className="text-xs text-gray-500 mt-1">
                      Important medical information for coaches to be aware of
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAthleteEditOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      aria-label={`Save changes for ${selectedAthlete.name}`}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Athlete View Modal */}
        <Dialog open={isAthleteViewOpen} onOpenChange={setIsAthleteViewOpen}>
          <DialogContent 
            className="max-w-3xl max-h-[90vh] overflow-y-auto" 
            aria-describedby="athlete-profile-description"
          >
            <DialogHeader>
              <DialogTitle id="athlete-profile-title">
                Athlete Profile
              </DialogTitle>
              <DialogDescription id="athlete-profile-description">
                {selectedAthlete ? `Viewing profile for ${selectedAthlete.name}` : "View athlete information and manage bookings"}
              </DialogDescription>
            </DialogHeader>
            {selectedAthlete && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="border rounded-lg p-4" role="region" aria-labelledby="basic-info-heading">
                  <h3 id="basic-info-heading" className="font-semibold mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {selectedAthlete.photo ? (
                          <img
                            src={selectedAthlete.photo}
                            alt={`${selectedAthlete.name}'s profile photo`}
                            className="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            onClick={() => handlePhotoClick(selectedAthlete.photo!)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handlePhotoClick(selectedAthlete.photo!);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`View ${selectedAthlete.name}'s photo in full size`}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center" aria-label="No photo available">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, selectedAthlete.id)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingPhoto}
                          aria-label={`Upload new photo for ${selectedAthlete.name}`}
                        />
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center" aria-live="polite">
                            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                            <span className="sr-only">Uploading photo...</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg">{selectedAthlete.name}</p>
                        <p className="text-sm text-gray-600">
                          Age: {selectedAthlete.dateOfBirth ? calculateAge(selectedAthlete.dateOfBirth) : 'Unknown'} years old
                        </p>
                        <p className="text-sm text-gray-600">
                          Born: {selectedAthlete.dateOfBirth ? new Date(selectedAthlete.dateOfBirth).toLocaleDateString() : 'Unknown'}
                        </p>
                        <p className="text-sm text-blue-600 font-medium mt-1">
                          Click photo to enlarge or click to upload new
                        </p>
                      </div>
                    </div>
                    <div role="group" aria-label="Athlete details">
                      <p className="text-sm"><span className="font-medium">Experience:</span> {selectedAthlete.experience}</p>
                      <p className="text-sm"><span className="font-medium">Gender:</span> {selectedAthlete.gender || 'Not specified'}</p>
                      {selectedAthlete.allergies && (
                        <p className="text-sm text-red-600 mt-1">
                          <span className="font-medium">⚠️ Allergies:</span> {selectedAthlete.allergies}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parent Info */}
                {(() => {
                  const parentInfo = parentMapping.get(`${selectedAthlete.name}-${selectedAthlete.dateOfBirth}`);
                  return parentInfo ? (
                    <div className="border rounded-lg p-4" role="region" aria-labelledby="parent-info-heading">
                      <h3 id="parent-info-heading" className="font-semibold mb-3">Parent Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm" role="group" aria-label="Parent contact details">
                        <div>
                          <p><span className="font-medium">Name:</span> {parentInfo.firstName} {parentInfo.lastName}</p>
                          <p><span className="font-medium">Email:</span> 
                            <a href={`mailto:${parentInfo.email}`} className="text-blue-600 hover:underline ml-1">
                              {parentInfo.email}
                            </a>
                          </p>
                        </div>
                        <div>
                          <p><span className="font-medium">Phone:</span> 
                            <a href={`tel:${parentInfo.phone}`} className="text-blue-600 hover:underline ml-1">
                              {parentInfo.phone}
                            </a>
                          </p>
                          <p><span className="font-medium">Emergency Contact:</span> {parentInfo.emergencyContactName} 
                            <a href={`tel:${parentInfo.emergencyContactPhone}`} className="text-blue-600 hover:underline ml-1">
                              ({parentInfo.emergencyContactPhone})
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Waiver Status */}
                <WaiverStatusDisplay 
                  athleteId={selectedAthlete.id}
                  athleteName={selectedAthlete.name || 'Unknown Athlete'}
                  onResendWaiver={() => {
                    // TODO: Implement waiver resend functionality
                    toast({
                      title: "Feature Coming Soon",
                      description: "Waiver resend functionality will be implemented soon.",
                    });
                  }}
                />

                {/* Bookings History */}
                <div className="border rounded-lg p-4" role="region" aria-labelledby="booking-history-heading">
                  <h3 id="booking-history-heading" className="font-semibold mb-3">Booking History</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto" role="log" aria-label="Booking history list">
                    {bookings
                      .filter(b => {
                        // Check if athlete is in booking_athletes relationship
                        if (b.athletes && Array.isArray(b.athletes)) {
                          return b.athletes.some((athlete: any) => 
                            athlete.id === selectedAthlete.id ||
                            athlete.name === selectedAthlete.name ||
                            (selectedAthlete.firstName && selectedAthlete.lastName && 
                             athlete.name === `${selectedAthlete.firstName} ${selectedAthlete.lastName}`)
                          );
                        }
                        // Fallback to legacy fields
                        return b.athlete1Name === selectedAthlete.name || 
                               b.athlete2Name === selectedAthlete.name ||
                               (selectedAthlete.firstName && selectedAthlete.lastName && 
                                (b.athlete1Name === `${selectedAthlete.firstName} ${selectedAthlete.lastName}` ||
                                 b.athlete2Name === `${selectedAthlete.firstName} ${selectedAthlete.lastName}`));
                      })
                      .sort((a, b) => {
                        const dateA = a.preferredDate ? new Date(a.preferredDate).getTime() : 0;
                        const dateB = b.preferredDate ? new Date(b.preferredDate).getTime() : 0;
                        return dateB - dateA;
                      })
                      .map((booking) => (
                        <div key={booking.id} className="border rounded p-3" role="article" aria-label={`Booking ${booking.id}`}>
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{(() => {
                                const lt = booking.lessonType;
                                const name = (typeof lt === 'object' && lt && 'name' in lt) 
                                  ? (lt as any).name 
                                  : lt;
                                return (name || '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                              })()}</p>
                              <p className="text-sm text-gray-600">
                                <time dateTime={booking.preferredDate || undefined}>
                                  {booking.preferredDate}
                                </time> at {booking.preferredTime}
                              </p>
                              <p className="text-sm text-gray-600">Focus: {booking.focusAreas?.join(', ') || 'Not specified'}</p>
                              <p className="text-sm text-blue-600">Payment: {booking.paymentStatus}</p>
                              {(booking.waiverId || booking.waiverSigned) && (
                                <p className="text-xs text-green-600 font-medium" role="status">✓ Waiver Signed</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge variant={
                                booking.status === 'confirmed' ? 'default' :
                                booking.status === 'pending' ? 'secondary' : 'destructive'
                              } aria-label={`Status: ${booking.status}`}>
                                {booking.status}
                              </Badge>
                              {booking.attendanceStatus && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Attendance: {booking.attendanceStatus}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    {bookings.filter(b => {
                      // Check if athlete is in booking_athletes relationship
                      if (b.athletes && Array.isArray(b.athletes)) {
                        return b.athletes.some((athlete: any) => 
                          athlete.id === selectedAthlete.id ||
                          athlete.name === selectedAthlete.name ||
                          (selectedAthlete.firstName && selectedAthlete.lastName && 
                           athlete.name === `${selectedAthlete.firstName} ${selectedAthlete.lastName}`)
                        );
                      }
                      // Fallback to legacy fields
                      return b.athlete1Name === selectedAthlete.name || 
                             b.athlete2Name === selectedAthlete.name ||
                             (selectedAthlete.firstName && selectedAthlete.lastName && 
                              (b.athlete1Name === `${selectedAthlete.firstName} ${selectedAthlete.lastName}` ||
                               b.athlete2Name === `${selectedAthlete.firstName} ${selectedAthlete.lastName}`));
                    }).length === 0 && (
                      <p className="text-gray-500 text-center" role="status">No bookings found</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t" role="group" aria-label="Athlete actions">
                  <Button 
                    onClick={() => {
                      setIsAthleteViewOpen(false);
                      setAdminBookingContext('from-athlete');
                      setPreSelectedAthleteId(selectedAthlete.id);
                      setShowUnifiedBooking(true);
                    }}
                    aria-label={`Book a session for ${selectedAthlete.name}`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                  <div className="space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setIsAthleteViewOpen(false);
                        setIsAthleteEditOpen(true);
                      }}
                      aria-label={`Edit ${selectedAthlete.name}'s information`}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAthleteViewOpen(false)}
                      aria-label="Close athlete profile"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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

        {/* Photo Enlargement Modal */}
        <Dialog open={isPhotoEnlarged} onOpenChange={setIsPhotoEnlarged}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Athlete Photo</DialogTitle>
            </DialogHeader>
            {enlargedPhoto && (
              <img
                src={enlargedPhoto}
                alt="Enlarged athlete photo"
                className="w-full h-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Parent Edit Modal */}
        <Dialog open={isParentEditOpen} onOpenChange={setIsParentEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Parent Information</DialogTitle>
            </DialogHeader>
            {selectedParent && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parent-first-name">First Name</Label>
                    <Input 
                      id="parent-first-name"
                      defaultValue={selectedParent.first_name}
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent-last-name">Last Name</Label>
                    <Input 
                      id="parent-last-name"
                      defaultValue={selectedParent.last_name}
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="parent-email">Email</Label>
                  <Input 
                    id="parent-email"
                    type="email"
                    defaultValue={selectedParent.email}
                    placeholder="Email"
                  />
                </div>
                <div>
                  <Label htmlFor="parent-phone">Phone</Label>
                  <Input 
                    id="parent-phone"
                    defaultValue={selectedParent.phone}
                    placeholder="Phone Number"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency-name">Emergency Contact Name</Label>
                    <Input 
                      id="emergency-name"
                      defaultValue={selectedParent.emergency_contact_name}
                      placeholder="Emergency Contact Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency-phone">Emergency Contact Phone</Label>
                    <Input 
                      id="emergency-phone"
                      defaultValue={selectedParent.emergency_contact_phone}
                      placeholder="Emergency Contact Phone"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsParentEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // TODO: Implement save functionality
                    console.log('Save parent changes');
                    setIsParentEditOpen(false);
                  }}>
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
  );
}