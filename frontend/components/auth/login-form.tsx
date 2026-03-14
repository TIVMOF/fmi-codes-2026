'use client';

import { useState } from 'react';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

interface LoginFormProps {
	onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
	const { login } = useAuth();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		const result = await login(username, password);

		if (!result.success) {
			setError(result.error || 'Login failed');
		}

		setIsLoading(false);
	};

	return (
		<Card className='w-full max-w-md border-border bg-card'>
			<CardHeader className='text-center'>
				<CardTitle className='text-2xl font-bold text-foreground'>Welcome Back</CardTitle>
				<CardDescription className='text-muted-foreground'>Sign in to access your emergency simulations</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
					{error && (
						<div className='flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
							<AlertCircle className='h-4 w-4' />
							{error}
						</div>
					)}

					<div className='flex flex-col gap-2'>
						<Label htmlFor='username' className='text-foreground'>
							Username
						</Label>
						<Input id='username' type='text' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Enter your username' required className='bg-input border-border' />
					</div>

					<div className='flex flex-col gap-2'>
						<Label htmlFor='password' className='text-foreground'>
							Password
						</Label>
						<Input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Enter your password' required className='bg-input border-border' />
					</div>

					<Button type='submit' disabled={isLoading} className='mt-2'>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Signing in...
							</>
						) : (
							'Sign In'
						)}
					</Button>

					<p className='text-center text-sm text-muted-foreground'>
						{"Don't have an account? "}
						<Button type='button' variant='link' onClick={onSwitchToRegister} className='h-auto p-0'>
							Create one
						</Button>
					</p>
				</form>
			</CardContent>
		</Card>
	);
}
