'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { DashboardHeader } from '@/components/dashboard/header';

export default function SimulationsLayout({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !user) {
			router.push('/');
		}
	}, [user, isLoading, router]);

	if (isLoading) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-background'>
				<div className='flex flex-col items-center gap-4'>
					<div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
					<p className='text-muted-foreground'>Loading...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className='flex h-screen flex-col overflow-hidden bg-background'>
			<DashboardHeader />
			<main className='flex-1 min-h-0 overflow-y-auto'>{children}</main>
		</div>
	);
}
