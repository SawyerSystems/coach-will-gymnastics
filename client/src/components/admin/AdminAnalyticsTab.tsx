import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminAnalyticsMetrics, type MetricCard } from '@/components/admin-ui/AdminAnalyticsMetrics';
import { Calendar } from 'lucide-react';
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
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Key Metrics */}
      <AdminAnalyticsMetrics metrics={analyticsHeaderMetrics} columns={{ base: 2, sm: 3, lg: 4 }} />
      
      {/* Booking Method Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-xl border border-slate-200/60 bg-white/70 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#0F0276] dark:text-white">Online Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#0F0276] dark:text-white">
              {allBookings.length > 0
                ? Math.round((allBookings.filter(b => (b as any).bookingMethod === 'Website').length / allBookings.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-slate-600 dark:text-white/80 font-medium mt-1">Booked on website</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200/60 bg-white/70 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#0F0276] dark:text-white">Admin Booked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#0F0276] dark:text-white">
              {allBookings.length > 0
                ? Math.round((allBookings.filter(b => (b as any).bookingMethod === 'Admin').length / allBookings.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-slate-600 dark:text-white/80 font-medium mt-1">Created by admin</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range + Filters */}
      <Card className="rounded-xl border border-slate-200/60 bg-white/70 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md shadow-lg dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/90">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-[#0F0276] dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#D8BD2A]" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
