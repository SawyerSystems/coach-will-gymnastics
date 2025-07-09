import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  User,
  FileText, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Clock,
  CheckCircle,
  X,
  Settings,
  CalendarDays,
  CalendarX,
  MessageSquare,
  BarChart,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Upload,
  FileImage,
  File,
  MessageCircle,
  Mail,
  Cake,
  Star,
  Check,
  AlertCircle,
  Search
} from "lucide-react";
import type { Booking, BlogPost, Tip, InsertBlogPost, Availability, AvailabilityException, InsertAvailability, InsertAvailabilityException, Athlete, InsertAthlete, Customer } from "@shared/schema";
import { useAvailability, useCreateAvailability, useUpdateAvailability, useDeleteAvailability, useAvailabilityExceptions, useCreateAvailabilityException, useDeleteAvailabilityException } from "@/hooks/use-availability";
import { AdminBookingManager, getStatusBadgeProps } from "@/components/admin-booking-manager";
import { SectionBasedContentEditor, ContentSection } from "@/components/section-based-content-editor";
import { PaymentsTab } from "@/components/PaymentsTab";
import { AdminWaiverManagement } from "@/components/admin-waiver-management";
import { AdminSiteContentManager } from "@/components/admin-site-content-manager";
import { calculateAge, formatDate } from "@/lib/dateUtils";
import { useMissingWaivers } from "@/hooks/use-waiver-status";

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
    date: "",
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
  
  // Upcoming Sessions state
  const [upcomingDateFilter, setUpcomingDateFilter] = useState<string>("");
  const [upcomingTimeFilter, setUpcomingTimeFilter] = useState<string>("week");
  
  // Athletes search state
  const [athleteSearchTerm, setAthleteSearchTerm] = useState<string>("");
  const [upcomingSortAsc, setUpcomingSortAsc] = useState<boolean>(true);
  
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
    enabled: !!authStatus?.loggedIn,
  });

  const { data: blogPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog-posts'],
    enabled: !!authStatus?.loggedIn,
  });

  const { data: tips = [] } = useQuery<Tip[]>({
    queryKey: ['/api/tips'],
    enabled: !!authStatus?.loggedIn,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    enabled: !!authStatus?.loggedIn,
  });

  const { data: athletes = [] } = useQuery<Athlete[]>({
    queryKey: ['/api/athletes'],
    enabled: !!authStatus?.loggedIn,
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

  const { data: missingWaivers = [] } = useMissingWaivers() as { data: Athlete[] };

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
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setIsDeleteConfirmOpen(false);
      toast({ 
        title: "Data cleared successfully", 
        description: `Cleared ${data.cleared.bookings} bookings, ${data.cleared.athletes} athletes, ${data.cleared.parents} parents`
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
            firstName: booking.parentFirstName,
            lastName: booking.parentLastName,
            email: booking.parentEmail,
            phone: booking.parentPhone,
            emergencyContactName: booking.emergencyContactName,
            emergencyContactPhone: booking.emergencyContactPhone,
            waiverSigned: booking.waiverSigned,
            waiverSignedAt: booking.waiverSignedAt
          });
        }
      }
      
      if (booking.athlete2Name) {
        const key = `${booking.athlete2Name}-${booking.athlete2DateOfBirth}`;
        if (!mapping.has(key)) {
          mapping.set(key, {
            id: booking.id,
            firstName: booking.parentFirstName,
            lastName: booking.parentLastName,
            email: booking.parentEmail,
            phone: booking.parentPhone,
            emergencyContactName: booking.emergencyContactName,
            emergencyContactPhone: booking.emergencyContactPhone,
            waiverSigned: booking.waiverSigned,
            waiverSignedAt: booking.waiverSignedAt
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
    if (analyticsDateRange.start && booking.preferredDate < analyticsDateRange.start) return false;
    if (analyticsDateRange.end && booking.preferredDate > analyticsDateRange.end) return false;
    
    // Filter by lesson type
    if (analyticsLessonType !== 'all' && booking.lessonType !== analyticsLessonType) return false;
    
    return true;
  });

  // Calculate focus area statistics
  const focusAreaStats = (() => {
    const areaCount = new Map<string, number>();
    filteredBookingsForAnalytics.forEach(booking => {
      if (booking.focusAreas && Array.isArray(booking.focusAreas)) {
        booking.focusAreas.forEach(area => {
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
          <TabsList className="w-full grid grid-cols-3 grid-rows-4 gap-2 bg-gray-100 p-2 rounded-lg h-auto">
            <TabsTrigger 
              value="bookings" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-blue-100"
            >
              📅 Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-green-100"
            >
              🔮 Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="athletes" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-orange-100"
            >
              🏆 Athletes
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

          <TabsContent value="bookings">
            <AdminBookingManager />
          </TabsContent>

          <TabsContent value="athletes">
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
                  {athletes
                    .filter(athlete => {
                      // Search filter
                      if (athleteSearchTerm) {
                        const searchTerm = athleteSearchTerm.toLowerCase();
                        const athleteName = (athlete.firstName && athlete.lastName 
                          ? `${athlete.firstName} ${athlete.lastName}` 
                          : athlete.name).toLowerCase();
                        if (!athleteName.includes(searchTerm)) {
                          return false;
                        }
                      }
                      return true; // Show all athletes, not just those with upcoming birthdays
                    })
                    .sort((a, b) => {
                      const today = new Date();
                      const birthdayA = new Date(a.dateOfBirth);
                      const birthdayB = new Date(b.dateOfBirth);
                      const nextBirthdayA = new Date(today.getFullYear(), birthdayA.getMonth(), birthdayA.getDate());
                      const nextBirthdayB = new Date(today.getFullYear(), birthdayB.getMonth(), birthdayB.getDate());
                      
                      if (nextBirthdayA < today) nextBirthdayA.setFullYear(today.getFullYear() + 1);
                      if (nextBirthdayB < today) nextBirthdayB.setFullYear(today.getFullYear() + 1);
                      
                      const daysUntilA = Math.ceil((nextBirthdayA.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      const daysUntilB = Math.ceil((nextBirthdayB.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      
                      // Sort by upcoming birthdays first (within 30 days), then alphabetically
                      const isUpcomingA = daysUntilA <= 30;
                      const isUpcomingB = daysUntilB <= 30;
                      
                      if (isUpcomingA && !isUpcomingB) return -1;
                      if (!isUpcomingA && isUpcomingB) return 1;
                      if (isUpcomingA && isUpcomingB) return daysUntilA - daysUntilB;
                      
                      // Both not upcoming, sort alphabetically
                      const nameA = (a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : a.name);
                      const nameB = (b.firstName && b.lastName ? `${b.firstName} ${b.lastName}` : b.name);
                      return nameA.localeCompare(nameB);
                    })
                    .map((athlete) => {
                      const athleteKey = `${athlete.firstName && athlete.lastName 
                        ? `${athlete.firstName} ${athlete.lastName}`
                        : athlete.name}-${athlete.dateOfBirth}`;
                      const parentInfo = parentMapping.get(athleteKey);
                      const today = new Date();
                      const birthDate = new Date(athlete.dateOfBirth);
                      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                      if (nextBirthday < today) {
                        nextBirthday.setFullYear(today.getFullYear() + 1);
                      }
                      const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={athlete.id} className="relative bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-5 shadow-sm">
                          {/* Action buttons in top-right corner */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 hover:bg-yellow-100"
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
                              className="h-8 w-8 p-0 hover:bg-yellow-100"
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
                                className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handlePhotoClick(athlete.photo!)}
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            
                            <div className="flex-1 space-y-2">
                              {/* Name with emoji */}
                              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                🧑 {athlete.firstName && athlete.lastName 
                                  ? `${athlete.firstName} ${athlete.lastName}`
                                  : athlete.name}
                              </h3>
                              
                              {/* Birthday alert - only if within 7 days */}
                              {daysUntilBirthday <= 7 && (
                                <p className="text-sm font-medium text-orange-700 flex items-center gap-1">
                                  🎉 Birthday in {daysUntilBirthday} {daysUntilBirthday === 1 ? 'day' : 'days'}!
                                </p>
                              )}
                              
                              {/* Age and experience */}
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                🎂 Age: {calculateAge(athlete.dateOfBirth)} | 
                                🥇 {athlete.experience.charAt(0).toUpperCase() + athlete.experience.slice(1)}
                              </p>
                              
                              {/* Parent info */}
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
                  
                  {/* Show regular athletes */}
                  {athletes
                    .filter(athlete => {
                      // Search filter
                      if (athleteSearchTerm) {
                        const searchTerm = athleteSearchTerm.toLowerCase();
                        const athleteName = (athlete.firstName && athlete.lastName 
                          ? `${athlete.firstName} ${athlete.lastName}` 
                          : athlete.name).toLowerCase();
                        if (!athleteName.includes(searchTerm)) {
                          return false;
                        }
                      }
                      
                      const today = new Date();
                      const birthDate = new Date(athlete.dateOfBirth);
                      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                      if (nextBirthday < today) {
                        nextBirthday.setFullYear(today.getFullYear() + 1);
                      }
                      const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return daysUntilBirthday > 7 || daysUntilBirthday < 0;
                    })
                    .map((athlete) => {
                      const athleteKey = `${athlete.firstName && athlete.lastName 
                        ? `${athlete.firstName} ${athlete.lastName}`
                        : athlete.name}-${athlete.dateOfBirth}`;
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
                                🎂 {calculateAge(athlete.dateOfBirth)} years old | 
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

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <CardTitle>Upcoming Sessions</CardTitle>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <Input
                        type="date"
                        className="w-40"
                        value={upcomingDateFilter}
                        onChange={(e) => setUpcomingDateFilter(e.target.value)}
                        placeholder="Filter by date"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={upcomingTimeFilter} onValueChange={setUpcomingTimeFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sessions</SelectItem>
                        <SelectItem value="today">Today Only</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUpcomingSortAsc(!upcomingSortAsc)}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      {upcomingSortAsc ? "Earliest First" : "Latest First"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  let upcomingBookings = bookings
                    .filter(b => {
                      const bookingDate = new Date(b.preferredDate);
                      
                      // Filter by status - check attendance status
                      if (b.attendanceStatus !== 'confirmed' && b.attendanceStatus !== 'manual') return false;
                      
                      // Filter by date if specified
                      if (upcomingDateFilter && b.preferredDate !== upcomingDateFilter) return false;
                      
                      // Filter by time range
                      if (upcomingTimeFilter === 'today') {
                        return bookingDate.toDateString() === today.toDateString();
                      } else if (upcomingTimeFilter === 'week') {
                        const weekFromNow = new Date(today);
                        weekFromNow.setDate(weekFromNow.getDate() + 7);
                        return bookingDate >= today && bookingDate <= weekFromNow;
                      } else if (upcomingTimeFilter === 'month') {
                        const monthFromNow = new Date(today);
                        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
                        return bookingDate >= today && bookingDate <= monthFromNow;
                      }
                      
                      return bookingDate >= today;
                    })
                    .sort((a, b) => {
                      const dateA = new Date(a.preferredDate);
                      const dateB = new Date(b.preferredDate);
                      if (dateA.getTime() === dateB.getTime()) {
                        return a.preferredTime.localeCompare(b.preferredTime);
                      }
                      return upcomingSortAsc 
                        ? dateA.getTime() - dateB.getTime()
                        : dateB.getTime() - dateA.getTime();
                      return dateA.getTime() - dateB.getTime();
                    });

                  const todayBookings = upcomingBookings.filter(b => {
                    const bookingDate = new Date(b.preferredDate);
                    return bookingDate.toDateString() === today.toDateString();
                  });

                  const futureBookings = upcomingBookings.filter(b => {
                    const bookingDate = new Date(b.preferredDate);
                    return bookingDate.toDateString() !== today.toDateString();
                  });

                  return (
                    <div className="space-y-6">
                      {todayBookings.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-orange-600">Today's Sessions</h3>
                          <div className="space-y-3">
                            {todayBookings.map(booking => (
                              <div key={booking.id} className="border rounded-lg p-4 bg-orange-50">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">{booking.preferredTime} - {booking.lessonType}</p>
                                    <p className="text-sm text-gray-600">
                                      {booking.athlete1Name} 
                                      {booking.athlete2Name && ` & ${booking.athlete2Name}`}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Parent: {booking.parentFirstName} {booking.parentLastName}
                                    </p>
                                  </div>
                                  <Badge variant="default">Today</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {futureBookings.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Future Sessions</h3>
                          <div className="space-y-3">
                            {futureBookings.map(booking => (
                              <div key={booking.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">
                                      {formatDate(booking.preferredDate)} at {booking.preferredTime}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {booking.lessonType} - {booking.athlete1Name}
                                      {booking.athlete2Name && ` & ${booking.athlete2Name}`}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Parent: {booking.parentFirstName} {booking.parentLastName}
                                    </p>
                                  </div>
                                  <Badge variant="outline">
                                    {Math.ceil((new Date(booking.preferredDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {upcomingBookings.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No upcoming sessions scheduled.</p>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
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
                                  {new Date(post.publishedAt).toLocaleDateString()}
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
                                value={newException.date}
                                onChange={(e) => setNewException({
                                  ...newException,
                                  date: e.target.value
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
                            ? (bookings.reduce((sum, b) => sum + parseFloat(b.amount || '0'), 0) / bookings.length).toFixed(2)
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
                            const count = filteredBookingsForAnalytics.filter(b => b.lessonType === type.key).length;
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
                                    This action will permanently delete ALL:
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Athlete</DialogTitle>
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
                      <Label htmlFor="edit-firstName">First Name</Label>
                      <Input
                        id="edit-firstName"
                        name="firstName"
                        defaultValue={selectedAthlete.firstName || selectedAthlete.name.split(' ')[0]}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-lastName">Last Name</Label>
                      <Input
                        id="edit-lastName"
                        name="lastName"
                        defaultValue={selectedAthlete.lastName || selectedAthlete.name.split(' ').slice(1).join(' ')}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-dob">Date of Birth</Label>
                    <Input
                      id="edit-dob"
                      name="dateOfBirth"
                      type="date"
                      defaultValue={selectedAthlete.dateOfBirth}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-gender">Gender</Label>
                    <Select name="gender" defaultValue={selectedAthlete.gender || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-experience">Experience Level</Label>
                    <Select
                      name="experience"
                      defaultValue={selectedAthlete.experience}
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
                    <Label htmlFor="edit-allergies">Allergies/Medical Notes</Label>
                    <Textarea
                      id="edit-allergies"
                      name="allergies"
                      defaultValue={selectedAthlete.allergies || ''}
                      placeholder="Any allergies or medical conditions..."
                    />
                  </div>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Athlete View Modal */}
        <Dialog open={isAthleteViewOpen} onOpenChange={setIsAthleteViewOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Athlete Profile</DialogTitle>
            </DialogHeader>
            {selectedAthlete && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {selectedAthlete.photo ? (
                          <img
                            src={selectedAthlete.photo}
                            alt={`${selectedAthlete.name}'s photo`}
                            className="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handlePhotoClick(selectedAthlete.photo!)}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
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
                      <div className="flex-1">
                        <p className="font-medium text-lg">{selectedAthlete.name}</p>
                        <p className="text-sm text-gray-600">
                          Age: {calculateAge(selectedAthlete.dateOfBirth)} years old
                        </p>
                        <p className="text-sm text-gray-600">
                          Born: {new Date(selectedAthlete.dateOfBirth).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-blue-600 font-medium mt-1">
                          Click photo to enlarge or click to upload new
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm"><span className="font-medium">Experience:</span> {selectedAthlete.experience}</p>
                      <p className="text-sm"><span className="font-medium">Gender:</span> {selectedAthlete.gender || 'Not specified'}</p>
                      {selectedAthlete.allergies && (
                        <p className="text-sm text-red-600 mt-1">
                          <span className="font-medium">Allergies:</span> {selectedAthlete.allergies}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parent Info */}
                {(() => {
                  const parentInfo = parentMapping.get(`${selectedAthlete.name}-${selectedAthlete.dateOfBirth}`);
                  return parentInfo ? (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Parent Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><span className="font-medium">Name:</span> {parentInfo.firstName} {parentInfo.lastName}</p>
                          <p><span className="font-medium">Email:</span> {parentInfo.email}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Phone:</span> {parentInfo.phone}</p>
                          <p><span className="font-medium">Emergency Contact:</span> {parentInfo.emergencyContactName} ({parentInfo.emergencyContactPhone})</p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Waiver Status */}
                {(() => {
                  const athleteBookings = bookings.filter(b => 
                    b.athlete1Name === selectedAthlete.name ||
                    (selectedAthlete.firstName && selectedAthlete.lastName && 
                     b.athlete1Name === `${selectedAthlete.firstName} ${selectedAthlete.lastName}`)
                  );
                  const hasWaiver = athleteBookings.some(b => b.waiverSigned);
                  const waiverBooking = athleteBookings.find(b => b.waiverSigned);

                  return (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Waiver Status</h3>
                      {hasWaiver ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-green-600">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span className="font-medium">Waiver Signed</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Signed by: {waiverBooking?.waiverSignatureName}</p>
                            <p>Date: {waiverBooking?.waiverSignedAt ? formatDate(waiverBooking.waiverSignedAt.toString().split('T')[0]) : 'Unknown'}</p>
                            <p>Booking ID: #{waiverBooking?.id}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-orange-600">
                            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                            <span className="font-medium">Waiver Required</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            No waiver found for this athlete. Waiver must be signed before first lesson.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Bookings History */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Booking History</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {bookings
                      .filter(b => b.athlete1Name === selectedAthlete.name || b.athlete2Name === selectedAthlete.name)
                      .sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime())
                      .map((booking) => (
                        <div key={booking.id} className="border rounded p-3">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{booking.lessonType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                              <p className="text-sm text-gray-600">{booking.preferredDate} at {booking.preferredTime}</p>
                              <p className="text-sm text-gray-600">Focus: {booking.focusAreas.join(', ')}</p>
                              {booking.waiverSigned && (
                                <p className="text-xs text-green-600 font-medium">✓ Waiver Signed</p>
                              )}
                            </div>
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {bookings.filter(b => b.athlete1Name === selectedAthlete.name || b.athlete2Name === selectedAthlete.name).length === 0 && (
                      <p className="text-sm text-gray-500">No bookings yet</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button 
                    onClick={() => {
                      setIsAthleteViewOpen(false);
                      setIsManualBookingFromAthlete(true);
                    }}
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
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => setIsAthleteViewOpen(false)}>
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
                          <p className="text-gray-600">{booking.lessonType} - Status: {booking.status}</p>
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

        {/* Manual Booking Modal from Athlete Profile */}
        {isManualBookingFromAthlete && selectedAthlete && (
          <AdminBookingManager
            prefilledData={{
              athlete1Name: selectedAthlete.name,
              athlete1DateOfBirth: selectedAthlete.dateOfBirth,
              athlete1Experience: selectedAthlete.experience,
              athlete1Allergies: selectedAthlete.allergies || undefined,
              parentInfo: parentMapping.get(`${selectedAthlete.name}-${selectedAthlete.dateOfBirth}`)
            }}
            onClose={() => {
              setIsManualBookingFromAthlete(false);
              setSelectedAthlete(null);
            }}
          />
        )}

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