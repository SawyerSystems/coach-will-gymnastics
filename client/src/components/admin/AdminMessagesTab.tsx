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
        <TabsList className="mb-2">
          <TabsTrigger value="sms" className="gap-2"><MessageCircle className="h-4 w-4" /> SMS</TabsTrigger>
          <TabsTrigger value="emails" className="gap-2"><Mail className="h-4 w-4" /> Emails</TabsTrigger>
          <TabsTrigger value="inquiries" className="gap-2"><Inbox className="h-4 w-4" /> Site Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>SMS Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">SMS integration coming soon. This tab will show inbound/outbound texts.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Email Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Email logs overview coming soon. We’ll surface recent sends and failures.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries">
          <Card>
            <CardHeader>
              <CardTitle>Site Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiries.isLoading ? (
                <div className="flex items-center gap-2 text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> Loading inquiries…</div>
              ) : (inquiries.data?.length ? (
                <div className="space-y-3">
                  {inquiries.data.map((inq) => (
                    <div key={inq.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">{inq.name} <span className="text-gray-500">•</span> <span className="text-gray-600 text-sm">{new Date(inq.createdAt).toLocaleString()}</span></div>
                        <div className="flex items-center gap-2">
                          <Badge variant={inq.status === 'new' ? 'default' : inq.status === 'open' ? 'secondary' : 'outline'}>{inq.status}</Badge>
                          <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: inq.id, status: inq.status === 'new' ? 'open' : inq.status === 'open' ? 'closed' : 'archived' })}>
                            Mark {inq.status === 'new' ? 'Open' : inq.status === 'open' ? 'Closed' : 'Archived'}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteInquiry.mutate(inq.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <div><span className="text-gray-500">Email:</span> {inq.email}</div>
                        {inq.phone ? <div><span className="text-gray-500">Phone:</span> {inq.phone}</div> : null}
                        {inq.athleteInfo ? <div><span className="text-gray-500">Athlete:</span> {inq.athleteInfo}</div> : null}
                        <div className="mt-2 whitespace-pre-wrap">{inq.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No inquiries yet. Messages sent via the Contact page will appear here.</p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
