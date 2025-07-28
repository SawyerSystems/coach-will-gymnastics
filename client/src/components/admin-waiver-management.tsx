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
    (waiver.athleteName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (waiver.signerName || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Modern Header Section */}
      <div className="bg-gradient-to-r from-[#0F0276]/5 to-[#D8BD2A]/5 rounded-xl border border-slate-200/50 p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#D8BD2A]/10 rounded-lg">
                <FileText className="h-6 w-6 text-[#D8BD2A]" />
              </div>
              Waiver Management
            </h2>
            <p className="text-slate-600">Manage liability waivers and athlete documentation</p>
          </div>
          
          {/* Search Section */}
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search athletes or signers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full lg:w-80 rounded-xl border-slate-200 focus:border-[#D8BD2A] focus:ring-[#D8BD2A]"
            />
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl border-0 bg-gradient-to-br from-blue-50 via-blue-25 to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-800">Total Waivers</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-900">{allWaivers.length}</div>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 bg-gradient-to-br from-green-50 via-green-25 to-green-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-800">Signed Waivers</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-900">{signedWaivers.length}</div>
            <p className="text-xs text-green-600 mt-1 font-medium">
              {signedWaivers.filter(w => w.emailSentAt).length} emails sent
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 bg-gradient-to-br from-orange-50 via-orange-25 to-orange-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-800">Missing Waivers</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-orange-900">{missingWaivers.length}</div>
            <p className="text-xs text-orange-600 mt-1 font-medium">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 bg-gradient-to-br from-slate-50 via-slate-25 to-slate-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-800">Archived Waivers</CardTitle>
            <div className="p-2 bg-slate-100 rounded-lg">
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{archivedWaivers.length}</div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Legal records retained
            </p>
          </CardContent>
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="signed" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 p-1 rounded-xl shadow-sm">
            <TabsTrigger 
              value="signed" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2 font-semibold text-sm transition-all duration-200"
            >
              Signed Waivers ({signedWaivers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="missing" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2 font-semibold text-sm transition-all duration-200"
            >
              Missing Waivers ({missingWaivers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="archived" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-slate-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2 font-semibold text-sm transition-all duration-200"
            >
              Archived Waivers ({archivedWaivers.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="signed" className="space-y-4">
          <Card className="rounded-xl border-0 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 shadow-lg">
            <CardHeader className="border-b border-green-100/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    Signed Waivers
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Complete and legally binding liability waivers</p>
                </div>
                <div className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full font-bold">
                  {filteredSignedWaivers.length} Signed
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <TableRow className="border-b border-slate-200">
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Athlete</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Signer</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Relationship</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Signed Date</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Email Status</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {filteredSignedWaivers.map((waiver, index) => (
                      <TableRow 
                        key={waiver.id} 
                        className={`hover:bg-gradient-to-r hover:from-green-50/30 hover:to-emerald-50/30 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                      >
                        <TableCell className="px-6 py-4 font-semibold text-slate-900">{waiver.athleteName}</TableCell>
                        <TableCell className="px-6 py-4 text-slate-700">{waiver.signerName}</TableCell>
                        <TableCell className="px-6 py-4 text-slate-600">{waiver.relationshipToAthlete}</TableCell>
                        <TableCell className="px-6 py-4 text-slate-600 font-medium">{formatDate(waiver.signedAt.split('T')[0])}</TableCell>
                        <TableCell className="px-6 py-4">
                          {waiver.emailSentAt ? (
                            <Badge variant="default" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 font-semibold">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Sent
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300 font-medium">
                              Not Sent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedWaiver(waiver)}
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
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
                              className="border-green-200 text-green-700 hover:bg-green-50 font-medium"
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
                              className="border-purple-200 text-purple-700 hover:bg-purple-50 font-medium disabled:opacity-50"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              {generatePDFMutation.isPending ? "Generating..." : "Generate PDF"}
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                              Missing waiver
                            </Badge>
                          )}
                          
                          {typeof waiver.id === 'number' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resendEmailMutation.mutate(waiver.id)}
                              disabled={resendEmailMutation.isPending}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50 font-medium disabled:opacity-50"
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              {resendEmailMutation.isPending ? "Sending..." : "Email"}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="opacity-50 border-slate-200 text-slate-400"
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing" className="space-y-4">
          <Card className="rounded-xl border-0 bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 shadow-lg">
            <CardHeader className="border-b border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 flex items-center">
                    <AlertCircle className="h-6 w-6 text-orange-600 mr-2" />
                    Athletes Missing Waivers
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Athletes with active bookings requiring liability waivers</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="text-xs text-orange-700 bg-orange-100 px-3 py-1 rounded-full font-bold">
                    {filteredMissingWaivers.length} Missing
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {filteredMissingWaivers.length > 0 ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/60 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-900 mb-1">Dynamic Status Alert</h4>
                        <p className="text-sm text-orange-800">
                          These athletes automatically appear here when they have active bookings but no signed waivers. Status updates in real-time.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-orange-100">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                        <TableRow className="border-b border-slate-200">
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Athlete Name</TableHead>
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Date of Birth</TableHead>
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Status</TableHead>
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Last Updated</TableHead>
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-100">
                        {filteredMissingWaivers.map((waiver, index) => (
                          <TableRow 
                            key={waiver.id} 
                            className={`hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-red-50/30 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                            }`}
                          >
                            <TableCell className="px-6 py-4 font-semibold text-slate-900">{waiver.athleteName}</TableCell>
                            <TableCell className="px-6 py-4 text-slate-700">{waiver.dateOfBirth ? formatDate(waiver.dateOfBirth) : 'N/A'}</TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant="outline" className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200 font-semibold">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Waiver Required
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-slate-600 font-medium">Real-time</TableCell>
                            <TableCell className="px-6 py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Manual Waiver Process",
                                    description: "Contact the parent to complete the waiver through the booking system or parent portal.",
                                  });
                                }}
                                className="border-orange-200 text-orange-700 hover:bg-orange-50 font-medium"
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
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mx-auto max-w-md">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-900 mb-2">All Waivers Complete!</h3>
                    <p className="text-slate-700 mb-2">All athletes with active bookings have signed waivers.</p>
                    <p className="text-sm text-slate-500">
                      Status automatically updates when new athletes need waivers.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <Card className="rounded-xl border-0 bg-gradient-to-br from-white via-slate-50/30 to-blue-50/30 shadow-lg">
            <CardHeader className="border-b border-slate-100/50 bg-gradient-to-r from-slate-50/50 to-blue-50/50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 flex items-center">
                    <FileText className="h-6 w-6 text-slate-600 mr-2" />
                    Archived Waivers
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Legal records retained for compliance purposes</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                  <div className="text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-full font-bold">
                    {archivedWaivers.length} Archived
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {waiversLoading ? (
                <div className="text-center py-12">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-64 mx-auto"></div>
                    <div className="h-4 bg-slate-200 rounded w-48 mx-auto"></div>
                    <div className="h-4 bg-slate-200 rounded w-56 mx-auto"></div>
                  </div>
                </div>
              ) : archivedWaivers.length > 0 ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <FileText className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-1">Legal Records Notice</h4>
                        <p className="text-sm text-amber-800">
                          These waivers are retained for legal compliance even after parent/athlete accounts have been deleted. Retention period: 7 years from signing date.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                        <TableRow className="border-b border-slate-200">
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Athlete</TableHead>
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Signer</TableHead>
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Relationship</TableHead>
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Signed Date</TableHead>
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Archived Date</TableHead>
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Archive Reason</TableHead>
                          <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-100">
                        {archivedWaivers.map((waiver, index) => (
                          <TableRow 
                            key={waiver.id} 
                            className={`hover:bg-gradient-to-r hover:from-slate-50/30 hover:to-blue-50/30 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                            }`}
                          >
                            <TableCell className="px-6 py-4 font-semibold text-slate-900">{waiver.athleteName}</TableCell>
                            <TableCell className="px-6 py-4 text-slate-700">{waiver.signerName}</TableCell>
                            <TableCell className="px-6 py-4 text-slate-600">{waiver.relationshipToAthlete}</TableCell>
                            <TableCell className="px-6 py-4 text-slate-600 font-medium">{formatDate(waiver.signedAt.split('T')[0])}</TableCell>
                            <TableCell className="px-6 py-4 text-slate-600 font-medium">
                              {(waiver as any).archivedAt ? formatDate((waiver as any).archivedAt.split('T')[0]) : 'N/A'}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <span className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-2.5 py-1 rounded-full text-xs font-semibold border border-orange-200">
                                {(waiver as any).archiveReason || 'Account deleted'}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedWaiver(waiver)}
                                      className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
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
                                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/60 rounded-lg p-3">
                                          <div className="flex items-center space-x-2">
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                            <div>
                                              <p className="text-sm text-red-800 font-semibold">
                                                ⚠️ Archived Record: This waiver is retained for legal compliance. Original parent/athlete accounts have been deleted.
                                              </p>
                                            </div>
                                          </div>
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
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50 font-medium disabled:opacity-50"
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
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 mx-auto max-w-md">
                    <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Archived Waivers</h3>
                    <p className="text-slate-700 mb-2">
                      Waivers will appear here when associated parent or athlete accounts are deleted.
                    </p>
                    <p className="text-sm text-slate-500">
                      These records are retained for legal compliance (7 years from signing date).
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}