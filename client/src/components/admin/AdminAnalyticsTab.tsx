import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminAnalyticsMetrics, type MetricCard } from '@/components/admin-ui/AdminAnalyticsMetrics';
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from '@/components/admin-ui/AdminCard';
import { Calendar, Monitor, User } from 'lucide-react';
import type { Booking } from '@shared/schema';

interface AnalyticsTabProps {
  analyticsHeaderMetrics: MetricCard[];
  allBookings: Booking[];
  lessonTypes: any[];
  analyticsDateRange: { start: string; end: string };
  setAnalyticsDateRange: (range: { start: string; end: string } | ((prev: { start: string; end: string }) => { start: string; end: string })) => void;
  analyticsLessonType: string;
  setAnalyticsLessonType: (type: string) => void;
}

export default function AdminAnalyticsTab({
  analyticsHeaderMetrics,
  allBookings,
  lessonTypes,
  analyticsDateRange,
  setAnalyticsDateRange,
  analyticsLessonType,
  setAnalyticsLessonType
}: AnalyticsTabProps) {
  // Booking method metrics
  const bookingMethodMetrics: MetricCard[] = useMemo(() => {
    const onlineBookingsCount = allBookings.filter(b => (b as any).bookingMethod === 'Website').length;
    const adminBookingsCount = allBookings.filter(b => (b as any).bookingMethod === 'Admin').length;
    const totalBookings = allBookings.length;

    const onlinePercentage = totalBookings > 0 ? Math.round((onlineBookingsCount / totalBookings) * 100) : 0;
    const adminPercentage = totalBookings > 0 ? Math.round((adminBookingsCount / totalBookings) * 100) : 0;

    return [
      {
        key: 'online-bookings',
        label: 'Online Bookings',
        value: `${onlinePercentage}%`,
        hint: 'Booked on website',
        icon: <Monitor className="h-4 w-4" />,
        color: 'blue'
      },
      {
        key: 'admin-bookings',
        label: 'Admin Booked',
        value: `${adminPercentage}%`,
        hint: 'Created by admin',
        icon: <User className="h-4 w-4" />,
        color: 'indigo'
      }
    ];
  }, [allBookings]);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Key Metrics */}
      <AdminAnalyticsMetrics metrics={analyticsHeaderMetrics} columns={{ base: 2, sm: 3, lg: 4 }} />
      
      {/* Booking Method Analytics */}
      <AdminAnalyticsMetrics 
        metrics={bookingMethodMetrics} 
        columns={{ base: 1, sm: 2, lg: 2 }}
        className="mb-6"
      />

      {/* Date Range + Filters */}
      <AdminCard className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-md">
        <AdminCardHeader className="pb-4">
          <AdminCardTitle className="text-[#0F0276] dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#D8BD2A]" />
            Filters
          </AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-white">Start Date</Label>
              <Input
                type="date"
                value={analyticsDateRange.start}
                onChange={(e) => setAnalyticsDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="rounded-lg border-0 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-[#0F0276] dark:focus:ring-[#D8BD2A] transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-white">End Date</Label>
              <Input
                type="date"
                value={analyticsDateRange.end}
                onChange={(e) => setAnalyticsDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="rounded-lg border-0 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-[#0F0276] dark:focus:ring-[#D8BD2A] transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-white">Lesson Type</Label>
              <Select value={analyticsLessonType} onValueChange={setAnalyticsLessonType}>
                <SelectTrigger className="rounded-lg border-0 bg-slate-50 dark:bg-slate-800 dark:text-white">
                  <SelectValue placeholder="All lesson types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lesson Types</SelectItem>
                  {(lessonTypes || []).map((lt: any) => (
                    <SelectItem key={lt.id} value={lt.name}>{lt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full bg-white dark:bg-[#0F0276] border-0 dark:border-[#2A4A9B] shadow-md hover:shadow-lg transition-all duration-200 rounded-lg dark:text-white"
                onClick={() => {
                  setAnalyticsDateRange({ start: '', end: '' });
                  setAnalyticsLessonType('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
