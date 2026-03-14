'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Button } from '@/components/ui/button';
import { Shield, Users, LayoutGrid, Play, CheckCircle, Zap, BarChart3, Building2 } from 'lucide-react';

export default function HomePage() {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const [showAuth, setShowAuth] = useState(false);
	const [showRegister, setShowRegister] = useState(false);
	const currentYear = new Date().getFullYear();

	useEffect(() => {
		if (!isLoading && user) {
			router.push('/dashboard');
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

	if (user) {
		return null;
	}

	if (showAuth) {
		return (
			<div className='flex min-h-screen bg-background'>
				{/* Left side - Branding */}
				<div className='hidden flex-1 flex-col justify-between bg-card p-12 lg:flex'>
					<Button type='button' variant='ghost' onClick={() => setShowAuth(false)} className='h-auto w-fit justify-start gap-3 p-0 text-left hover:bg-transparent'>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary'>
							<Shield className='h-6 w-6 text-primary-foreground' />
						</div>
						<span className='text-2xl font-bold text-foreground'>Silent Path</span>
					</Button>

					<div className='flex flex-col gap-8'>
						<h1 className='text-4xl font-bold leading-tight text-foreground text-balance'>
							Plan for the
							<br />
							<span className='text-primary'>Unexpected</span>
						</h1>
						<p className='max-w-md text-lg text-muted-foreground text-pretty'>Create, simulate, and optimize emergency evacuation scenarios with our powerful floor plan editor and real-time simulation engine.</p>

						<div className='flex flex-col gap-4'>
							<FeatureItem icon={<LayoutGrid className='h-5 w-5' />} title='Interactive Floor Plan Editor' description='Draw walls, doors, tables, and emergency exits with precision' />
							<FeatureItem icon={<Users className='h-5 w-5' />} title='Crowd Simulation' description='Model realistic evacuation behavior with customizable parameters' />
							<FeatureItem icon={<Play className='h-5 w-5' />} title='Video Analysis' description='Receive detailed simulation videos showing evacuation patterns' />
						</div>
					</div>

					<p className='text-sm text-muted-foreground'>Powered by advanced evacuation algorithms</p>
				</div>

				{/* Right side - Auth forms */}
				<div className='flex flex-1 items-center justify-center p-8'>
					<div className='w-full max-w-md'>
						{/* Mobile branding */}
						<div className='mb-8 flex flex-col items-center gap-3 lg:hidden'>
							<Button type='button' variant='ghost' onClick={() => setShowAuth(false)} className='h-auto w-fit gap-3 p-0 hover:bg-transparent'>
								<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-primary'>
									<Shield className='h-7 w-7 text-primary-foreground' />
								</div>
								<span className='text-2xl font-bold text-foreground'>Silent Path</span>
							</Button>
							<p className='text-center text-sm text-muted-foreground'>Emergency Evacuation Simulator</p>
						</div>

						{showRegister ? <RegisterForm onSwitchToLogin={() => setShowRegister(false)} /> : <LoginForm onSwitchToRegister={() => setShowRegister(true)} />}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background'>
			{/* Navigation */}
			<nav className='fixed top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl'>
				<div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6'>
					<div className='flex items-center gap-3 animate-fade-up'>
						<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30'>
							<Shield className='h-5 w-5 text-primary-foreground' />
						</div>
						<span className='text-xl font-bold text-foreground'>Silent Path</span>
					</div>
					<div className='flex items-center gap-3 animate-fade-up delay-200'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => {
								setShowAuth(true);
								setShowRegister(false);
							}}
						>
							Sign In
						</Button>
						<Button
							size='sm'
							onClick={() => {
								setShowAuth(true);
								setShowRegister(true);
							}}
						>
							Sign Up
						</Button>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className='relative overflow-hidden pt-28 pb-24'>
				<div className='pointer-events-none absolute inset-0'>
					<div className='absolute -left-24 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-drift' />
					<div className='absolute -right-20 top-28 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl animate-float-slow' />
					<div className='absolute inset-0 bg-linear-to-b from-primary/10 via-transparent to-transparent' />
					<div className='absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[48px_48px] opacity-[0.14]' />
				</div>
				<div className='relative mx-auto max-w-7xl px-6'>
					<div className='grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]'>
						<div className='text-left'>
							<div className='mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm text-muted-foreground backdrop-blur animate-fade-up'>
								<Zap className='h-4 w-4 text-primary' />
								Powerful Emergency Simulation Platform
							</div>
							<h1 className='mb-6 max-w-3xl text-5xl font-bold leading-[1.05] text-foreground md:text-6xl lg:text-7xl text-balance animate-fade-up delay-100'>
								Train for chaos.
								<br />
								<span className='text-primary'>Respond with clarity.</span>
							</h1>
							<p className='mb-10 max-w-xl text-lg text-muted-foreground md:text-xl text-pretty animate-fade-up delay-200'>
								Build realistic evacuation scenarios from your own floor plans, test bottlenecks, and turn safety planning into measurable decisions.
							</p>
							<div className='flex flex-col gap-4 sm:flex-row animate-fade-up delay-300'>
								<Button
									size='lg'
									className='h-12 px-8 text-base shadow-lg shadow-primary/25'
									onClick={() => {
										setShowAuth(true);
										setShowRegister(true);
									}}
								>
									Start Simulating
								</Button>
								<Button
									size='lg'
									variant='outline'
									className='h-12 border-border/80 bg-card/60 px-8 text-base backdrop-blur'
									onClick={() => {
										setShowAuth(true);
										setShowRegister(false);
									}}
								>
									Sign In
								</Button>
							</div>
						</div>

						<div className='animate-fade-up delay-400'>
							<div className='rounded-2xl border border-border/80 bg-card/80 p-5 shadow-2xl shadow-black/30 backdrop-blur'>
								<div className='mb-4 flex items-center justify-between border-b border-border/60 pb-4'>
									<div>
										<p className='text-sm text-muted-foreground'>Scenario</p>
										<p className='text-lg font-semibold text-foreground'>Office Tower A · Floor 6</p>
									</div>
									<div className='rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400'>Simulation Complete</div>
								</div>
								<div className='grid gap-3 sm:grid-cols-2'>
									<SignalMetric label='People' value='145' hint='agents' />
									<SignalMetric label='Avg Evac Time' value='02:43' hint='minutes' />
									<SignalMetric label='Critical Bottlenecks' value='3' hint='zones' />
									<SignalMetric label='Safe Exits' value='6' hint='routes' />
								</div>
								<div className='mt-4 rounded-xl border border-border/60 bg-background/50 p-3'>
									<div className='mb-2 flex items-center justify-between'>
										<span className='text-xs uppercase tracking-wide text-muted-foreground'>Evacuation Progress</span>
										<span className='text-xs font-medium text-foreground'>82%</span>
									</div>
									<div className='h-2 rounded-full bg-secondary'>
										<div className='h-2 w-[82%] rounded-full bg-linear-to-r from-primary to-cyan-400 animate-soft-fade' />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className='py-20'>
				<div className='mx-auto max-w-7xl px-6'>
					<div className='mb-16 text-center animate-fade-up'>
						<h2 className='mb-4 text-3xl font-bold text-foreground md:text-4xl'>Everything You Need</h2>
						<p className='mx-auto max-w-2xl text-muted-foreground'>A complete suite of tools for emergency planning and simulation</p>
					</div>

					<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
						<FeatureCard
							className='animate-fade-up delay-100'
							icon={<LayoutGrid className='h-6 w-6' />}
							title='Interactive Editor'
							description='Draw walls, doors, and obstacles with our intuitive grid-based canvas editor. Upload floor plan schematics as background references.'
						/>
						<FeatureCard
							className='animate-fade-up delay-200'
							icon={<Building2 className='h-6 w-6' />}
							title='Complete Building Elements'
							description='Place walls, doors, tables, emergency exits, and panic markers. Configure every detail of your space.'
						/>
						<FeatureCard
							className='animate-fade-up delay-300'
							icon={<Users className='h-6 w-6' />}
							title='Crowd Dynamics'
							description='Set the number of occupants and watch realistic evacuation behavior unfold based on advanced simulation algorithms.'
						/>
						<FeatureCard className='animate-fade-up delay-100' icon={<Play className='h-6 w-6' />} title='Video Results' description='Receive detailed MP4 videos showing evacuation flow patterns, bottlenecks, and timing analysis.' />
						<FeatureCard
							className='animate-fade-up delay-200'
							icon={<BarChart3 className='h-6 w-6' />}
							title='Analytics Dashboard'
							description='Track all your simulations, compare results, and identify areas for improvement in your evacuation plans.'
						/>
						<FeatureCard
							className='animate-fade-up delay-300'
							icon={<Zap className='h-6 w-6' />}
							title='Fast Processing'
							description='Our powerful simulation engine processes your scenarios quickly, delivering actionable results in minutes.'
						/>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className='border-y border-border bg-card py-20'>
				<div className='mx-auto max-w-7xl px-6'>
					<div className='mb-16 text-center animate-fade-up'>
						<h2 className='mb-4 text-3xl font-bold text-foreground md:text-4xl'>How It Works</h2>
						<p className='mx-auto max-w-2xl text-muted-foreground'>Create your first simulation in just a few steps</p>
					</div>

					<div className='grid gap-8 md:grid-cols-3'>
						<StepCard
							className='animate-fade-up delay-100'
							number={1}
							title='Design Your Space'
							description='Upload a floor plan schematic and use our editor to draw walls, place doors, tables, and emergency exits on a customizable grid.'
						/>
						<StepCard className='animate-fade-up delay-200' number={2} title='Configure Parameters' description='Set the number of people, mark panic zones, and adjust grid dimensions to match your real-world scenario.' />
						<StepCard className='animate-fade-up delay-300' number={3} title='Run Simulation' description='Click simulate and receive a detailed video showing how people would evacuate based on your configuration.' />
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-20'>
				<div className='mx-auto max-w-4xl px-6 text-center'>
					<h2 className='mb-4 text-3xl font-bold text-foreground md:text-4xl text-balance animate-fade-up'>Ready to Improve Your Emergency Plans?</h2>
					<p className='mb-8 text-lg text-muted-foreground animate-fade-up delay-100'>Start creating simulations today and ensure the safety of your building occupants.</p>
					<Button
						size='lg'
						className='h-12 px-8 text-base shadow-lg shadow-primary/20 animate-fade-up delay-200'
						onClick={() => {
							setShowAuth(true);
							setShowRegister(true);
						}}
					>
						Go Simulating
					</Button>
				</div>
			</section>

			{/* Footer */}
			<footer className='border-t border-border bg-card/20 py-12'>
				<div className='mx-auto max-w-7xl px-6'>
					<div className='grid gap-8 border-b border-border/70 pb-8 md:grid-cols-[1.2fr_1fr_1fr]'>
						<div className='space-y-3'>
							<div className='flex items-center gap-3'>
								<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary'>
									<Shield className='h-5 w-5 text-primary-foreground' />
								</div>
								<span className='text-lg font-semibold text-foreground'>Silent Path</span>
							</div>
							<p className='max-w-sm text-sm leading-6 text-muted-foreground'>Emergency readiness platform for modeling and improving evacuation outcomes before incidents happen.</p>
						</div>

						<div>
							<h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/90'>Quick Links</h3>
							<div className='space-y-2 text-sm'>
								<FooterLink href='/simulations/new'>Create Simulation</FooterLink>
								<FooterLink href='/simulations'>Simulation Library</FooterLink>
								<FooterLink href='/dashboard'>Analytics Dashboard</FooterLink>
								<FooterLink href='/'>Home</FooterLink>
							</div>
						</div>

						<div>
							<h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/90'>Info</h3>
							<div className='space-y-2 text-sm'>
								<FooterLink href='#'>Documentation</FooterLink>
								<FooterLink href='#'>Safety Standards</FooterLink>
								<FooterLink href='#'>Platform Status</FooterLink>
								<FooterLink href='#'>Privacy & Security</FooterLink>
							</div>
						</div>
					</div>

					<div className='flex flex-col items-start justify-between gap-3 pt-6 text-sm text-muted-foreground md:flex-row md:items-center'>
						<p>© {currentYear} Silent Path. Powered by advanced evacuation simulation algorithms.</p>
						<div className='flex items-center gap-5'>
							<FooterLink href='#'>Privacy</FooterLink>
							<FooterLink href='#'>Terms</FooterLink>
							<FooterLink href='#'>Security</FooterLink>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
	return (
		<div className='flex items-start gap-4'>
			<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary'>{icon}</div>
			<div>
				<h3 className='font-semibold text-foreground'>{title}</h3>
				<p className='text-sm text-muted-foreground'>{description}</p>
			</div>
		</div>
	);
}

function FeatureCard({ icon, title, description, className }: { icon: React.ReactNode; title: string; description: string; className?: string }) {
	return (
		<div className={`group rounded-xl border border-border bg-card/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 ${className ?? ''}`}>
			<div className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>{icon}</div>
			<h3 className='mb-2 text-lg font-semibold text-foreground'>{title}</h3>
			<p className='text-sm text-muted-foreground'>{description}</p>
		</div>
	);
}

function StepCard({ number, title, description, className }: { number: number; title: string; description: string; className?: string }) {
	return (
		<div className={`relative rounded-xl border border-border/70 bg-background/40 p-6 ${className ?? ''}`}>
			<div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/30'>{number}</div>
			<h3 className='mb-2 text-lg font-semibold text-foreground'>{title}</h3>
			<p className='text-muted-foreground'>{description}</p>
		</div>
	);
}

function SignalMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
	return (
		<div className='rounded-lg border border-border/60 bg-background/50 p-3'>
			<p className='text-xs uppercase tracking-wide text-muted-foreground'>{label}</p>
			<p className='mt-1 text-2xl font-semibold leading-none text-foreground'>{value}</p>
			<p className='mt-1 text-xs text-muted-foreground'>{hint}</p>
		</div>
	);
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Link
			href={href}
			className='inline-flex rounded-sm px-0.5 text-muted-foreground underline decoration-transparent underline-offset-4 transition-all hover:text-foreground hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
		>
			{children}
		</Link>
	);
}
