'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { hasFeatureAccess, getStoredToken, verifyUserToken } from '@/lib/accessControl';

export default function ProtectedFeature({ featureId, requiredTier, children, fallback }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [currentTier, setCurrentTier] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const verification = verifyUserToken(token);
      if (verification.valid) {
        setCurrentTier(verification.tier);
        setHasAccess(hasFeatureAccess(verification.tier, featureId));
      }
    }
    setLoading(false);
  }, [featureId]);

  if (loading) {
    return (
      <div className="text-gray-400 p-4">Loading...</div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <Alert className="bg-slate-800 border-slate-600">
        <Lock className="h-4 w-4 text-purple-400" />
        <AlertDescription className="text-gray-300">
          <div className="flex items-center justify-between">
            <span>This feature requires a {requiredTier?.toUpperCase() || 'higher'} subscription.</span>
            <Link href="/subscription">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
