import React, { useState, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AdminTabButtonsRow } from '@/components/admin-ui/AdminTabButtons';
import { AdminContentTabs } from '@/components/admin-ui/AdminContentTabs';
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from '@/components/admin-ui/AdminCard';
import { AdminSiteContentManager } from '@/components/admin-site-content-manager';
import { MainContentContainer } from '@/components/admin-ui/MainContentContainer';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AdminProgressSettings from '@/components/admin/AdminProgressSettings';
import ApparatusAvailabilitySettings from '@/components/admin/ApparatusAvailabilitySettings';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertCircle, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Calendar, 
  FileText,
  Monitor,
  Database,
  Lock,
  CheckCircle
} from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Dialog as UIDialog, DialogFooter as UIDialogFooter } from '@/components/ui/dialog';
import { BookingStatusEnum, PaymentStatusEnum, AttendanceStatusEnum } from '@shared/schema';

interface AdminSettingsTabProps {
  // Developer Settings props
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: (open: boolean) => void;
  clearDataMutation: any;
  handleClearTestData: () => void;
  handleGenerateTestBookings: () => void;
  generateBookingsMutation: any;
  
  // Additional handler functions
  handleCreateTestParent: () => void;
  handleSimulatePaymentSuccess: () => void;
  handleResetPaymentStatus: () => void;
  handleSystemHealthCheck: () => void;
  handleDatabaseTest: () => void;
  
  // Additional mutations
  createParentMutation: any;
  paymentSimulationMutation: any;
  paymentResetMutation: any;
  healthCheckMutation: any;
  databaseTestMutation: any;
  deleteUserAccountsMutation: any;
  
  // Additional state handlers
  setIsDeleteUsersConfirmOpen: (open: boolean) => void;
}

export default function AdminSettingsTab({
  isDeleteConfirmOpen,
  setIsDeleteConfirmOpen,
  clearDataMutation,
  handleClearTestData,
  handleGenerateTestBookings,
  generateBookingsMutation,
  handleCreateTestParent,
  handleSimulatePaymentSuccess,
  handleResetPaymentStatus,
  handleSystemHealthCheck,
  handleDatabaseTest,
  createParentMutation,
  paymentSimulationMutation,
  paymentResetMutation,
  healthCheckMutation,
  databaseTestMutation,
  deleteUserAccountsMutation,
  setIsDeleteUsersConfirmOpen
}: AdminSettingsTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <AdminContentTabs
        defaultValue="developer"
        items={[
          {
            value: 'developer',
            label: 'Developer',
            icon: <Monitor className="h-4 w-4" />,
            activeGradient: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D8BD2A] data-[state=active]:to-[#D8BD2A]/80 data-[state=active]:text-[#0F0276]",
          },
          {
            value: 'general',
            label: 'General',
            icon: <AlertCircle className="h-4 w-4" />,
            activeGradient: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D8BD2A] data-[state=active]:to-[#D8BD2A]/80 data-[state=active]:text-[#0F0276]",
          },
          {
            value: 'site-content',
            label: 'Site Content',
            icon: <FileText className="h-4 w-4" />,
            activeGradient: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D8BD2A] data-[state=active]:to-[#D8BD2A]/80 data-[state=active]:text-[#0F0276]",
          },
          {
            value: 'progress',
            label: 'Progress',
            icon: <Database className="h-4 w-4" />,
            activeGradient: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D8BD2A] data-[state=active]:to-[#D8BD2A]/80 data-[state=active]:text-[#0F0276]",
          },
          {
            value: 'backup',
            label: 'Backup',
            icon: <Database className="h-4 w-4" />,
            activeGradient: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D8BD2A] data-[state=active]:to-[#D8BD2A]/80 data-[state=active]:text-[#0F0276]",
          },
        ]}
        listClassName="bg-slate-100 text-[#0F0276] dark:bg-[#D8BD2A]/10 dark:text-white border-slate-200 dark:border-[#D8BD2A]/20 mb-4"
        triggerClassName="gap-2"
      >
        <TabsContent value="developer" className="space-y-6">
          <AdminCard className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-md">
            <AdminCardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-bold text-yellow-800 dark:text-white">Developer Tools</h3>
              </div>
              <p className="text-sm text-yellow-700 dark:text-slate-300 leading-relaxed">
                These tools are for testing and development purposes only. Use with caution as they can alter or delete data.
              </p>
            </AdminCardContent>
          </AdminCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Management */}
            <AdminCard className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300">
              <AdminCardHeader className="pb-4">
                <AdminCardTitle className="text-red-800 dark:text-white flex items-center gap-3">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  Data Management
                </AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Clear Test Data</Label>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Remove all test bookings, athletes, and parent records. Use with extreme caution.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    disabled={clearDataMutation.isPending}
                  >
                    {clearDataMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Clear All Data
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>User Account Management</Label>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Delete all user accounts for testing purposes. Use with extreme caution.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteUsersConfirmOpen(true)}
                    disabled={deleteUserAccountsMutation.isPending}
                  >
                    {deleteUserAccountsMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete User Accounts
                  </Button>
                </div>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Confirm Data Deletion
                      </DialogTitle>
                      <DialogDescription className="space-y-2">
                        <span>This action will permanently delete ALL:</span>
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
              </AdminCardContent>
            </AdminCard>

            {/* Test Data Generation */}
            <AdminCard className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300">
              <AdminCardHeader className="pb-4">
                <AdminCardTitle className="text-blue-800 dark:text-white flex items-center gap-3">
                  <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Test Data Generation
                </AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Generate Sample Bookings</Label>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Create realistic sample bookings for testing purposes.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateTestBookings}
                    disabled={generateBookingsMutation.isPending}
                    className="w-full"
                  >
                    {generateBookingsMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Generate Test Bookings
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Create Test Parent</Label>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Create a test parent account for testing purposes.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateTestParent}
                    disabled={createParentMutation.isPending}
                    className="w-full"
                  >
                    {createParentMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Create Test Parent
                  </Button>
                </div>
              </AdminCardContent>
            </AdminCard>

            {/* Payment Testing */}
            <AdminCard className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300">
              <AdminCardHeader className="pb-4">
                <AdminCardTitle className="text-green-800 dark:text-white flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                  Payment Testing
                </AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Simulate Payment Success</Label>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Test the payment success flow for incomplete bookings.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSimulatePaymentSuccess}
                    disabled={paymentSimulationMutation.isPending}
                    className="w-full"
                  >
                    {paymentSimulationMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    Simulate Payment Success
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Reset Payment Status</Label>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Reset all bookings to pending payment status.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetPaymentStatus}
                    disabled={paymentResetMutation.isPending}
                    className="w-full"
                  >
                    {paymentResetMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Reset Payment Status
                  </Button>
                </div>
              </AdminCardContent>
            </AdminCard>

            {/* System Status */}
            <AdminCard className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300">
              <AdminCardHeader className="pb-4">
                <AdminCardTitle className="text-purple-800 dark:text-white flex items-center gap-3">
                  <Monitor className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  System Status
                </AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>System Health Check</Label>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Check the health of all system components.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSystemHealthCheck}
                    disabled={healthCheckMutation.isPending}
                    className="w-full"
                  >
                    {healthCheckMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Monitor className="h-4 w-4 mr-2" />
                    )}
                    Run Health Check
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Database Test</Label>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Test database connectivity and operations.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDatabaseTest}
                    disabled={databaseTestMutation.isPending}
                    className="w-full"
                  >
                    {databaseTestMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Database className="h-4 w-4 mr-2" />
                    )}
                    Test Database
                  </Button>
                </div>
              </AdminCardContent>
            </AdminCard>
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <AdminCard className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-md">
            <AdminCardHeader className="pb-4">
              <AdminCardTitle className="text-[#0F0276] dark:text-white flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-[#D8BD2A]" />
                General Settings
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent className="p-6">
              <p className="text-gray-600 dark:text-slate-300 mb-4">Configure platform-wide preferences.</p>
              {/* Booking controls configuration */}
              <BookingControlsCollapsible />
              {/* Retro Lesson Creation removed; now available in Booking Management tab */}
              {/* Apparatus availability configuration */}
              <ApparatusCollapsible />
              {/* Notifications configuration */}
              <NotificationsCollapsible />
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="site-content" className="space-y-6">
          <AdminSiteContentManager />
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-6">
          <AdminProgressSettings />
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-6">
          <AdminCard className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-md">
            <AdminCardHeader className="pb-4">
              <AdminCardTitle className="text-[#0F0276] dark:text-white flex items-center gap-3">
                <RefreshCw className="h-6 w-6 text-[#D8BD2A]" />
                Backup & Restore
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent className="p-6">
              <p className="text-gray-600 dark:text-slate-300">Data backup and restore functionality will be implemented here.</p>
            </AdminCardContent>
          </AdminCard>
        </TabsContent>
      </AdminContentTabs>
    </div>
  );
}

// Render NotificationSettings component via React.lazy
const LazyNotificationSettings = lazy(() => import('./NotificationSettings'));

function NotificationsSettingsSlot() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-600">Loading notifications…</div>}>
      <LazyNotificationSettings />
    </Suspense>
  );
}

// Collapsible wrapper for Notifications to save space (collapsed by default)
function NotificationsCollapsible() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8 border rounded-lg bg-white/40 dark:bg-white/5">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="notifications-section"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-5 w-5 text-[#0F0276] dark:text-slate-200" />
          ) : (
            <ChevronRight className="h-5 w-5 text-[#0F0276] dark:text-slate-200" />
          )}
          <span className="font-medium text-[#0F0276] dark:text-white">Notifications</span>
        </div>
        <span className="text-xs text-gray-500">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div id="notifications-section" className="px-4 pb-4">
          <NotificationsSettingsSlot />
        </div>
      )}
    </div>
  );
}

// Collapsible wrapper for Booking Controls (collapsed by default)
function BookingControlsCollapsible() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch current booking settings
  const { data: settings = [], refetch, isLoading } = useQuery<Array<{ key: string; value: string; description: string }>>({
    queryKey: ['/api/site-settings'],
  });
  
  const bookingsPausedSetting = settings.find(s => s.key === 'bookings_paused');
  const pausedMessageSetting = settings.find(s => s.key === 'bookings_paused_message');
  const pauseStartSetting = settings.find(s => s.key === 'bookings_pause_start');
  const pauseEndSetting = settings.find(s => s.key === 'bookings_pause_end');
  
  const [pauseMode, setPauseMode] = useState<'active' | 'inactive'>('inactive');
  const [startMode, setStartMode] = useState<'immediate' | 'scheduled'>('immediate');
  const [endMode, setEndMode] = useState<'indefinite' | 'scheduled'>('indefinite');
  const [pausedMessage, setPausedMessage] = useState('');
  const [pauseStart, setPauseStart] = useState('');
  const [pauseEnd, setPauseEnd] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Update local state when data loads
  useEffect(() => {
    if (!isLoading && settings.length > 0) {
      const isPaused = bookingsPausedSetting?.value === 'true';
      setPauseMode(isPaused ? 'active' : 'inactive');
      setPausedMessage(pausedMessageSetting?.value || 'We are not accepting new bookings at this time. Please check back later or contact us directly.');
      
      const startValue = pauseStartSetting?.value || '';
      setPauseStart(startValue);
      setStartMode(startValue ? 'scheduled' : 'immediate');
      
      const endValue = pauseEndSetting?.value || '';
      setPauseEnd(endValue);
      setEndMode(endValue ? 'scheduled' : 'indefinite');
    }
  }, [isLoading, settings, bookingsPausedSetting, pausedMessageSetting, pauseStartSetting, pauseEndSetting]);
  
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/site-settings/${key}`, { value });
      
      // Check if response is OK
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update setting: ${text}`);
      }
      
      // Only parse JSON if we got a successful response
      const data = await response.json();
      return data;
    },
  });
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Determine values based on modes
      const isPaused = pauseMode === 'active';
      const startValue = startMode === 'scheduled' ? pauseStart : '';
      const endValue = endMode === 'scheduled' ? pauseEnd : '';
      
      console.log('Saving settings:', {
        isPaused,
        startValue,
        endValue,
        pausedMessage
      });
      
      // Update all settings one by one with better error handling
      try {
        await updateSettingMutation.mutateAsync({
          key: 'bookings_paused',
          value: isPaused ? 'true' : 'false',
        });
      } catch (error) {
        console.error('Error updating bookings_paused:', error);
        throw error;
      }
      
      try {
        await updateSettingMutation.mutateAsync({
          key: 'bookings_paused_message',
          value: pausedMessage,
        });
      } catch (error) {
        console.error('Error updating bookings_paused_message:', error);
        throw error;
      }
      
      try {
        await updateSettingMutation.mutateAsync({
          key: 'bookings_pause_start',
          value: startValue,
        });
      } catch (error) {
        console.error('Error updating bookings_pause_start:', error);
        throw error;
      }
      
      try {
        await updateSettingMutation.mutateAsync({
          key: 'bookings_pause_end',
          value: endValue,
        });
      } catch (error) {
        console.error('Error updating bookings_pause_end:', error);
        throw error;
      }
      
      console.log('All settings saved successfully, refetching...');
      await refetch();
      
      toast({
        title: 'Settings Saved',
        description: `Bookings are now ${isPaused ? 'paused' : 'active'}.`,
      });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message || 'Failed to update booking settings. Please check the console for details.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="mb-4 border rounded-lg bg-white/40 dark:bg-white/5">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="booking-controls-section"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-5 w-5 text-[#0F0276] dark:text-slate-200" />
          ) : (
            <ChevronRight className="h-5 w-5 text-[#0F0276] dark:text-slate-200" />
          )}
          <Lock className="h-4 w-4 text-[#D8BD2A]" />
          <span className="font-medium text-[#0F0276] dark:text-white">Booking Controls</span>
        </div>
        <span className="text-xs text-gray-500">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div id="booking-controls-section" className="px-4 pb-4 space-y-6">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Control when parents can book lessons online.
          </p>
          
          {/* Step 1: Pause or Active */}
          <div className="space-y-3 p-4 bg-white/60 dark:bg-white/5 rounded-lg border">
            <Label className="text-base font-semibold">Step 1: Booking Status</Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPauseMode('active')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  pauseMode === 'active'
                    ? 'border-[#D8BD2A] bg-[#D8BD2A]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-900 dark:text-red-400">Pause Bookings</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  Disable online booking temporarily
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => setPauseMode('inactive')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  pauseMode === 'inactive'
                    ? 'border-[#D8BD2A] bg-[#D8BD2A]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900 dark:text-green-400">Allow Bookings</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  Parents can book normally
                </p>
              </button>
            </div>
          </div>
          
          {pauseMode === 'active' && (
            <>
              {/* Step 2: When to start */}
              <div className="space-y-3 p-4 bg-white/60 dark:bg-white/5 rounded-lg border">
                <Label className="text-base font-semibold">Step 2: When Should Pause Start?</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStartMode('immediate')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      startMode === 'immediate'
                        ? 'border-[#D8BD2A] bg-[#D8BD2A]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">Immediately</span>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                      Pause as soon as you save
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStartMode('scheduled')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      startMode === 'scheduled'
                        ? 'border-[#D8BD2A] bg-[#D8BD2A]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">Scheduled</span>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                      Set a future start date/time
                    </p>
                  </button>
                </div>
                
                {startMode === 'scheduled' && (
                  <div className="mt-3">
                    <Label htmlFor="pause-start" className="text-sm mb-2 block">
                      Start Date & Time
                    </Label>
                    <Input
                      id="pause-start"
                      type="datetime-local"
                      value={pauseStart}
                      onChange={(e) => setPauseStart(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              
              {/* Step 3: When to end */}
              <div className="space-y-3 p-4 bg-white/60 dark:bg-white/5 rounded-lg border">
                <Label className="text-base font-semibold">Step 3: When Should Bookings Resume?</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setEndMode('indefinite')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      endMode === 'indefinite'
                        ? 'border-[#D8BD2A] bg-[#D8BD2A]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">Indefinite</span>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                      Resume manually when ready
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setEndMode('scheduled')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      endMode === 'scheduled'
                        ? 'border-[#D8BD2A] bg-[#D8BD2A]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">Scheduled</span>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                      Auto-resume at specific time
                    </p>
                  </button>
                </div>
                
                {endMode === 'scheduled' && (
                  <div className="mt-3">
                    <Label htmlFor="pause-end" className="text-sm mb-2 block">
                      End Date & Time
                    </Label>
                    <Input
                      id="pause-end"
                      type="datetime-local"
                      value={pauseEnd}
                      onChange={(e) => setPauseEnd(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              
              {/* Step 4: Message to parents */}
              <div className="space-y-3 p-4 bg-white/60 dark:bg-white/5 rounded-lg border">
                <Label className="text-base font-semibold">Step 4: Message to Parents</Label>
                <Textarea
                  id="paused-message"
                  value={pausedMessage}
                  onChange={(e) => setPausedMessage(e.target.value)}
                  placeholder="Enter the message parents will see when bookings are paused..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  This message will be displayed on the booking page when paused.
                </p>
              </div>
            </>
          )}
          
          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full bg-[#0F0276] hover:bg-[#0F0276]/90"
            size="lg"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                Save Booking Settings
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Collapsible wrapper for Apparatus Availability (collapsed by default)
function ApparatusCollapsible() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 border rounded-lg bg-white/40 dark:bg-white/5">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="apparatus-section"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-5 w-5 text-[#0F0276] dark:text-slate-200" />
          ) : (
            <ChevronRight className="h-5 w-5 text-[#0F0276] dark:text-slate-200" />
          )}
          <span className="font-medium text-[#0F0276] dark:text-white">Apparatus Availability</span>
        </div>
        <span className="text-xs text-gray-500">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div id="apparatus-section" className="px-4 pb-4">
          <ApparatusAvailabilitySettings />
        </div>
      )}
    </div>
  );
}

// Retro lesson creation UI removed (now handled in Booking Management via UnifiedBookingModal)
