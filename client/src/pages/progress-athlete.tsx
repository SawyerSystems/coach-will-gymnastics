import React from 'react';
import { useParams } from 'wouter';
import { useProgressByAthlete } from '@/hooks/useAthleteProgress';
import ProgressView from '@/components/progress/ProgressView';

// Reuse the same public UI but fetch by athleteId via session-auth
export default function ProgressAthletePage() {
  const params = useParams<{ athleteId: string }>();
  const athleteId = params?.athleteId ? Number(params.athleteId) : undefined;
  const { data, isLoading } = useProgressByAthlete(athleteId);

  if (!athleteId) return <div className="p-6">Missing athlete.</div>;
  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!data?.athlete) return <div className="p-6">Not found or access denied.</div>;

  return <ProgressView data={data as any} />;
}
