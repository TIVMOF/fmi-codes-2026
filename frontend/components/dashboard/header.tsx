'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, User, LogOut, LayoutDashboard, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function DashboardHeader() {
	const { user, logout } = useAuth();
	const pathname = usePathname();

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/simulations', label: 'Simulations', icon: List },
	];

	return (
		<header className='sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm'>
			<div className='flex h-16 items-center justify-between px-6'>
				<div className='flex items-center gap-8'>
					<Link href='/dashboard' className='flex items-center gap-2'>
						<div className='flex items-center gap-2 animate-fade-up'>
							<Image src='/turbodogy-b.png' alt='Silent Path logo' width={24} height={24} />
							<span className='text-xl font-bold text-foreground'>Silent Path</span>
						</div>
					</Link>

					<nav className='hidden items-center gap-1 md:flex'>
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground')}
								>
									<Icon className='h-4 w-4' />
									{item.label}
								</Link>
							);
						})}
					</nav>
				</div>

				<div className='flex items-center gap-4'>
					<Button asChild>
						<Link href='/simulations/new'>
							<Plus className='mr-2 h-4 w-4' />
							New Simulation
						</Link>
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' size='icon' className='rounded-full'>
								<div className='flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground'>
									<User className='h-4 w-4' />
								</div>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-56'>
							<div className='px-2 py-1.5'>
								<p className='text-sm font-medium text-foreground'>{user?.username}</p>
								<p className='text-xs text-muted-foreground'>{user?.email}</p>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => logout()} className='text-destructive'>
								<LogOut className='mr-2 h-4 w-4' />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
