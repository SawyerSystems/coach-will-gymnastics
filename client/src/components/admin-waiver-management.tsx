import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/dateUtils";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Download, Eye, FileText, Mail, Search } from "lucide-react";
import { useState } from "react";

interface Waiver {
  id: number | string;
  athleteName: string;
  signerName: string;
  relationshipToAthlete: string;
  emergencyContactNumber: string;
  pdfPath?: string;
  signedAt: string;
  emailSentAt?: string;
  understandsRisks: boolean;
  agreesToPolicies: boolean;
  authorizesEmergencyCare: boolean;
  allowsPhotoVideo: boolean;
  confirmsAuthority: boolean;
  // Dynamic status fields
  status?: 'signed' | 'missing' | 'archived';
  archivedAt?: string;
  archiveReason?: string;
  legalRetentionPeriod?: string;
  originalParentId?: number | null;
  originalAthleteId?: number | null;
  // Additional fields for missing waivers
  name?: string;
  dateOfBirth?: string;
}

interface AthleteWithWaiver {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  hasWaiver: boolean;
  waiverSignedAt?: string;
  waiverSignatureName?: string;
}

interface MissingWaiverAthlete extends Waiver {
  name: string;
  dateOfBirth: string;
}

export function AdminWaiverManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWaiver, setSelectedWaiver] = useState<Waiver | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'signed' | 'missing' | 'archived'>('all');

  // Fetch all waivers with dynamic categorization
  const { data: allWaivers = [], isLoading: waiversLoading } = useQuery<Waiver[]>({
    queryKey: ["/api/waivers/categorized"],
    queryFn: async () => {
      // Fetch all waiver data from multiple endpoints
      const [signedResponse, missingResponse, archivedResponse] = await Promise.all([
        apiRequest("GET", "/api/waivers"),
        apiRequest("GET", "/api/athletes/missing-waivers"),
        apiRequest("GET", "/api/waivers/archived")
      ]);

      const [signedData, missingData, archivedData] = await Promise.all([
        signedResponse.json(),
        missingResponse.json(),
        archivedResponse.json()
      ]);

      // Categorize signed waivers
      const signedWaivers = signedData.map((waiver: any) => ({
        ...waiver,
        status: 'signed' as const
      }));

      // Categorize missing waivers (convert athletes to waiver format)
      const missingWaivers = missingData.map((athlete: any) => ({
        id: `missing-${athlete.id}`,
        athleteName: athlete.name,
        signerName: 'Not signed',
        relationshipToAthlete: 'N/A',
        emergencyContactNumber: 'N/A',
        signedAt: '',
        status: 'missing' as const,
        understandsRisks: false,
        agreesToPolicies: false,
        authorizesEmergencyCare: false,
        allowsPhotoVideo: false,
        confirmsAuthority: false,
        // Add athlete-specific fields for missing waivers
        name: athlete.name,
        dateOfBirth: athlete.dateOfBirth
      }));

      // Categorize archived waivers
      const archivedWaivers = archivedData.map((waiver: any) => ({
        ...waiver,
        status: 'archived' as const
      }));

      return [...signedWaivers, ...missingWaivers, ...archivedWaivers];
    },
    staleTime: 30000, // 30 seconds - refresh frequently for real-time updates
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  // Separate waivers by category
  const signedWaivers = allWaivers.filter(w => w.status === 'signed');
  const missingWaivers = allWaivers.filter(w => w.status === 'missing');
  const archivedWaivers = allWaivers.filter(w => w.status === 'archived');

  // Legacy queries for backward compatibility
  const { data: legacyMissingWaivers = [], isLoading: missingLoading } = useQuery<AthleteWithWaiver[]>({
    queryKey: ["/api/athletes/missing-waivers"],
  });

  // Resend email mutation
  const resendEmailMutation = useMutation({
    mutationFn: async (waiverId: number | string) => {
      const response = await apiRequest("POST", `/api/waivers/${waiverId}/resend-email`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Waiver email has been resent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/waivers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send waiver email.",
        variant: "destructive",
      });
    },
  });

  // Generate PDF mutation
  const generatePDFMutation = useMutation({
    mutationFn: async (waiverId: number | string) => {
      const response = await apiRequest("POST", `/api/waivers/${waiverId}/generate-pdf`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "PDF Generated",
        description: "Waiver PDF has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/waivers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate waiver PDF.",
        variant: "destructive",
      });
    },
  });

  // Download PDF function
  const downloadPDF = async (waiverId: number | string, athleteName: string) => {
    try {
      const response = await apiRequest("GET", `/api/waivers/${waiverId}/pdf`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${athleteName}_waiver.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "PDF download has started.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download waiver PDF.",
        variant: "destructive",
      });
    }
  };

  // Filter waivers based on search term
  const filteredSignedWaivers = signedWaivers.filter(waiver =>
    (waiver.athleteName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (waiver.signerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMissingWaivers = missingWaivers.filter(waiver =>
    (waiver.athleteName || waiver.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((waiver as any).name && (waiver as any).name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredArchivedWaivers = archivedWaivers.filter(waiver =>
    waiver.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    waiver.signerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (waiversLoading || missingLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Waiver Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search athletes or signers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waivers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allWaivers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all categories
            </p>
          </CardContent>
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed Waivers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{signedWaivers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {signedWaivers.filter(w => w.emailSentAt).length} emails sent
            </p>
          </CardContent>
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Waivers</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{missingWaivers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require immediate attention
            </p>
          </CardContent>
          {missingWaivers.length > 0 && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived Waivers</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{archivedWaivers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Legal records retained
            </p>
          </CardContent>
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="signed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signed">Signed Waivers ({signedWaivers.length})</TabsTrigger>
          <TabsTrigger value="missing">Missing Waivers ({missingWaivers.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived Waivers ({archivedWaivers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="signed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signed Waivers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Signer</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Signed Date</TableHead>
                    <TableHead>Email Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSignedWaivers.map((waiver) => (
                    <TableRow key={waiver.id}>
                      <TableCell className="font-medium">{waiver.athleteName}</TableCell>
                      <TableCell>{waiver.signerName}</TableCell>
                      <TableCell>{waiver.relationshipToAthlete}</TableCell>
                      <TableCell>{formatDate(waiver.signedAt.split('T')[0])}</TableCell>
                      <TableCell>
                        {waiver.emailSentAt ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sent
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            Not Sent
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedWaiver(waiver)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Waiver Details - {waiver.athleteName}</DialogTitle>
                              </DialogHeader>
                              {selectedWaiver && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="font-semibold">Athlete Name:</label>
                                      <p>{selectedWaiver.athleteName}</p>
                                    </div>
                                    <div>
                                      <label className="font-semibold">Signer Name:</label>
                                      <p>{selectedWaiver.signerName}</p>
                                    </div>
                                    <div>
                                      <label className="font-semibold">Relationship:</label>
                                      <p>{selectedWaiver.relationshipToAthlete}</p>
                                    </div>
                                    <div>
                                      <label className="font-semibold">Emergency Contact:</label>
                                      <p>{selectedWaiver.emergencyContactNumber}</p>
                                    </div>
                                    <div>
                                      <label className="font-semibold">Signed Date:</label>
                                      <p>{formatDate(selectedWaiver.signedAt.split('T')[0])}</p>
                                    </div>
                                    <div>
                                      <label className="font-semibold">Email Sent:</label>
                                      <p>{selectedWaiver.emailSentAt ? formatDate(selectedWaiver.emailSentAt.split('T')[0]) : 'Not sent'}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <h4 className="font-semibold">Agreement Status:</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                      <div className="flex items-center">
                                        {selectedWaiver.understandsRisks ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <AlertCircle className="h-4 w-4 text-red-600 mr-2" />}
                                        <span>Understands Risks</span>
                                      </div>
                                      <div className="flex items-center">
                                        {selectedWaiver.agreesToPolicies ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <AlertCircle className="h-4 w-4 text-red-600 mr-2" />}
                                        <span>Agrees to Policies</span>
                                      </div>
                                      <div className="flex items-center">
                                        {selectedWaiver.authorizesEmergencyCare ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <AlertCircle className="h-4 w-4 text-red-600 mr-2" />}
                                        <span>Authorizes Emergency Care</span>
                                      </div>
                                      <div className="flex items-center">
                                        {selectedWaiver.allowsPhotoVideo ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <AlertCircle className="h-4 w-4 text-red-600 mr-2" />}
                                        <span>Allows Photo/Video</span>
                                      </div>
                                      <div className="flex items-center">
                                        {selectedWaiver.confirmsAuthority ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <AlertCircle className="h-4 w-4 text-red-600 mr-2" />}
                                        <span>Confirms Authority</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {waiver.pdfPath && typeof waiver.id === 'number' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadPDF(waiver.id, waiver.athleteName)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          ) : typeof waiver.id === 'number' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generatePDFMutation.mutate(waiver.id)}
                              disabled={generatePDFMutation.isPending}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              {generatePDFMutation.isPending ? "Generating..." : "Generate PDF"}
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Missing waiver
                            </Badge>
                          )}
                          
                          {typeof waiver.id === 'number' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resendEmailMutation.mutate(waiver.id)}
                              disabled={resendEmailMutation.isPending}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              {resendEmailMutation.isPending ? "Sending..." : "Email"}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="opacity-50"
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              N/A
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Athletes Missing Waivers
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMissingWaivers.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-800">
                      <strong>Dynamic Status:</strong> These athletes automatically appear here when they have active bookings but no signed waivers. Status updates in real-time.
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Athlete Name</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMissingWaivers.map((waiver) => (
                        <TableRow key={waiver.id}>
                          <TableCell className="font-medium">{waiver.athleteName}</TableCell>
                          <TableCell>{waiver.dateOfBirth ? formatDate(waiver.dateOfBirth) : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-orange-100 text-orange-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Waiver Required
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-500">Real-time</span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Manual Waiver Process",
                                  description: "Contact the parent to complete the waiver through the booking system or parent portal.",
                                });
                              }}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Contact Parent
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-900 mb-2">All Waivers Complete!</h3>
                  <p className="text-gray-600">All athletes with active bookings have signed waivers.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Status automatically updates when new athletes need waivers.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Archived Waivers
                <div className="ml-auto">
                  <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse"></div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {waiversLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
                  </div>
                </div>
              ) : archivedWaivers.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Legal Records:</strong> These waivers are retained for legal compliance even after parent/athlete accounts have been deleted. Retention period: 7 years from signing date.
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Athlete</TableHead>
                        <TableHead>Signer</TableHead>
                        <TableHead>Relationship</TableHead>
                        <TableHead>Signed Date</TableHead>
                        <TableHead>Archived Date</TableHead>
                        <TableHead>Archive Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {archivedWaivers.map((waiver) => (
                        <TableRow key={waiver.id}>
                          <TableCell className="font-medium">{waiver.athleteName}</TableCell>
                          <TableCell>{waiver.signerName}</TableCell>
                          <TableCell>{waiver.relationshipToAthlete}</TableCell>
                          <TableCell>{formatDate(waiver.signedAt.split('T')[0])}</TableCell>
                          <TableCell>
                            {(waiver as any).archivedAt ? formatDate((waiver as any).archivedAt.split('T')[0]) : 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                              {(waiver as any).archiveReason || 'Account deleted'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedWaiver(waiver)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Archived Waiver - {waiver.athleteName}</DialogTitle>
                                  </DialogHeader>
                                  {selectedWaiver && (
                                    <div className="space-y-4">
                                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-sm text-red-800">
                                          <strong>⚠️ Archived Record:</strong> This waiver is retained for legal compliance. Original parent/athlete accounts have been deleted.
                                        </p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="font-semibold">Athlete Name:</label>
                                          <p>{selectedWaiver.athleteName}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold">Signer Name:</label>
                                          <p>{selectedWaiver.signerName}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold">Relationship:</label>
                                          <p>{selectedWaiver.relationshipToAthlete}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold">Emergency Contact:</label>
                                          <p>{selectedWaiver.emergencyContactNumber}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold">Signed Date:</label>
                                          <p>{formatDate(selectedWaiver.signedAt.split('T')[0])}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold">Legal Retention Until:</label>
                                          <p>{(selectedWaiver as any).legalRetentionPeriod || 'N/A'}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <h4 className="font-semibold">Agreement Status:</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                          <div className="flex items-center">
                                            {selectedWaiver.understandsRisks ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <AlertCircle className="h-4 w-4 text-red-600 mr-2" />}
                                            <span>Understands Risks</span>
                                          </div>
                                          <div className="flex items-center">
                                            {selectedWaiver.agreesToPolicies ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <AlertCircle className="h-4 w-4 text-red-600 mr-2" />}
                                            <span>Agrees to Policies</span>
                                          </div>
                                          <div className="flex items-center">
                                            {selectedWaiver.authorizesEmergencyCare ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <AlertCircle className="h-4 w-4 text-red-600 mr-2" />}
                                            <span>Authorizes Emergency Care</span>
                                          </div>
                                          <div className="flex items-center">
                                            {selectedWaiver.allowsPhotoVideo ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <AlertCircle className="h-4 w-4 text-red-600 mr-2" />}
                                            <span>Allows Photo/Video</span>
                                          </div>
                                          <div className="flex items-center">
                                            {selectedWaiver.confirmsAuthority ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <AlertCircle className="h-4 w-4 text-red-600 mr-2" />}
                                            <span>Confirms Signing Authority</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadPDF(waiver.id, waiver.athleteName)}
                                disabled={typeof waiver.id !== 'number'}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Archived Waivers</h3>
                  <p className="text-gray-600">
                    Waivers will appear here when associated parent or athlete accounts are deleted.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    These records are retained for legal compliance (7 years from signing date).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}