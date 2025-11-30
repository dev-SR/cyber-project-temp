'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
	getAllFeaturesWithAccess,
	getStoredToken,
	getStoredUser,
	verifyUserToken
} from '@/lib/accessControl';

const TIERS = [
	{
		id: 'free',
		name: 'Free',
		price: 0,
		icon: Star,
		color: 'from-slate-600 to-slate-700',
		features: [
			'Basic analytics viewing',
			'Content preview',
			'Limited reports (7 days)',
			'Community support'
		]
	},
	{
		id: 'basic',
		name: 'Basic',
		price: 9.99,
		icon: Zap,
		color: 'from-blue-600 to-blue-700',
		popular: true,
		features: [
			'Everything in Free',
			'Advanced analytics',
			'Content creation & editing',
			'Standard reports (30 days)',
			'CSV export',
			'Email support'
		]
	},
	{
		id: 'premium',
		name: 'Premium',
		price: 29.99,
		icon: Crown,
		color: 'from-purple-600 to-pink-600',
		features: [
			'Everything in Basic',
			'Real-time analytics',
			'AI content generation',
			'Advanced reports (unlimited)',
			'PDF & CSV export',
			'Custom reports builder',
			'API access',
			'Priority support'
		]
	}
];

export default function SubscriptionPage() {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [token, setToken] = useState('');
	const [currentTier, setCurrentTier] = useState('free');
	const [selectedTier, setSelectedTier] = useState('');
	const [paymentMethod, setPaymentMethod] = useState('demo');
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState({ type: '', text: '' });
	const [allFeatures, setAllFeatures] = useState([]);

	useEffect(() => {
		const storedToken = getStoredToken();
		const storedUser = getStoredUser();

		if (!storedToken || !storedUser) {
			router.push('/auth');
			return;
		}

		const verification = verifyUserToken(storedToken);
		if (verification.valid) {
			setToken(storedToken);
			setUser(storedUser);
			setCurrentTier(verification.tier);
			setAllFeatures(getAllFeaturesWithAccess(verification.tier));
		} else {
			router.push('/auth');
		}
	}, [router]);

	const handleUpgrade = async () => {
		if (!selectedTier || selectedTier === currentTier) {
			setMessage({ type: 'error', text: 'Please select a different tier to upgrade' });
			return;
		}

		setIsLoading(true);
		setMessage({ type: '', text: '' });

		try {
			const response = await fetch('/api/payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token,
					tier: selectedTier,
					paymentMethod
				})
			});

			const data = await response.json();

			if (response.ok) {
				setMessage({
					type: 'success',
					text: `Successfully upgraded to ${selectedTier.toUpperCase()}! Your features have been updated.`
				});

				// Update local storage
				const updatedUser = { ...user, subscription: data.subscription };
				setUser(updatedUser);
				setCurrentTier(data.subscription);
				localStorage.setItem('user', JSON.stringify(updatedUser));
				localStorage.setItem('token', data.token);
				setToken(data.token);

				// Update features locally and broadcast change so other pages update immediately
				setAllFeatures(getAllFeaturesWithAccess(data.subscription));
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new Event('tokenUpdated'));
				}
			} else {
				setMessage({ type: 'error', text: data.error });
			}
		} catch (err) {
			setMessage({ type: 'error', text: 'Network error. Please try again.' });
		} finally {
			setIsLoading(false);
		}
	};

	if (!user) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center'>
				<div className='text-white'>Loading...</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<div className='flex justify-between items-center mb-8'>
					<div>
						<Link href='/'>
							<h1 className='text-4xl font-bold text-white mb-2 cursor-pointer hover:text-purple-400 transition'>
								Subscription Management
							</h1>
						</Link>
						<p className='text-gray-400'>Manage your plan and unlock powerful features</p>
					</div>
					<div className='flex gap-3'>
						<Link href='/dashboard'>
							<Button
								variant='outline'
								className='bg-slate-800 text-white border-slate-600 hover:bg-slate-700'>
								Dashboard
							</Button>
						</Link>
						<Link href='/features/analytics'>
							<Button
								variant='outline'
								className='bg-slate-800 text-white border-slate-600 hover:bg-slate-700'>
								Features
							</Button>
						</Link>
					</div>
				</div>

				{message.text && (
					<Alert
						className={`mb-6 ${
							message.type === 'success'
								? 'bg-green-900 border-green-700'
								: 'bg-red-900 border-red-700'
						}`}>
						<AlertDescription
							className={message.type === 'success' ? 'text-green-200' : 'text-red-200'}>
							{message.text}
						</AlertDescription>
					</Alert>
				)}

				{/* Current Plan */}
				<Card className='bg-slate-800 border-slate-700 mb-8'>
					<CardHeader>
						<CardTitle className='text-white'>Your Current Plan</CardTitle>
						<CardDescription className='text-gray-400'>
							You are currently on the {currentTier.toUpperCase()} plan
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='flex items-center gap-4'>
							<Badge className='bg-gradient-to-r from-purple-600 to-pink-600 text-2xl px-6 py-3'>
								{currentTier.toUpperCase()}
							</Badge>
							<div className='text-gray-300'>
								<p className='font-semibold'>
									{allFeatures.filter((f) => f.available).length} features unlocked
								</p>
								<p className='text-sm text-gray-400'>Upgrade to unlock more features</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Subscription Tiers */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
					{TIERS.map((tier) => {
						const TierIcon = tier.icon;
						const isCurrent = tier.id === currentTier;

						return (
							<Card
								key={tier.id}
								onClick={() => !isCurrent && setSelectedTier(tier.id)}
								className={`${
									isCurrent
										? 'bg-slate-800 border-green-500 border-2'
										: selectedTier === tier.id
										? 'bg-slate-700 border-purple-500 border-2 cursor-pointer'
										: 'bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-600'
								} transition-all`}>
								<CardHeader>
									<div className='flex items-center justify-between mb-2'>
										<div className='flex items-center gap-2'>
											<TierIcon className='w-6 h-6 text-purple-400' />
											<CardTitle className='text-white text-2xl'>{tier.name}</CardTitle>
										</div>
										{isCurrent && <Badge className='bg-green-600'>Current</Badge>}
										{tier.popular && !isCurrent && <Badge className='bg-blue-600'>Popular</Badge>}
									</div>
									<div className='text-3xl font-bold text-white mb-2'>
										${tier.price}
										<span className='text-lg text-gray-400'>/month</span>
									</div>
								</CardHeader>
								<CardContent>
									<ul className='space-y-3'>
										{tier.features.map((feature, idx) => (
											<li key={idx} className='flex items-start gap-2 text-gray-300'>
												<Check className='w-5 h-5 text-green-400 flex-shrink-0 mt-0.5' />
												<span className='text-sm'>{feature}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Payment Options */}
				{selectedTier && selectedTier !== currentTier && (
					<Card className='bg-slate-800 border-slate-700'>
						<CardHeader>
							<CardTitle className='text-white'>Complete Your Upgrade</CardTitle>
							<CardDescription className='text-gray-400'>
								Upgrading to {selectedTier.toUpperCase()} plan
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-6'>
								<div>
									<h3 className='text-white font-semibold mb-3'>Payment Method</h3>
									<RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
										<div className='flex items-center space-x-2 mb-3 p-3 bg-slate-900 rounded'>
											<RadioGroupItem value='demo' id='demo' />
											<Label htmlFor='demo' className='text-gray-300 cursor-pointer flex-1'>
												<span className='font-semibold'>Demo Payment</span>
												<span className='block text-sm text-gray-400'>
													Instant activation for testing
												</span>
											</Label>
										</div>
										<div className='flex items-center space-x-2 p-3 bg-slate-900 rounded'>
											<RadioGroupItem value='stripe' id='stripe' />
											<Label htmlFor='stripe' className='text-gray-300 cursor-pointer flex-1'>
												<span className='font-semibold'>Stripe Payment</span>
												<span className='block text-sm text-gray-400'>
													{process.env.NEXT_PUBLIC_STRIPE_KEY
														? 'Credit card payment'
														: 'Not configured'}
												</span>
											</Label>
										</div>
									</RadioGroup>
								</div>

								<Button
									onClick={handleUpgrade}
									disabled={isLoading}
									className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6'>
									{isLoading
										? 'Processing...'
										: `Upgrade to ${selectedTier.toUpperCase()} - $${
												TIERS.find((t) => t.id === selectedTier)?.price
										  }/mo`}
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
