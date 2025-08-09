import React from 'react';
import { useParams } from 'wouter';
import { useProgressByToken } from '@/hooks/useAthleteProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProgressSharePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const { data, isLoading } = useProgressByToken(token);

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
                <ul className="space-y-1">
                  {s.videos.map((v) => (
                    <li key={v.id}>
                      <a className="text-blue-600 underline break-all" href={v.url || undefined} target="_blank" rel="noreferrer">{v.title || v.url}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
