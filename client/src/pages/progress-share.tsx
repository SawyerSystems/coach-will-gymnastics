import React from 'react';
import { useParams } from 'wouter';
import { useProgressByToken } from '@/hooks/useAthleteProgress';
import ProgressView from '@/components/progress/ProgressView';

export default function ProgressSharePage() {
	const params = useParams<{ token: string }>();
	const token = params?.token;
	const { data, isLoading } = useProgressByToken(token);

	if (!token) return <div className="p-6">Missing token.</div>;
	if (isLoading) return <div className="p-6">Loading…</div>;
	if (!data?.athlete) return <div className="p-6">Link not found or expired.</div>;

		return <ProgressView data={data as any} />;
}
