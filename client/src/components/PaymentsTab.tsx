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
const getLessonPrice = (booking: any): number => {
  if (booking.lessonType && typeof booking.lessonType === 'object') {
    if ('total_price' in booking.lessonType && booking.lessonType.total_price != null) {
      return typeof booking.lessonType.total_price === 'number'
        ? booking.lessonType.total_price
        : parseFloat(booking.lessonType.total_price);
    }
    if ('price' in booking.lessonType && booking.lessonType.price != null) {
      return typeof booking.lessonType.price === 'number'
        ? booking.lessonType.price
        : parseFloat(booking.lessonType.price);
    }
  }
  // Fallback for legacy/edge cases only
  if (booking.amount && !isNaN(parseFloat(booking.amount))) return parseFloat(booking.amount);
  return 0;
};

export function PaymentsTab() {
  const { toast } = useToast();
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
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Payment status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: () => {
      toast({ 
        title: "Error updating payment status", 
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totals.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Reservation Paid + Session Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${totals.pendingReservations.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{bookings.filter(b => b.paymentStatus === "reservation-pending").length} bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <X className="h-4 w-4" />
              Refunded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              ${totals.refunded.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{bookings.filter(b => b.paymentStatus === "reservation-refunded" || b.paymentStatus === "session-refunded").length} refunds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Booking Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${totals.avgBookingValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <h2 className="text-2xl font-bold">Payment Management</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => syncStripeMutation.mutate()}
              disabled={syncStripeMutation.isPending}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStripeMutation.isPending ? 'animate-spin' : ''}`} />
              Sync with Stripe
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Stripe Dashboard
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Booking Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
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
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger id="payment-status">
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

        {/* Tabs for different views */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">All Transactions</TabsTrigger>
                <TabsTrigger value="pending">Pending Payments</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>            {/* All Transactions Tab */}
            <TabsContent value="overview">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Booking Details</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Balance Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
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
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {formatDate(booking.preferredDate || '')}
                            </p>
                            <p className="text-xs text-muted-foreground">{booking.preferredTime}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {typeof booking.lessonType === 'object' && booking.lessonType !== null
                                ? getNameOrDescription(booking.lessonType)
                                : booking.lessonType}
                            </p>
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
                        <TableCell>${totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600">${displayPaidAmount.toFixed(2)}</TableCell>
                        <TableCell className={balanceDue > 0 ? "text-orange-600 font-medium" : ""}>
                          ${balanceDue.toFixed(2)}
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{typeof booking.status === 'object' && booking.status !== null ? JSON.stringify(booking.status) : booking.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={booking.paymentStatus || "unpaid"}
                            onValueChange={(value) => 
                              updatePaymentStatusMutation.mutate({ 
                                id: booking.id, 
                                paymentStatus: value 
                              })
                            }
                          >
                            <SelectTrigger className="h-8 w-[140px]">
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
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://dashboard.stripe.com/payments?query=${booking.parentEmail}`, '_blank')}
                          >
                            View Stripe
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Pending Payments Tab */}
            <TabsContent value="pending">
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2">Pending Session Payments</h4>
                  <p className="text-sm text-orange-800">
                    These bookings have paid the reservation fee but still owe the remaining balance at the time of the lesson.
                  </p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session Date</TableHead>
                      <TableHead>Athlete(s)</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Lesson Type</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Reservation Paid</TableHead>
                      <TableHead>Balance Due</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {formatDate(payment.preferredDate || '')}
                            </p>
                            <p className="text-sm text-muted-foreground">{payment.preferredTime}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {payment.athlete1Name}
                            {payment.athlete2Name && ` & ${payment.athlete2Name}`}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{payment.parentFirstName} {payment.parentLastName}</p>
                            <p className="text-xs text-muted-foreground">{payment.parentPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {typeof payment.lessonType === 'object' && payment.lessonType !== null
                              ? getNameOrDescription(payment.lessonType)
                              : payment.lessonType}
                          </Badge>
                        </TableCell>
                        <TableCell>${payment.totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600">
                          ${payment.paidAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-orange-600 font-medium">
                          ${payment.remainingBalance.toFixed(2)}
                        </TableCell>
                        <TableCell>
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
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No pending session payments
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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