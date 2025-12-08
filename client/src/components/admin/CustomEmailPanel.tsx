import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function CustomEmailPanel() {
  const { toast } = useToast();
  const [recipientMode, setRecipientMode] = useState<'selected'|'all'>('selected');
  const [usePersonalized, setUsePersonalized] = useState<boolean>(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [htmlBody, setHtmlBody] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<{subject?: string; body?: string; recipients?: string}>({});
  const [search, setSearch] = useState('');

  const { data: parents = [], isLoading } = useQuery<any[]>({
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

  const totalRecipients = recipientMode === 'all' ? (parents?.length || 0) : selectedIds.length;

  const filteredParents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return parents;
    return parents.filter((p: any) =>
      `${p.first_name||''} ${p.last_name||''}`.toLowerCase().includes(q) ||
      (p.email||'').toLowerCase().includes(q)
    );
  }, [parents, search]);

  const validate = () => {
    const nextErrors: {subject?: string; body?: string; recipients?: string} = {};
    if (!subject.trim()) nextErrors.subject = 'Please enter an email subject.';
    if (!htmlBody.trim()) nextErrors.body = 'Please enter an email body.';
    if (recipientMode !== 'all' && selectedIds.length === 0) nextErrors.recipients = 'Please select at least one parent.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast({ title: 'Missing required fields', description: 'Please fix the highlighted inputs.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const sendRequest = async () => {
    try {
      setSending(true);
      const payload: any = {
        recipientMode,
        recipientIds: recipientMode === 'all' ? [] : selectedIds,
        usePersonalizedGreeting: usePersonalized,
        subject,
        htmlBody,
      };
      const res = await apiRequest('POST', '/api/admin/custom-email', payload);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to send');
      }
      toast({ title: 'Emails sent', description: `Sent: ${json.sentCount}, Failed: ${json.failedCount}`, variant: 'default' });
      setConfirmOpen(false);
      setErrors({});
    } catch (e: any) {
      toast({ title: 'Send failed', description: e?.message || 'Error sending emails', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Recipients</Label>
          <div className="flex gap-2 mt-2">
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
          <Input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" className={`dark:bg-white/10 dark:text-white ${errors.subject?'border-red-500':''}`} />
          {errors.subject && (<p className="text-xs text-red-600 mt-1">{errors.subject}</p>)}
        </div>
      </div>
      <div>
        <Label>Body</Label>
        <div className={`rounded-md overflow-hidden ${errors.body?'ring-1 ring-red-500':''}`}>
          <ReactQuill theme="snow" value={htmlBody} onChange={setHtmlBody} modules={{ toolbar: [
            ['bold','italic','underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
          ] }} />
        </div>
        {errors.body && (<p className="text-xs text-red-600 mt-1">{errors.body}</p>)}
      </div>

      {(recipientMode==='selected') && (
        <div className="bg-white/60 dark:bg-[#0F0276]/30 border rounded-lg p-3">
          <Label>Select Parents</Label>
          <div className="mt-2 flex items-center gap-2">
            <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email" className="dark:bg-white/10 dark:text-white" />
          </div>
          <div className="max-h-48 overflow-auto mt-2 space-y-1">
            {isLoading ? (
              <div className="text-sm text-gray-500 dark:text-white/70">Loading parents...</div>
            ) : (
              filteredParents.map((p:any)=> (
                <label key={p.id} className="flex items-center gap-2 text-sm py-1 dark:text-white">
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={()=>toggleId(p.id)} />
                  <span>{(p.first_name||'') + ' ' + (p.last_name||'')} ({p.email || 'no-email'})</span>
                </label>
              ))
            )}
          </div>
          {errors.recipients && (<p className="text-xs text-red-600 mt-2">{errors.recipients}</p>)}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Button type="button" variant="outline" size="sm"
            onClick={() => {
              const previewName = sampleGreeting();
              const plain = htmlBody.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
              toast({ title: 'Preview', description: `${previewName}\n\n${plain.substring(0,120)}${plain.length>120?'...':''}`, variant: 'default' });
            }}
          >Preview</Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-white/70">Recipients: {totalRecipients}</div>
          {sending && <span className="text-sm text-blue-600 dark:text-blue-300">Sending...</span>}
          <Button type="button" disabled={sending} onClick={() => { if (validate()) setConfirmOpen(true); }}>
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
            <Button onClick={sendRequest} disabled={sending}>{sending ? 'Sending...' : 'Confirm & Send'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
