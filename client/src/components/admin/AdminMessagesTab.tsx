import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Mail, MessageCircle, Inbox, Trash2 } from "lucide-react";
import { useState } from "react";

export type SiteInquiry = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  athleteInfo?: string;
  message: string;
  status: "new" | "open" | "closed" | "archived";
  source?: string;
  createdAt: string;
};

export default function AdminMessagesTab() {
  const [tab, setTab] = useState("inquiries");
  const qc = useQueryClient();

  const inquiries = useQuery<SiteInquiry[]>({
    queryKey: ["/api/admin/site-inquiries"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/site-inquiries");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: SiteInquiry["status"] }) => {
      const res = await apiRequest("PATCH", `/api/admin/site-inquiries/${id}`, { status });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/site-inquiries"] }),
  });

  const deleteInquiry = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/site-inquiries/${id}`);
      if (!res.ok) throw new Error("Failed to delete inquiry");
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/site-inquiries"] }),
  });

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-slate-100 text-[#0F0276] dark:bg-[#D8BD2A]/10 dark:text-white border-slate-200 dark:border-[#D8BD2A]/20 mb-4">
          <TabsTrigger value="sms" className="gap-2 data-[state=active]:bg-[#D8BD2A] data-[state=active]:text-[#0F0276] dark:data-[state=active]:bg-[#D8BD2A] dark:data-[state=active]:text-[#0F0276]">
            <MessageCircle className="h-4 w-4" /> SMS
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2 data-[state=active]:bg-[#D8BD2A] data-[state=active]:text-[#0F0276] dark:data-[state=active]:bg-[#D8BD2A] dark:data-[state=active]:text-[#0F0276]">
            <Mail className="h-4 w-4" /> Emails
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="gap-2 data-[state=active]:bg-[#D8BD2A] data-[state=active]:text-[#0F0276] dark:data-[state=active]:bg-[#D8BD2A] dark:data-[state=active]:text-[#0F0276]">
            <Inbox className="h-4 w-4" /> Site Inquiries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sms">
          <Card className="rounded-xl border border-slate-200/60 bg-white/70 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md shadow-lg dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/90">
            <CardHeader>
              <CardTitle className="text-[#0F0276] dark:text-white">SMS Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-white/80">SMS integration coming soon. This tab will show inbound/outbound texts.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card className="rounded-xl border border-slate-200/60 bg-white/70 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md shadow-lg dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/90">
            <CardHeader>
              <CardTitle className="text-[#0F0276] dark:text-white">Email Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-white/80">Email logs overview coming soon. We'll surface recent sends and failures.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries">
          <Card className="rounded-xl border border-slate-200/60 bg-white/70 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md shadow-lg dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/90">
            <CardHeader>
              <CardTitle className="text-[#0F0276] dark:text-white">Site Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiries.isLoading ? (
                <div className="flex items-center gap-2 text-slate-600 dark:text-white/80">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading inquiries…
                </div>
              ) : (inquiries.data?.length ? (
                <div className="space-y-3">
                  {inquiries.data.map((inq) => (
                    <Card key={inq.id} className="rounded-xl border border-slate-200/60 bg-white/70 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/90">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium text-[#0F0276] dark:text-white">
                            {inq.name} <span className="text-slate-500 dark:text-white/70">•</span>{" "}
                            <span className="text-slate-600 dark:text-white/80 text-sm">{new Date(inq.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={inq.status === 'new' ? 'default' : inq.status === 'open' ? 'secondary' : 'outline'}>
                              {inq.status}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: inq.id, status: inq.status === 'new' ? 'open' : inq.status === 'open' ? 'closed' : 'archived' })}>
                              Mark {inq.status === 'new' ? 'Open' : inq.status === 'open' ? 'Closed' : 'Archived'}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteInquiry.mutate(inq.id)}>
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-slate-700 dark:text-white/90">
                          <div><span className="text-slate-500 dark:text-white/70">Email:</span> {inq.email}</div>
                          {inq.phone ? <div><span className="text-slate-500 dark:text-white/70">Phone:</span> {inq.phone}</div> : null}
                          {inq.athleteInfo ? <div><span className="text-slate-500 dark:text-white/70">Athlete:</span> {inq.athleteInfo}</div> : null}
                          <div className="mt-2 whitespace-pre-wrap">{inq.message}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-white/80">No inquiries yet. Messages sent via the Contact page will appear here.</p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
