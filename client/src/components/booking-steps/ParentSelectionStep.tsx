import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Parent } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Lock, Mail, Phone, Search, UserPlus, Users } from "lucide-react";
import { useState } from "react";

// API response interface (matches database field names)
interface ParentAPIResponse {
  id: number;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  password_hash?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_verified?: boolean;
  blog_emails?: boolean;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Form data interface for creating new parents
interface NewParentForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export function ParentSelectionStep() {
  const { state, updateState, nextStep } = useBookingFlow();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [newParentForm, setNewParentForm] = useState<NewParentForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [isCreatingParent, setIsCreatingParent] = useState(false);

  // Fetch parents from API
  const { data: parentsResponse = [], isLoading, error } = useQuery<ParentAPIResponse[]>({
    queryKey: ['/api/parents', { search: searchTerm }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      params.append('limit', '50'); // Get more results for selection
      
      const response = await apiRequest('GET', `/api/parents?${params.toString()}`);
      const data = await response.json();
      
      // Debug the API response format
      if (data.parents && data.parents.length > 0) {
        console.log("Parent API response format sample:", {
          firstParent: data.parents[0],
          hasEmergencyContactName: 'emergency_contact_name' in data.parents[0],
          emergencyContactName: data.parents[0].emergency_contact_name,
          emergencyContactPhone: data.parents[0].emergency_contact_phone,
        });
      }
      
      return data.parents || [];
    },
    enabled: !showCreateForm, // Don't fetch when showing create form
  });

  // Convert API response to Parent type with proper field mapping
  const parents: Parent[] = (parentsResponse || []).map((apiParent) => {
    // Debug emergency contact fields in the API response
    console.log(`Processing parent ${apiParent.id}: ${apiParent.first_name} ${apiParent.last_name}`, {
      emergency_contact_name: apiParent.emergency_contact_name,
      emergency_contact_phone: apiParent.emergency_contact_phone,
    });
    
    return {
      id: apiParent.id,
      firstName: apiParent.first_name || "",
      lastName: apiParent.last_name || "",
      email: apiParent.email,
      phone: apiParent.phone || "",
      passwordHash: apiParent.password_hash || "",
      emergencyContactName: apiParent.emergency_contact_name || "",
      emergencyContactPhone: apiParent.emergency_contact_phone || "",
      isVerified: apiParent.is_verified || false,
      blogEmails: apiParent.blog_emails || false,
      lastLoginAt: apiParent.last_login_at ? new Date(apiParent.last_login_at) : null,
      createdAt: apiParent.created_at ? new Date(apiParent.created_at) : null,
      updatedAt: apiParent.updated_at ? new Date(apiParent.updated_at) : null,
    };
  });

  const handleBackToSelection = () => {
    setShowCreateForm(false);
    setShowLoginForm(false);
    setLoginEmail("");
    setLoginPassword("");
    setNewParentForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    });
  };

  const handleCreateParent = async () => {
    if (!newParentForm.firstName || !newParentForm.lastName || !newParentForm.email || !newParentForm.phone) {
      return; // Basic validation
    }

    setIsCreatingParent(true);
    try {
      // Validate emergency contact info
      const emergencyContactName = newParentForm.emergencyContactName?.trim();
      const emergencyContactPhone = newParentForm.emergencyContactPhone?.trim();
      
      if (!emergencyContactName || !emergencyContactPhone) {
        console.error("Missing emergency contact information!");
        console.log("Emergency contact data:", {
          name: emergencyContactName,
          phone: emergencyContactPhone,
          formData: newParentForm
        });
      }
      
      // Prepare data for API call - match InsertParent schema requirements
      const emergencyName = emergencyContactName || 'Emergency Contact Required';
      const emergencyPhone = emergencyContactPhone || 'Emergency Phone Required';

      const parentData = {
        firstName: newParentForm.firstName.trim(),
        lastName: newParentForm.lastName.trim(),
        email: newParentForm.email.trim(),
        phone: newParentForm.phone.trim(),
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        passwordHash: '', // Will be set by backend if needed
        isVerified: false,
      };
      
      console.log("Creating parent with data:", parentData);

      const response = await apiRequest('POST', '/api/parents', {
        body: JSON.stringify(parentData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const createdParent = await response.json();
        console.log("API response for created parent:", createdParent);
        
        // Check for camel case vs snake case format in the server response
        const responseEmergencyName = createdParent.emergencyContactName || createdParent.emergency_contact_name;
        const responseEmergencyPhone = createdParent.emergencyContactPhone || createdParent.emergency_contact_phone;
        
        // Log the emergency contact info from all possible sources
        console.log("Emergency contact info analysis:", {
          fromCreatedParent: {
            camelCase: {
              emergencyContactName: createdParent.emergencyContactName,
              emergencyContactPhone: createdParent.emergencyContactPhone,
            },
            snakeCase: {
              emergency_contact_name: createdParent.emergency_contact_name,
              emergency_contact_phone: createdParent.emergency_contact_phone,
            }
          },
          fromForm: {
            emergencyContactName: newParentForm.emergencyContactName,
            emergencyContactPhone: newParentForm.emergencyContactPhone,
          }
        });
        
        // Use form data as backup if not provided in response
        // IMPORTANT: Never use 'Not Provided' as this causes issues in the next steps
        const emergencyContactName = responseEmergencyName || newParentForm.emergencyContactName || 'Emergency Contact Required';
        const emergencyContactPhone = responseEmergencyPhone || newParentForm.emergencyContactPhone || 'Emergency Phone Required';
        
        console.log("Final emergency contact values:", { emergencyContactName, emergencyContactPhone });
        
        // Create a properly formatted parent object
        const newParent: Parent = {
          id: createdParent.id,
          firstName: createdParent.firstName || createdParent.first_name || newParentForm.firstName,
          lastName: createdParent.lastName || createdParent.last_name || newParentForm.lastName,
          email: createdParent.email || newParentForm.email,
          phone: createdParent.phone || newParentForm.phone,
          passwordHash: "",
          emergencyContactName,
          emergencyContactPhone,
          isVerified: false,
          blogEmails: false,
          lastLoginAt: null,
          createdAt: new Date(createdParent.createdAt || createdParent.created_at || Date.now()),
          updatedAt: new Date(createdParent.updatedAt || createdParent.updated_at || Date.now()),
        };
        
        // Create an enhanced parent object with both camelCase and snake_case properties for compatibility
        const enhancedParent = {
          ...newParent,
          // Add snake_case versions to ensure compatibility with any code expecting snake_case
          emergency_contact_name: emergencyContactName,
          emergency_contact_phone: emergencyContactPhone
        };

        // Update booking state with new parent - all necessary parent state
        // This ensures the parent info persists through the whole flow
        updateState({
          parentInfo: {
            firstName: newParent.firstName,
            lastName: newParent.lastName,
            email: newParent.email,
            phone: newParent.phone,
            emergencyContactName,
            emergencyContactPhone,
          },
          parentId: newParent.id,
          selectedParent: enhancedParent,
          isNewParentCreated: true,  // Set flag to identify new parent creation
        });
        
        console.log("Created and selected new parent with emergency contacts:", enhancedParent);
        nextStep();
      }
    } catch (error) {
      console.error('Error creating parent:', error);
    } finally {
      setIsCreatingParent(false);
    }
  };

  const handleNewParent = () => {
    setShowCreateForm(true);
    setShowLoginForm(false);
  };

  const handleExistingParentLogin = () => {
    setShowLoginForm(true);
    setShowCreateForm(false);
  };

  const handleParentLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await apiRequest("POST", "/api/parent-auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Fetch full parent details
        const parentResponse = await apiRequest("GET", "/api/parent/info");
        if (parentResponse.ok) {
          const parentInfo = await parentResponse.json();
          
          // Update booking state with authenticated parent
          updateState({
            parentInfo: {
              firstName: parentInfo.firstName || '',
              lastName: parentInfo.lastName || '',
              email: parentInfo.email || '',
              phone: parentInfo.phone || '',
              emergencyContactName: parentInfo.emergencyContactName || '',
              emergencyContactPhone: parentInfo.emergencyContactPhone || '',
            },
            parentId: parentInfo.id,
            selectedParent: parentInfo,
          });

          toast({
            title: "Login Successful",
            description: "Welcome back! Continuing with your booking.",
          });
          
          nextStep();
        } else {
          throw new Error("Failed to fetch parent information");
        }
      } else {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.error || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSelectParent = async (parent: Parent) => {
    setSelectedParent(parent);
    
    console.log("Initial parent selection:", parent);
    
    try {
      // Fetch the complete parent data directly from the API to ensure we have all fields
      console.log("Fetching complete parent data for ID:", parent.id);
      const response = await apiRequest('GET', `/api/parents/${parent.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch complete parent data: ${response.status}`);
      }
      
      const completeParent = await response.json();
      console.log("Complete parent data fetched:", completeParent);
      
      // Extract emergency contact info from all possible sources
      const emergencyContactName = 
        completeParent.emergencyContactName || 
        completeParent.emergency_contact_name || 
        parent.emergencyContactName || 
        (parent as any).emergency_contact_name || '';
      
      const emergencyContactPhone = 
        completeParent.emergencyContactPhone || 
        completeParent.emergency_contact_phone || 
        parent.emergencyContactPhone || 
        (parent as any).emergency_contact_phone || '';
      
      console.log("Selected parent emergency contact info:", { 
        emergencyContactName,
        emergencyContactPhone,
        sources: {
          completeParent_camelCase: {
            emergencyContactName: completeParent.emergencyContactName,
            emergencyContactPhone: completeParent.emergencyContactPhone,
          },
          completeParent_snakeCase: {
            emergency_contact_name: completeParent.emergency_contact_name,
            emergency_contact_phone: completeParent.emergency_contact_phone,
          },
          originalParent_camelCase: {
            emergencyContactName: parent.emergencyContactName,
            emergencyContactPhone: parent.emergencyContactPhone,
          },
          originalParent_snakeCase: {
            emergency_contact_name: (parent as any).emergency_contact_name,
            emergency_contact_phone: (parent as any).emergency_contact_phone,
          }
        }
      });
      
      // Create enhanced parent object with all fields in both formats
      const enhancedParent = {
        ...completeParent,
        // Ensure we have both camelCase and snake_case versions
        emergencyContactName,
        emergencyContactPhone,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone
      };
      
      updateState({
        parentId: parent.id,
        selectedParent: enhancedParent,
        parentInfo: {
          firstName: completeParent.firstName || completeParent.first_name || parent.firstName || '',
          lastName: completeParent.lastName || completeParent.last_name || parent.lastName || '',
          email: completeParent.email || parent.email || '',
          phone: completeParent.phone || parent.phone || '',
          emergencyContactName,
          emergencyContactPhone
        }
      });
    } catch (error) {
      console.error("Error fetching complete parent data:", error);
      
      // Fallback to using the original parent data if API fetch fails
      const emergencyContactName = parent.emergencyContactName || 
                                  (parent as any).emergency_contact_name || '';
      const emergencyContactPhone = parent.emergencyContactPhone || 
                                   (parent as any).emergency_contact_phone || '';
      
      console.log("Using original parent data as fallback:", { 
        emergencyContactName,
        emergencyContactPhone
      });
      
      updateState({
        parentId: parent.id,
        selectedParent: {
          ...parent,
          emergencyContactName,
          emergencyContactPhone,
          emergency_contact_name: emergencyContactName,
          emergency_contact_phone: emergencyContactPhone
        },
        parentInfo: {
          firstName: parent.firstName || '',
          lastName: parent.lastName || '',
          email: parent.email || '',
          phone: parent.phone || '',
          emergencyContactName,
          emergencyContactPhone
        }
      });
    }
  };

  const handleContinueWithSelected = async () => {
    if (selectedParent) {
      try {
        // Fetch the complete parent data directly from the API before continuing
        console.log("Fetching complete parent data before continuing for ID:", selectedParent.id);
        const response = await apiRequest('GET', `/api/parents/${selectedParent.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch complete parent data: ${response.status}`);
        }
        
        const completeParent = await response.json();
        console.log("Complete parent data fetched for continuation:", completeParent);
        
        // Extract emergency contact info from all possible sources
        const emergencyContactName = 
          completeParent.emergencyContactName || 
          completeParent.emergency_contact_name || 
          selectedParent.emergencyContactName || 
          (selectedParent as any).emergency_contact_name || '';
        
        const emergencyContactPhone = 
          completeParent.emergencyContactPhone || 
          completeParent.emergency_contact_phone || 
          selectedParent.emergencyContactPhone || 
          (selectedParent as any).emergency_contact_phone || '';
        
        console.log("Continue with selected parent emergency contact info:", { 
          emergencyContactName,
          emergencyContactPhone,
          sources: {
            completeParent_camelCase: {
              emergencyContactName: completeParent.emergencyContactName,
              emergencyContactPhone: completeParent.emergencyContactPhone,
            },
            completeParent_snakeCase: {
              emergency_contact_name: completeParent.emergency_contact_name,
              emergency_contact_phone: completeParent.emergency_contact_phone,
            }
          }
        });
        
        // Create enhanced parent object with all fields in both formats
        const enhancedParent = {
          ...completeParent,
          // Ensure we have both camelCase and snake_case versions
          emergencyContactName,
          emergencyContactPhone,
          emergency_contact_name: emergencyContactName,
          emergency_contact_phone: emergencyContactPhone
        };
        
        // Update booking state with selected parent
        updateState({
          parentInfo: {
            firstName: completeParent.firstName || completeParent.first_name || selectedParent.firstName,
            lastName: completeParent.lastName || completeParent.last_name || selectedParent.lastName,
            email: completeParent.email || selectedParent.email,
            phone: completeParent.phone || selectedParent.phone,
            emergencyContactName,
            emergencyContactPhone,
          },
          parentId: selectedParent.id,
          selectedParent: enhancedParent,
        });
        
        nextStep();
      } catch (error) {
        console.error("Error fetching complete parent data before continuing:", error);
        
        // Fallback to using the current selected parent data
        const emergencyContactName = selectedParent.emergencyContactName || 
                                    (selectedParent as any).emergency_contact_name || '';
        const emergencyContactPhone = selectedParent.emergencyContactPhone || 
                                     (selectedParent as any).emergency_contact_phone || '';
        
        console.log("Using original parent data as fallback for continuation:", { 
          emergencyContactName,
          emergencyContactPhone
        });
        
        // Update booking state with selected parent
        updateState({
          parentInfo: {
            firstName: selectedParent.firstName,
            lastName: selectedParent.lastName,
            email: selectedParent.email,
            phone: selectedParent.phone,
            emergencyContactName,
            emergencyContactPhone,
          },
          parentId: selectedParent.id,
          selectedParent: {
            ...selectedParent,
            emergencyContactName,
            emergencyContactPhone,
            emergency_contact_name: emergencyContactName,
            emergency_contact_phone: emergencyContactPhone
          },
        });
        
        nextStep();
      }
    }
  };

  if (error) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-red-600">Error Loading Parents</h2>
          <p className="text-muted-foreground">
            Failed to load parent list. Please try again.
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={handleNewParent} variant="outline">
            Create New Parent Instead
          </Button>
        </div>
      </div>
    );
  }

  // Show create form if user clicked "Create New Parent"
  if (showCreateForm) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Create New Parent Account</h2>
          <p className="text-muted-foreground">
            Enter parent information to create a new account
          </p>
        </div>

        {/* Back to Selection Button */}
        <div className="flex justify-start">
          <Button
            onClick={handleBackToSelection}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Selection
          </Button>
        </div>

        {/* Parent Creation Form */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  value={newParentForm.firstName}
                  onChange={(e) => setNewParentForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  value={newParentForm.lastName}
                  onChange={(e) => setNewParentForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                value={newParentForm.email}
                onChange={(e) => setNewParentForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number *
              </label>
              <Input
                id="phone"
                type="tel"
                value={newParentForm.phone}
                onChange={(e) => setNewParentForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label htmlFor="emergencyContactName" className="block text-sm font-medium mb-1">
                Emergency Contact Name *
              </label>
              <Input
                id="emergencyContactName"
                value={newParentForm.emergencyContactName}
                onChange={(e) => setNewParentForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                placeholder="Enter emergency contact name"
                required
              />
            </div>

            <div>
              <label htmlFor="emergencyContactPhone" className="block text-sm font-medium mb-1">
                Emergency Contact Phone *
              </label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                value={newParentForm.emergencyContactPhone}
                onChange={(e) => setNewParentForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                placeholder="Enter emergency contact phone"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={handleBackToSelection}
                variant="outline"
                disabled={isCreatingParent}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateParent}
                disabled={
                  isCreatingParent ||
                  !newParentForm.firstName ||
                  !newParentForm.lastName ||
                  !newParentForm.email ||
                  !newParentForm.phone ||
                  !newParentForm.emergencyContactName ||
                  !newParentForm.emergencyContactPhone
                }
              >
                {isCreatingParent ? "Creating..." : "Create Parent & Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login form if user clicked "Login as Existing Parent"
  if (showLoginForm) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Parent Login</h2>
          <p className="text-muted-foreground">
            Sign in to your existing parent account
          </p>
        </div>

        {/* Back to Selection Button */}
        <div className="flex justify-start">
          <Button
            onClick={handleBackToSelection}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Selection
          </Button>
        </div>

        {/* Login Form */}
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 space-y-4">
            <div className="text-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/60 p-3 rounded-full w-12 h-12 mx-auto mb-2">
                <Lock className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="font-semibold">Sign In</h3>
            </div>

            <div>
              <label htmlFor="loginEmail" className="block text-sm font-medium mb-1">
                Email Address *
              </label>
              <Input
                id="loginEmail"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="parent@example.com"
                disabled={isLoggingIn}
                required
              />
            </div>

            <div>
              <label htmlFor="loginPassword" className="block text-sm font-medium mb-1">
                Password *
              </label>
              <Input
                id="loginPassword"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoggingIn}
                onKeyDown={(e) => e.key === 'Enter' && handleParentLogin()}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={handleBackToSelection}
                variant="outline"
                disabled={isLoggingIn}
              >
                Cancel
              </Button>
              <Button
                onClick={handleParentLogin}
                disabled={isLoggingIn || !loginEmail.trim() || !loginPassword.trim()}
              >
                {isLoggingIn ? "Signing In..." : "Sign In & Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default parent selection view
  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Select Parent Account</h2>
        <p className="text-muted-foreground">
          Choose an existing parent or create a new account
        </p>
      </div>

      {/* Create New Parent Option */}
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500 dark:hover:border-blue-400 max-w-md mx-auto"
        onClick={handleNewParent}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="bg-blue-100 dark:bg-blue-900/60 p-3 rounded-full">
            <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Create New Parent</h3>
            <p className="text-sm text-muted-foreground">
              Create a new parent account for this booking
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Login as Existing Parent Option */}
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500 dark:hover:border-blue-400 max-w-md mx-auto"
        onClick={handleExistingParentLogin}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="bg-green-100 dark:bg-green-900/60 p-3 rounded-full">
            <Lock className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Login as Existing Parent</h3>
            <p className="text-sm text-muted-foreground">
              Sign in with your email and password
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select Existing Parent
        </h3>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <img src="/CWT_Circle_LogoSPIN.png" alt="Loading" className="animate-spin h-8 w-8 mx-auto" />
            <p className="text-muted-foreground mt-2">Loading parents...</p>
          </div>
        )}

        {/* Parents List */}
        {!isLoading && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {parents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? "No parents found matching your search." : "No parents found."}
                </p>
              </div>
            ) : (
              parents.map((parent) => (
                <Card 
                  key={parent.id}
                  className={`cursor-pointer hover:shadow-md transition-all border-2 ${
                    selectedParent?.id === parent.id 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400' 
                      : 'hover:border-green-500 dark:hover:border-green-400'
                  }`}
                  onClick={() => handleSelectParent(parent)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold text-lg ${
                          selectedParent?.id === parent.id 
                            ? 'text-green-800 dark:text-green-100' 
                            : ''
                        }`}>
                          {parent.firstName} {parent.lastName}
                        </h4>
                        <div className={`flex items-center gap-4 text-sm mt-1 ${
                          selectedParent?.id === parent.id 
                            ? 'text-green-700 dark:text-green-200' 
                            : 'text-muted-foreground'
                        }`}>
                          {parent.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {parent.email}
                            </div>
                          )}
                          {parent.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {parent.phone}
                            </div>
                          )}
                        </div>
                        {parent.createdAt && (
                          <p className={`text-xs mt-1 ${
                            selectedParent?.id === parent.id 
                              ? 'text-green-600 dark:text-green-300' 
                              : 'text-muted-foreground'
                          }`}>
                            Member since: {new Date(parent.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {selectedParent?.id === parent.id && (
                        <div className="bg-green-100 dark:bg-green-800/60 p-2 rounded-full">
                          <Users className="h-4 w-4 text-green-600 dark:text-green-300" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Continue Button */}
        {selectedParent && (
          <div className="mt-6 text-center">
            <Button 
              onClick={handleContinueWithSelected}
              className="w-full max-w-md"
            >
              Continue with {selectedParent.firstName} {selectedParent.lastName}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
