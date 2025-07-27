import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { apiRequest } from "@/lib/queryClient";
import type { Parent } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, Search, UserPlus, Users } from "lucide-react";
import { useState } from "react";

// API response interface (matches database field names)
interface ParentAPIResponse {
  id: number;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
      return data.parents || [];
    },
    enabled: !showCreateForm, // Don't fetch when showing create form
  });

  // Convert API response to Parent type with proper field mapping
  const parents: Parent[] = (parentsResponse || []).map((apiParent) => ({
    id: apiParent.id,
    firstName: apiParent.first_name || "",
    lastName: apiParent.last_name || "",
    email: apiParent.email,
    phone: apiParent.phone || "",
    passwordHash: null,
    emergencyContactName: "",
    emergencyContactPhone: "",
    isVerified: false,
    blogEmails: false,
    createdAt: apiParent.created_at ? new Date(apiParent.created_at) : null,
    updatedAt: apiParent.updated_at ? new Date(apiParent.updated_at) : null,
  }));

  const handleBackToSelection = () => {
    setShowCreateForm(false);
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
      const response = await apiRequest('POST', '/api/parents', {
        body: JSON.stringify(newParentForm),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newParent: Parent = {
          id: data.parent.id,
          firstName: newParentForm.firstName,
          lastName: newParentForm.lastName,
          email: newParentForm.email,
          phone: newParentForm.phone,
          passwordHash: null,
          emergencyContactName: newParentForm.emergencyContactName,
          emergencyContactPhone: newParentForm.emergencyContactPhone,
          isVerified: false,
          blogEmails: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Update booking state with new parent
        updateState({
          parentInfo: {
            firstName: newParent.firstName,
            lastName: newParent.lastName,
            email: newParent.email,
            phone: newParent.phone,
            emergencyContactName: newParent.emergencyContactName,
            emergencyContactPhone: newParent.emergencyContactPhone,
          },
          parentId: newParent.id,
          selectedParent: newParent,
        });

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
  };

  const handleSelectParent = (parent: Parent) => {
    setSelectedParent(parent);
    updateState({
      parentId: parent.id,
      selectedParent: parent,
      parentInfo: {
        firstName: parent.firstName || '',
        lastName: parent.lastName || '',
        email: parent.email || '',
        phone: parent.phone || '',
        emergencyContactName: parent.emergencyContactName || '',
        emergencyContactPhone: parent.emergencyContactPhone || ''
      }
    });
  };

  const handleContinueWithSelected = () => {
    if (selectedParent) {
      nextStep();
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
        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500 max-w-md mx-auto"
        onClick={handleNewParent}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Create New Parent</h3>
            <p className="text-sm text-muted-foreground">
              Create a new parent account for this booking
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                      ? 'border-green-500 bg-green-50' 
                      : 'hover:border-green-500'
                  }`}
                  onClick={() => handleSelectParent(parent)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                          {parent.firstName} {parent.lastName}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
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
                          <p className="text-xs text-muted-foreground mt-1">
                            Member since: {new Date(parent.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {selectedParent?.id === parent.id && (
                        <div className="bg-green-100 p-2 rounded-full">
                          <Users className="h-4 w-4 text-green-600" />
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
