import React from 'react';
import { useParams } from 'wouter';
import { useProgressByToken } from '@/hooks/useAthleteProgress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Award, BookOpen, Calendar, CheckCircle, Clock, Download, Play, Star, Trophy } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim()}
            </h1>
            <p className="text-indigo-100 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>Skills Progress Dashboard</span>
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
        {/* Skill progress overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2 text-indigo-700">
                <Star className="h-5 w-5 text-amber-500" />
                Progress Summary
              </CardTitle>
              <CardDescription>
                Skill mastery and development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1 text-slate-700">Total Skills: {data.skills.length}</div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Mastered', 'In Progress', 'Consistent', 'Developing'].map(status => {
                      const count = data.skills.filter(s => s.athleteSkill.status?.toLowerCase() === status.toLowerCase()).length;
                      const colors = {
                        'Mastered': 'bg-green-100 text-green-800 border-green-200',
                        'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
                        'Consistent': 'bg-purple-100 text-purple-800 border-purple-200',
                        'Developing': 'bg-amber-100 text-amber-800 border-amber-200',
                      };
                      return (
                        <div key={status} className={`rounded-lg border p-3 ${colors[status] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                          <div className="text-xs font-semibold">{status}</div>
                          <div className="text-xl font-bold">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2 text-indigo-700">
                <Award className="h-5 w-5 text-indigo-500" />
                Latest Achievements
              </CardTitle>
              <CardDescription>
                Recently mastered skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.skills.filter(s => s.athleteSkill.status?.toLowerCase() === 'mastered').slice(0, 3).map((s) => (
                <div key={s.athleteSkill.id} className="flex items-center gap-3 py-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{s.skill?.name}</div>
                    <div className="text-xs text-slate-500">Mastered skill</div>
                  </div>
                </div>
              ))}
              {data.skills.filter(s => s.athleteSkill.status?.toLowerCase() === 'mastered').length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm">No mastered skills yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Skill Progress Details
        </h2>

      {data.skills.map((s) => (
        <Card key={s.athleteSkill.id} className="mb-6 bg-white shadow-sm border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base font-bold text-slate-800">
                {s.skill?.name || `Skill #${s.athleteSkill.skillId}`}
              </CardTitle>
              {s.athleteSkill.status && (
                <Badge className={
                  s.athleteSkill.status.toLowerCase() === 'mastered' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                  s.athleteSkill.status.toLowerCase() === 'consistent' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' :
                  s.athleteSkill.status.toLowerCase() === 'in progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                  'bg-amber-100 text-amber-800 hover:bg-amber-100'
                }>
                  {s.athleteSkill.status}
                </Badge>
              )}
            </div>
            <div className="flex items-center mt-1 text-xs text-slate-500">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(s.athleteSkill.updatedAt || s.athleteSkill.createdAt).toLocaleDateString()}
              </span>
              {s.skill?.level && (
                <>
                  <span className="mx-2">•</span>
                  <span>Level: {s.skill.level}</span>
                </>
              )}
              {s.skill?.apparatus?.name && (
                <>
                  <span className="mx-2">•</span>
                  <span>{s.skill.apparatus.name}</span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {s.athleteSkill.notes && (
              <div className="mb-4">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Coach Notes
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm whitespace-pre-wrap text-slate-700">
                  {s.athleteSkill.notes}
                </div>
              </div>
            )}
            {!!s.videos.length && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Progress Videos
                  </div>
                  <div className="text-xs text-slate-500">
                    {s.videos.length} video{s.videos.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                            <AspectRatio ratio={16/9} className="overflow-hidden rounded-md shadow-sm">
                              <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
                                <video
                                  className="absolute inset-0 h-full w-full object-cover opacity-90"
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="rounded-full bg-indigo-500/90 p-3 shadow-md group-hover:scale-110 group-hover:bg-indigo-600/90 transition-transform">
                                    <Play className="h-5 w-5 text-white" fill="white" />
                                  </div>
                                </div>
                              </div>
                            </AspectRatio>
                            <div className="mt-2 space-y-1">
                              <div className="text-xs font-medium truncate" title={v.title || v.url || ''}>{v.title || 'Untitled Video'}</div>
                              {v.recordedAt && (
                                <div className="flex items-center text-[10px] text-slate-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(v.recordedAt as any).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </button>
                        ) : (
                          <div className="p-3 border border-slate-200 rounded-md">
                            <a 
                              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1" 
                              href={v.url || undefined} 
                              target="_blank" 
                              rel="noreferrer"
                            >
                              <Play className="h-3 w-3" />
                              {v.title || v.url}
                            </a>
                            {v.recordedAt && (
                              <div className="flex items-center text-[10px] text-slate-500 mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(v.recordedAt as any).toLocaleDateString()}
                              </div>
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

      </main>

      <Dialog open={!!openVideo} onOpenChange={(o) => !o && setOpenVideo(null)}>
        <DialogContent className="max-w-3xl bg-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Play className="h-4 w-4" />
              {openVideo?.title || 'Skill Video'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {openVideo?.url && (
              <div className="w-full">
                <AspectRatio ratio={16/9}>
                  <video
                    className="h-full w-full rounded-md border border-slate-700 bg-black shadow-xl"
                    src={openVideo.url}
                    controls
                    playsInline
                    autoPlay
                  />
                </AspectRatio>
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              {openVideo?.url && (
                <a href={openVideo.url} download target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="text-slate-200 border-slate-700 hover:bg-slate-700">
                    <Download className="h-4 w-4 mr-1" />
                    <span>Download Video</span>
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
