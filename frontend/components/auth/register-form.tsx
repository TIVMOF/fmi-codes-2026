'use client';

import { useState } from 'react';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

interface RegisterFormProps {
	onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
	const { register } = useAuth();
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		if (password.length < 8) {
			setError('Password must be at least 8 characters');
			return;
		}

		setIsLoading(true);

		const result = await register(username, email, password);

		if (!result.success) {
			setError(result.error || 'Registration failed');
		}

		setIsLoading(false);
	};

	return (
		<Card className='w-full max-w-md border-border bg-card'>
			<CardHeader className='text-center'>
				<CardTitle className='text-2xl font-bold text-foreground'>Create Account</CardTitle>
				<CardDescription className='text-muted-foreground'>Get started with emergency evacuation simulations</CardDescription>
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
						<Input id='username' type='text' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Choose a username' required className='bg-input border-border' />
					</div>

					<div className='flex flex-col gap-2'>
						<Label htmlFor='email' className='text-foreground'>
							Email
						</Label>
						<Input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Enter your email' required className='bg-input border-border' />
					</div>

					<div className='flex flex-col gap-2'>
						<Label htmlFor='password' className='text-foreground'>
							Password
						</Label>
						<Input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Create a password' required className='bg-input border-border' />
					</div>

					<div className='flex flex-col gap-2'>
						<Label htmlFor='confirmPassword' className='text-foreground'>
							Confirm Password
						</Label>
						<Input id='confirmPassword' type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder='Confirm your password' required className='bg-input border-border' />
					</div>

					<Button type='submit' disabled={isLoading} className='mt-2'>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Creating account...
							</>
						) : (
							'Create Account'
						)}
					</Button>

					<p className='text-center text-sm text-muted-foreground'>
						Already have an account?{' '}
						<Button type='button' variant='link' onClick={onSwitchToLogin} className='h-auto p-0'>
							Sign in
						</Button>
					</p>
				</form>
			</CardContent>
		</Card>
	);
}
