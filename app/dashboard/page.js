'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedFeature from '@/components/ProtectedFeature';

const SUBSCRIPTION_TIERS = [
  {
    name: 'free',
    display: 'Free',
    price: 0,
    features: ['Basic token generation', 'Standard encryption', '100 tokens/month']
  },
  {
    name: 'basic',
    display: 'Basic',
    price: 9.99,
    features: ['Advanced token generation', 'Enhanced encryption', '1,000 tokens/month', 'Email support']
  },
  {
    name: 'premium',
    display: 'Premium',
    price: 29.99,
    features: ['Unlimited tokens', 'Enterprise encryption', 'Priority support', 'Custom integrations', 'Diffie-Hellman key exchange']
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('demo');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dhKeyPair, setDhKeyPair] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      router.push('/auth');
      return;
    }

    setToken(storedToken);
    setUser(JSON.parse(storedUser));
  }, [router]);

  // Keep dashboard in sync with subscription changes made elsewhere
  useEffect(() => {
    const refresh = () => {
      const t = localStorage.getItem('token');
      const uStr = localStorage.getItem('user');
      if (t) setToken(t);
      if (uStr) setUser(JSON.parse(uStr));
    };

    const onTokenUpdated = () => refresh();
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'user') refresh();
    };

    window.addEventListener('tokenUpdated', onTokenUpdated);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('tokenUpdated', onTokenUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handlePayment = async () => {
    if (!selectedTier) {
      setMessage({ type: 'error', text: 'Please select a subscription tier' });
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
        setMessage({ type: 'success', text: data.message });
        // Update local storage
        const updatedUser = { ...user, subscription: data.subscription };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('token', data.token);
        // Notify app about token change so gated features update immediately
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('tokenUpdated'));
        }
        setToken(data.token);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const generateDHKeys = async () => {
    try {
      const response = await fetch('/api/dh/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setDhKeyPair(data);
      setMessage({ type: 'success', text: 'Diffie-Hellman key pair generated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to generate keys' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Copied to clipboard!' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/">
              <h1 className="text-4xl font-bold text-white mb-2 cursor-pointer hover:text-purple-400 transition">
                Dashboard
              </h1>
            </Link>
            <p className="text-gray-400">Welcome back, {user.name}!</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">
            Logout
          </Button>
        </div>

        {message.text && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-900 border-green-700' : 'bg-red-900 border-red-700'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-200' : 'text-red-200'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Plan</p>
                  <Badge className="mt-1 bg-gradient-to-r from-purple-600 to-pink-600 text-lg px-3 py-1">
                    {user.subscription.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Display */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Your Token</CardTitle>
              <CardDescription className="text-gray-400">
                Copy this token to test on the home page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 p-4 rounded border border-slate-600 break-all font-mono text-sm text-gray-300">
                {token}
              </div>
              <Button
                onClick={() => copyToClipboard(token)}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Copy Token
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="bg-slate-800 border-slate-700 mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Features</CardTitle>
                <CardDescription className="text-gray-400">Access depends on your subscription tier</CardDescription>
              </div>
              <Link href="/subscription">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-0">Manage Subscription</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 rounded">
                <h3 className="text-white font-semibold mb-2">Analytics</h3>
                <ProtectedFeature featureId="basic_analytics_view" requiredTier="free"
                  fallback={<p className="text-sm text-gray-400">Preview charts available. Upgrade for more.</p>}>
                  <p className="text-sm text-gray-300">View dashboards and trends.</p>
                </ProtectedFeature>
                <Link href="/features/analytics">
                  <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">Open Analytics</Button>
                </Link>
              </div>
              <div className="p-4 bg-slate-900 rounded">
                <h3 className="text-white font-semibold mb-2">Content</h3>
                <ProtectedFeature featureId="content_creation" requiredTier="basic"
                  fallback={<p className="text-sm text-gray-400">Read-only preview on Free.</p>}>
                  <p className="text-sm text-gray-300">Create and edit content.</p>
                </ProtectedFeature>
                <Link href="/features/content">
                  <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">Open Content</Button>
                </Link>
              </div>
              <div className="p-4 bg-slate-900 rounded">
                <h3 className="text-white font-semibold mb-2">Reports</h3>
                <ProtectedFeature featureId="standard_reports" requiredTier="basic"
                  fallback={<p className="text-sm text-gray-400">Limited reports on Free.</p>}>
                  <p className="text-sm text-gray-300">Generate and export reports.</p>
                </ProtectedFeature>
                <Link href="/features/reports">
                  <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">Open Reports</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 mb-6">
            <TabsTrigger value="subscription" className="data-[state=active]:bg-purple-600">Subscription</TabsTrigger>
            <TabsTrigger value="diffie-hellman" className="data-[state=active]:bg-purple-600">Diffie-Hellman</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription">
            {/* Subscription Selection */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Choose Your Plan</CardTitle>
                <CardDescription className="text-gray-400">
                  Upgrade your subscription to unlock more features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {SUBSCRIPTION_TIERS.map((tier) => (
                    <div
                      key={tier.name}
                      onClick={() => setSelectedTier(tier.name)}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                        selectedTier === tier.name
                          ? 'border-purple-500 bg-slate-700'
                          : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                      } ${
                        user.subscription === tier.name ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white">{tier.display}</h3>
                        {user.subscription === tier.name && (
                          <Badge className="bg-green-600">Current</Badge>
                        )}
                      </div>
                      <p className="text-3xl font-bold text-purple-400 mb-4">
                        ${tier.price}
                        <span className="text-sm text-gray-400">/month</span>
                      </p>
                      <ul className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start">
                            <span className="text-green-400 mr-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {selectedTier && selectedTier !== user.subscription && (
                  <div className="border-t border-slate-600 pt-6">
                    <h3 className="text-white font-semibold mb-4">Payment Method</h3>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 mb-3">
                        <RadioGroupItem value="demo" id="demo" />
                        <Label htmlFor="demo" className="text-gray-300 cursor-pointer">
                          Demo Payment (Instant Activation)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe" className="text-gray-300 cursor-pointer">
                          Stripe Payment {!process.env.NEXT_PUBLIC_STRIPE_KEY && '(Not configured)'}
                        </Label>
                      </div>
                    </RadioGroup>

                    <Button
                      onClick={handlePayment}
                      disabled={isLoading}
                      className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isLoading ? 'Processing...' : `Upgrade to ${SUBSCRIPTION_TIERS.find(t => t.name === selectedTier)?.display}`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diffie-hellman">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Diffie-Hellman Key Exchange</CardTitle>
                <CardDescription className="text-gray-400">
                  Simulate secure key negotiation between two parties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-gray-300 mb-4">
                    The Diffie-Hellman key exchange allows two parties to establish a shared secret over an insecure channel.
                    This shared secret can then be used as an encryption key.
                  </p>
                  <Button
                    onClick={generateDHKeys}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Generate Key Pair
                  </Button>
                </div>

                {dhKeyPair && (
                  <div className="space-y-4">
                    <div className="bg-slate-900 p-4 rounded">
                      <h4 className="text-white font-semibold mb-2">Public Parameters</h4>
                      <p className="text-gray-400 text-sm">Prime (P): {dhKeyPair.parameters.P}</p>
                      <p className="text-gray-400 text-sm">Generator (G): {dhKeyPair.parameters.G}</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded">
                      <h4 className="text-white font-semibold mb-2">Your Public Key</h4>
                      <p className="text-purple-400 font-mono text-lg">{dhKeyPair.publicKey}</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Share this public key with other parties. They can use it along with their private key to compute the same shared secret.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
