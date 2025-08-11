import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminTabButtonsRow } from '@/components/admin-ui/AdminTabButtons';
import { AdminContentTabs } from '@/components/admin-ui/AdminContentTabs';
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from '@/components/admin-ui/AdminCard';
import { AdminSiteContentManager } from '@/components/admin-site-content-manager';
import { MainContentContainer } from '@/components/admin-ui/MainContentContainer';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertCircle, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Calendar, 
  FileText,
  Monitor,
  Database
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AdminSettingsTabProps {
  // Developer Settings props
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: (open: boolean) => void;
  clearDataMutation: any;
  handleClearTestData: () => void;
  handleGenerateTestBookings: () => void;
  generateBookingsMutation: any;
}

export default function AdminSettingsTab({
  isDeleteConfirmOpen,
  setIsDeleteConfirmOpen,
  clearDataMutation,
  handleClearTestData,
  handleGenerateTestBookings,
  generateBookingsMutation
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
              <p className="text-gray-600 dark:text-slate-300">General application settings will be implemented here.</p>
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="site-content" className="space-y-6">
          <AdminSiteContentManager />
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
