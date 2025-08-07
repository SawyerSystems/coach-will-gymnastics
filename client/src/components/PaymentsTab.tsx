// Helper to safely extract name/description from unknown object
function getNameOrDescription(obj: unknown): string {
  if (obj && typeof obj === 'object') {
    if ('name' in obj && typeof (obj as any).name === 'string') return (obj as any).name;
    if ('description' in obj && typeof (obj as any).description === 'string') return (obj as any).description;
    return JSON.stringify(obj);
  }
  return String(obj);
}
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/dateUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Booking } from "@shared/schema";
import { useLessonTypes } from "@/hooks/useLessonTypes";
import { PaymentStatusEnum } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Clock, DollarSign, ExternalLink, RefreshCw, TrendingUp, X } from "lucide-react";
import { useState } from "react";

// Extended payment status types
export type ExtendedPaymentStatus = 
  | "reservation-pending"
  | "reservation-failed" 
  | "reservation-paid"
  | "session-paid"
  | "reservation-refunded"
  | "session-refunded";

// Helper function for extended payment status badge styling
export const getExtendedPaymentStatusBadgeProps = (status: string): { variant: "default" | "secondary" | "destructive" | "outline"; className?: string } => {
  switch (status) {
    case "reservation-pending":
      return { variant: "secondary", className: "bg-yellow-100 text-yellow-800" };
    case "reservation-failed":
      return { variant: "destructive", className: "bg-red-100 text-red-800" };
    case "reservation-paid":
      return { variant: "default", className: "bg-green-100 text-green-800" };
    case "session-paid":
      return { variant: "default", className: "bg-green-500 text-white" };
    case "reservation-refunded":
      return { variant: "outline", className: "bg-gray-100 text-gray-700" };
    case "session-refunded":
      return { variant: "outline", className: "bg-gray-200 text-gray-800" };
    default:
      return { variant: "secondary" };
  }
};


// Always get lesson price from booking.lessonType.price (from Supabase). Only fallback to booking.amount if price is missing (legacy/edge case).
// Always get lesson price from booking.lessonType.total_price (from Supabase). Only fallback to price, then booking.amount if missing (legacy/edge case).
// Pricing resolution using lesson_types query
const makePriceResolver = (byKey: (key: string) => any) => (booking: any): number => {
  const lt = byKey(booking.lessonType || '');
  if (lt && typeof lt.price === 'number') return lt.price;
  if (lt && lt.price) return parseFloat(lt.price);
  if (booking.amount && !isNaN(parseFloat(booking.amount))) return parseFloat(booking.amount); // legacy fallback
  return 0;
};

export function PaymentsTab() {
  const { toast } = useToast();
  const { byKey } = useLessonTypes();
  const getLessonPrice = makePriceResolver(byKey);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch all bookings
  const { data: bookings = [], isLoading, refetch } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Enhanced payment analytics
  // Dynamic metrics based on payment status
  const totals = {
    // Pending Reservations: reservation-pending only
    pendingReservations: bookings.filter(b => b.paymentStatus === "reservation-pending").reduce((sum, b) => sum + getLessonPrice(b), 0),
    // Total Revenue: reservation-paid and session-paid only
    totalRevenue: bookings.filter(b => b.paymentStatus === "reservation-paid" || b.paymentStatus === "session-paid").reduce((sum, b) => {
      // If session-paid, use full lesson price; if reservation-paid, use reservation amount
      if (b.paymentStatus === "session-paid") {
        return sum + getLessonPrice(b);
      } else {
        return sum + parseFloat(b.paidAmount || "0");
      }
    }, 0),
    refunded: bookings.filter(b => b.paymentStatus === "reservation-refunded" || b.paymentStatus === "session-refunded").reduce((sum, b) => sum + parseFloat(b.paidAmount || "0"), 0),
    avgBookingValue: bookings.length > 0 ? (bookings.reduce((sum, b) => sum + getLessonPrice(b), 0) / bookings.length) : 0,
  };

  // Helper to extract lesson type string
  const extractLessonTypeString = (lessonType: unknown): string => {
    if (typeof lessonType === 'string') return lessonType;
    if (lessonType && typeof lessonType === 'object') {
      if ('name' in lessonType && typeof (lessonType as any).name === 'string') return (lessonType as any).name;
      if ('description' in lessonType && typeof (lessonType as any).description === 'string') return (lessonType as any).description;
      return JSON.stringify(lessonType);
    }
    return '';
  };

  // Calculate pending payments (remaining balance after reservation fee)
  const pendingPayments = bookings
    .filter(b => 
      b.paymentStatus === "reservation-paid" && // Only show bookings with reservation paid but not fully paid
      b.status !== "cancelled" && 
      b.attendanceStatus !== "completed" // Automatically exclude completed bookings
    )
    .map(booking => {
      const totalPrice = getLessonPrice(booking);
      const paidAmount = parseFloat(booking.paidAmount || "0");
      const remainingBalance = totalPrice - paidAmount;
      return {
        ...booking,
        totalPrice,
        paidAmount,
        remainingBalance,
      };
    })
    .filter(b => b.remainingBalance > 0);

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      (booking.athlete1Name && booking.athlete1Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.parentEmail && booking.parentEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.parentFirstName && booking.parentFirstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.parentLastName && booking.parentLastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = !dateFilter || booking.preferredDate === dateFilter;
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === "all" || booking.paymentStatus === paymentStatusFilter;
    
    return matchesSearch && matchesDate && matchesStatus && matchesPaymentStatus;
  });

  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: number; paymentStatus: string }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${id}/payment-status`, { paymentStatus });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to update payment status");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Payment status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error updating payment status", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Sync with Stripe mutation
  const syncStripeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/stripe/sync-payments", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Smart Stripe sync completed", 
        description: `${data.updated || 0} bookings synced, ${data.skipped || 0} preserved (completed/in-progress)` 
      });
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Error syncing with Stripe", 
        variant: "destructive" 
      });
    },
  });

  return (
    <>
      {/* Enhanced Payment Analytics Summary Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8 w-full mx-auto">
        <Card className="rounded-xl border-0 bg-gradient-to-br from-blue-50 via-blue-25 to-blue-50/30 shadow-md hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-blue-800">Total Revenue</CardTitle>
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-900">
              ${totals.totalRevenue.toFixed(2)}
            </div>
            <p className="text-[10px] sm:text-xs text-blue-600 mt-1 font-medium">Reservation Paid + Session Paid</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 bg-gradient-to-br from-yellow-50 via-yellow-25 to-yellow-50/30 shadow-md hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-yellow-800">Pending Reservations</CardTitle>
            <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-yellow-900">
              ${totals.pendingReservations.toFixed(2)}
            </div>
            <p className="text-[10px] sm:text-xs text-yellow-600 mt-1 font-medium">{bookings.filter(b => b.paymentStatus === "reservation-pending").length} bookings</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 bg-gradient-to-br from-slate-50 via-slate-25 to-slate-50/30 shadow-md hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-800">Refunded</CardTitle>
            <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg">
              <X className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">
              ${totals.refunded.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">{bookings.filter(b => b.paymentStatus === "reservation-refunded" || b.paymentStatus === "session-refunded").length} refunds</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 bg-gradient-to-br from-purple-50 via-purple-25 to-purple-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-800">Avg Booking Value</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-purple-900">
              ${totals.avgBookingValue.toFixed(2)}
            </div>
            <p className="text-xs text-purple-600 mt-1 font-medium">Per booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">Payment Management</h2>
            <p className="text-sm text-slate-600">Monitor transactions, sync with Stripe, and manage payment statuses</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => syncStripeMutation.mutate()}
              disabled={syncStripeMutation.isPending}
              className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStripeMutation.isPending ? 'animate-spin' : ''}`} />
              Sync with Stripe
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
              className="w-full sm:w-auto border-green-200 text-green-700 hover:bg-green-50 font-medium"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Stripe Dashboard
            </Button>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-xl border border-slate-200/50 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Filter & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-semibold text-slate-700">Search</Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div>
              <Label htmlFor="date" className="text-sm font-semibold text-slate-700">Date</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="mt-1 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-sm font-semibold text-slate-700">Booking Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status" className="mt-1 border-slate-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No-Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payment-status" className="text-sm font-semibold text-slate-700">Payment Status</Label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger id="payment-status" className="mt-1 border-slate-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="reservation-pending">Reservation: Pending</SelectItem>
                  <SelectItem value="reservation-paid">Reservation: Paid</SelectItem>
                  <SelectItem value="reservation-failed">Reservation: Failed</SelectItem>
                  <SelectItem value="session-paid">Session Paid</SelectItem>
                  <SelectItem value="reservation-refunded">Reservation: Refunded</SelectItem>
                  <SelectItem value="session-refunded">Session: Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs for different views */}
        <Card className="rounded-xl border-0 bg-gradient-to-br from-white via-slate-50/30 to-blue-50/30 shadow-lg">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                <TabsList className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl shadow-sm w-full sm:w-auto overflow-x-auto">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md sm:rounded-lg px-2 sm:px-4 py-1 sm:py-2 font-semibold text-xs sm:text-sm transition-all duration-200"
                  >
                    All Transactions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2 font-semibold text-sm transition-all duration-200"
                  >
                    Pending Payments
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2 font-semibold text-sm transition-all duration-200"
                  >
                    Completed
                  </TabsTrigger>
                </TabsList>
              </div>
            <TabsContent value="overview">
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <TableRow className="border-b border-slate-200">
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Date</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Booking Details</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Parent</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Total Amount</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Paid Amount</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Balance Due</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Status</TableHead>
                      <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {filteredBookings.map((booking, index) => {
                      const totalPrice = getLessonPrice(booking);
                      let displayPaidAmount = 0;
                      let balanceDue = totalPrice;

                      if (booking.paymentStatus === "session-paid") {
                        displayPaidAmount = totalPrice;
                        balanceDue = 0;
                      } else if (booking.paymentStatus === "reservation-paid") {
                        // Use paidAmount if present and > 0, otherwise default to $0.50
                        displayPaidAmount = parseFloat(booking.paidAmount || "0");
                        if (displayPaidAmount <= 0) displayPaidAmount = 0.50;
                        balanceDue = totalPrice - displayPaidAmount;
                      } else if (booking.paymentStatus === "reservation-pending" || booking.paymentStatus === "reservation-failed" || booking.paymentStatus === "unpaid") {
                        displayPaidAmount = 0;
                        balanceDue = totalPrice;
                      } else if (booking.paymentStatus === "reservation-refunded" || booking.paymentStatus === "session-refunded") {
                        displayPaidAmount = 0;
                        balanceDue = 0;
                      }

                      // Never show negative balance due
                      if (balanceDue < 0) balanceDue = 0;

                      return (
                        <TableRow 
                          key={booking.id}
                          className={`hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                          }`}
                        >
                          <TableCell className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-900">
                                {formatDate(booking.preferredDate || '')}
                              </p>
                            <p className="text-xs text-muted-foreground">{booking.preferredTime}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">
                              {typeof booking.lessonType === 'object' && booking.lessonType !== null
                                ? getNameOrDescription(booking.lessonType)
                                : booking.lessonType}
                            </p>
                            <p className="text-sm text-slate-600">
                              {booking.athlete1Name}
                              {booking.athlete2Name && ` & ${booking.athlete2Name}`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-900">{booking.parentFirstName} {booking.parentLastName}</p>
                            <p className="text-xs text-slate-600">{booking.parentEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-900 font-semibold">${totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="px-6 py-4 text-green-700 font-semibold">${displayPaidAmount.toFixed(2)}</TableCell>
                        <TableCell className={`px-6 py-4 font-semibold ${balanceDue > 0 ? "text-orange-600" : "text-slate-600"}`}>
                          ${balanceDue.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant="outline" className="font-medium">
                            {typeof booking.status === 'object' && booking.status !== null ? JSON.stringify(booking.status) : booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Select
                            value={booking.paymentStatus || "unpaid"}
                            onValueChange={(value) => 
                              updatePaymentStatusMutation.mutate({ 
                                id: booking.id, 
                                paymentStatus: value 
                              })
                            }
                          >
                            <SelectTrigger className="h-8 w-[160px] border-slate-200 focus:border-blue-400">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">Unpaid</SelectItem>
                              <SelectItem value="reservation-pending">Reservation: Pending</SelectItem>
                              <SelectItem value="reservation-failed">Reservation: Failed</SelectItem>
                              <SelectItem value="reservation-paid">Reservation: Paid</SelectItem>
                              <SelectItem value="session-paid">Session Paid</SelectItem>
                              <SelectItem value="reservation-refunded">Reservation: Refunded</SelectItem>
                              <SelectItem value="session-refunded">Session: Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://dashboard.stripe.com/payments?query=${booking.parentEmail}`, '_blank')}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
                          >
                            View Stripe
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Pending Payments Tab */}
            <TabsContent value="pending">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-1">Pending Session Payments</h4>
                      <p className="text-sm text-orange-800">
                        These bookings have paid the reservation fee but still owe the remaining balance at the time of the lesson.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-orange-100">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <TableRow className="border-b border-slate-200">
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Session Date</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Athlete(s)</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Parent</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Lesson Type</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Total Price</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Reservation Paid</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Balance Due</TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                    {pendingPayments.map((payment, index) => (
                      <TableRow 
                        key={payment.id}
                        className={`hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-amber-50/30 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                      >
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">
                              {formatDate(payment.preferredDate || '')}
                            </p>
                            <p className="text-sm text-slate-600">{payment.preferredTime}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">
                            {payment.athlete1Name}
                            {payment.athlete2Name && ` & ${payment.athlete2Name}`}
                          </p>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-900">{payment.parentFirstName} {payment.parentLastName}</p>
                            <p className="text-xs text-slate-600">{payment.parentPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant="outline" className="font-medium">
                            {typeof payment.lessonType === 'object' && payment.lessonType !== null
                              ? getNameOrDescription(payment.lessonType)
                              : payment.lessonType}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-slate-900 font-semibold">${payment.totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="px-6 py-4 text-green-700 font-semibold">
                          ${payment.paidAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-orange-600 font-bold">
                          ${payment.remainingBalance.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              const currentStatus = payment.paymentStatus;
                              let newStatus = PaymentStatusEnum.SESSION_PAID;
                              
                              // Dynamic button behavior based on current payment status
                              if (currentStatus === "reservation-failed" || currentStatus === "reservation-pending") {
                                newStatus = PaymentStatusEnum.RESERVATION_PAID;
                              } else if (currentStatus === "reservation-paid") {
                                newStatus = PaymentStatusEnum.SESSION_PAID;
                              }
                              
                              updatePaymentStatusMutation.mutate({ 
                                id: payment.id, 
                                paymentStatus: newStatus 
                              });
                            }}
                            disabled={updatePaymentStatusMutation.isPending}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {payment.paymentStatus === "reservation-failed" || payment.paymentStatus === "reservation-pending" 
                              ? "Mark Reservation Paid" 
                              : "Mark Session Paid"
                            }
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pendingPayments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-slate-500 py-12">
                          <div className="flex flex-col items-center space-y-2">
                            <Check className="h-12 w-12 text-green-500" />
                            <p className="font-medium">No pending session payments</p>
                            <p className="text-sm">All payments are up to date!</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>
            </TabsContent>

            {/* Completed Tab */}
            <TabsContent value="completed">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Completion Date</TableHead>
                    <TableHead>Lesson Details</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings
                    .filter(b => b.attendanceStatus === "completed")
                    .map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          {booking.updatedAt ? formatDate(booking.updatedAt.toString().split('T')[0]) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{booking.lessonType}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.athlete1Name}
                              {booking.athlete2Name && ` & ${booking.athlete2Name}`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{booking.parentFirstName} {booking.parentLastName}</p>
                            <p className="text-xs text-muted-foreground">{booking.parentEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${parseFloat(booking.amount || "0").toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {typeof booking.bookingMethod === 'object' && booking.bookingMethod !== null
                              ? getNameOrDescription(booking.bookingMethod)
                              : booking.bookingMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://dashboard.stripe.com/payments?query=${booking.parentEmail}`, '_blank')}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}