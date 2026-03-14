import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Silent Path - Emergency Evacuation Simulator',
	description: 'Design and simulate emergency evacuation scenarios with interactive floor plan editing',
	icons: {
		icon: [
			{
				url: '/circle.ico',
				media: '(prefers-color-scheme: light)',
			},
			{
				url: '/icon-white.ico',
				media: '(prefers-color-scheme: dark)',
			},
			{
				url: '/circle.ico',
			},
		],
	},
};

export const viewport: Viewport = {
	themeColor: '#1a1a2e',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' className='dark'>
			<body className='font-sans antialiased'>
				<AuthProvider>{children}</AuthProvider>
				<Toaster richColors closeButton />
				<Analytics />
			</body>
		</html>
	);
}
