import React from 'react';
import { useParams } from 'wouter';
import { useProgressByToken } from '@/hooks/useAthleteProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Play } from 'lucide-react';

export default function ProgressSharePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const { data, isLoading } = useProgressByToken(token);
  const [openVideo, setOpenVideo] = React.useState<{ url: string; title?: string } | null>(null);

  const isDirectVideoUrl = React.useCallback((url?: string | null) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      const path = u.pathname.toLowerCase();
      return /\.(mp4|webm|m4v|mov|ogg|ogv)$/i.test(path);
    } catch {
      // If not a valid URL string, fallback to extension check
      return /\.(mp4|webm|m4v|mov|ogg|ogv)$/i.test(url.toLowerCase());
    }
  }, []);

  if (!token) return <div className="p-6">Missing token.</div>;
  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!data?.athlete) return <div className="p-6">Link not found or expired.</div>;

  const a = data.athlete;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">{a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim()}</h1>
      <p className="text-slate-600 mb-6">Shared skill progress</p>

      {data.skills.map((s) => (
        <Card key={s.athleteSkill.id} className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">{s.skill?.name || `Skill #${s.athleteSkill.skillId}`}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600">Status: {s.athleteSkill.status || '—'}</div>
            {s.athleteSkill.notes && (
              <div className="text-sm mt-2 whitespace-pre-wrap">{s.athleteSkill.notes}</div>
            )}
            {!!s.videos.length && (
              <div className="mt-3 space-y-2">
                <div className="text-sm font-medium">Videos</div>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {s.videos.map((v) => {
                    const direct = isDirectVideoUrl(v.url as any);
                    return (
                      <li key={v.id} className="group">
                        {direct ? (
                          <button
                            type="button"
                            onClick={() => v.url && setOpenVideo({ url: v.url, title: v.title || undefined })}
                            className="w-full text-left"
                          >
                            <AspectRatio ratio={16/9}>
                              <div className="relative w-full h-full overflow-hidden rounded-md border bg-black/80">
                                <video
                                  className="absolute inset-0 h-full w-full object-cover"
                                  src={v.url || undefined}
                                  muted
                                  playsInline
                                  preload="metadata"
                                  onLoadedMetadata={(e) => {
                                    const vid = e.currentTarget as HTMLVideoElement;
                                    try {
                                      vid.currentTime = 0;
                                      vid.pause();
                                    } catch {}
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="rounded-full bg-white/90 p-3 shadow group-hover:scale-110 transition-transform">
                                    <Play className="h-5 w-5 text-black" />
                                  </div>
                                </div>
                              </div>
                            </AspectRatio>
                            <div className="mt-1">
                              <div className="text-xs font-medium truncate" title={v.title || v.url || ''}>{v.title || v.url}</div>
                              {v.recordedAt && (
                                <div className="text-[10px] text-slate-500">{new Date(v.recordedAt as any).toLocaleDateString()}</div>
                              )}
                            </div>
                          </button>
                        ) : (
                          <div>
                            <a className="text-blue-600 underline break-all" href={v.url || undefined} target="_blank" rel="noreferrer">{v.title || v.url}</a>
                            {v.recordedAt && (
                              <div className="text-[10px] text-slate-500">{new Date(v.recordedAt as any).toLocaleDateString()}</div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!openVideo} onOpenChange={(o) => !o && setOpenVideo(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{openVideo?.title || 'Video'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {openVideo?.url && (
              <div className="w-full">
                <AspectRatio ratio={16/9}>
                  <video
                    className="h-full w-full rounded-md border bg-black"
                    src={openVideo.url}
                    controls
                    playsInline
                  />
                </AspectRatio>
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              {openVideo?.url && (
                <a href={openVideo.url} download target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
