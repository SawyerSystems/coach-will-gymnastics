import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery as useRQQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function CustomEmailPanel() {
  const { toast } = useToast();
  const [recipientMode, setRecipientMode] = useState<'single'|'selected'|'all'>('single');
  const [usePersonalized, setUsePersonalized] = useState<boolean>(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: parents = [], isLoading } = useRQQuery<any[]>({
    queryKey: ['/api/parents', { page: 1, limit: 1000 }],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/parents?page=1&limit=1000');
      const json = await res.json();
      return json?.parents || [];
    }
  });

  const toggleId = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const sampleGreeting = () => {
    if (!usePersonalized) return 'Hi there,';
    const p = parents?.[0];
    const first = p?.first_name || '';
    return first ? `Hi ${first},` : 'Hi there,';
  };

  const totalRecipients = recipientMode === 'all' ? (parents?.length || 0) : (recipientMode === 'single' ? (selectedIds.length ? 1 : 0) : selectedIds.length);

  const validate = () => {
    if (!subject.trim()) {
      toast({ title: 'Subject required', description: 'Please enter an email subject.', variant: 'destructive' });
      return false;
    }
    if (!body.trim()) {
      toast({ title: 'Body required', description: 'Please enter an email body.', variant: 'destructive' });
      return false;
    }
    if (recipientMode !== 'all' && selectedIds.length === 0) {
      toast({ title: 'Select recipients', description: 'Please select at least one parent.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const sendRequest = async () => {
    try {
      const payload: any = {
        recipientMode,
        recipientIds: recipientMode === 'all' ? [] : selectedIds,
        usePersonalizedGreeting: usePersonalized,
        subject,
        body,
      };
      const res = await apiRequest('POST', '/api/admin/custom-email', payload);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to send');
      }
      toast({ title: 'Emails sent', description: `Sent: ${json.sentCount}, Failed: ${json.failedCount}`, variant: 'default' });
      setConfirmOpen(false);
    } catch (e: any) {
      toast({ title: 'Send failed', description: e?.message || 'Error sending emails', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Recipient Mode</Label>
          <Select value={recipientMode} onValueChange={(v: any) => setRecipientMode(v)}>
            <select className="hidden" />
          </Select>
          <div className="flex gap-2 mt-2">
            <Button variant={recipientMode==='single'?'default':'outline'} size="sm" onClick={() => setRecipientMode('single')}>Single</Button>
            <Button variant={recipientMode==='selected'?'default':'outline'} size="sm" onClick={() => setRecipientMode('selected')}>Selected</Button>
            <Button variant={recipientMode==='all'?'default':'outline'} size="sm" onClick={() => setRecipientMode('all')}>All</Button>
          </div>
        </div>
        <div>
          <Label>Personalize Greeting</Label>
          <div className="flex items-center gap-2 mt-2">
            <Switch checked={usePersonalized} onCheckedChange={setUsePersonalized} />
            <span className="text-sm text-gray-600 dark:text-white/70">Include parent first name</span>
          </div>
        </div>
        <div>
          <Label>Subject</Label>
          <Input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" className="dark:bg-white/10 dark:text-white" />
        </div>
      </div>
      <div>
        <Label>Body</Label>
        <Textarea value={body} onChange={e=>setBody(e.target.value)} rows={6} placeholder="Message body" className="dark:bg-white/10 dark:text-white" />
      </div>

      {(recipientMode==='single' || recipientMode==='selected') && (
        <div className="bg-white/60 dark:bg-[#0F0276]/30 border rounded-lg p-3">
          <Label>Select Parents</Label>
          <div className="max-h-48 overflow-auto mt-2 space-y-1">
            {isLoading ? (
              <div className="text-sm text-gray-500 dark:text-white/70">Loading parents...</div>
            ) : (
              parents.map((p:any)=> (
                <label key={p.id} className="flex items-center gap-2 text-sm py-1 dark:text-white">
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={()=>toggleId(p.id)} />
                  <span>{(p.first_name||'') + ' ' + (p.last_name||'')} ({p.email || 'no-email'})</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Button type="button" variant="outline" size="sm"
            onClick={() => {
              const previewName = sampleGreeting();
              toast({ title: 'Preview', description: `${previewName}\n\n${body.substring(0,120)}${body.length>120?'...':''}`, variant: 'default' });
            }}
          >Preview</Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-white/70">Recipients: {totalRecipients}</div>
          <Button type="button" onClick={() => { if (validate()) setConfirmOpen(true); }}>
            Send Email
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Send</DialogTitle>
            <DialogDescription>
              You are about to send this email to {totalRecipients} parent(s). Proceed?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={()=>setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={sendRequest}>Confirm & Send</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
