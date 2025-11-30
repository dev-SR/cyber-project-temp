'use client';

import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { hasFeatureAccess, getStoredToken, verifyUserToken } from '@/lib/accessControl';

export default function ProtectedFeature({ featureId, requiredTier, children, fallback }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [currentTier, setCurrentTier] = useState('free');
  const [loading, setLoading] = useState(true);

  const refreshAccess = useCallback(() => {
    const token = getStoredToken();
    if (token) {
      const verification = verifyUserToken(token);
      if (verification.valid) {
        setCurrentTier(verification.tier);
        setHasAccess(hasFeatureAccess(verification.tier, featureId));
      } else {
        setCurrentTier('free');
        setHasAccess(false);
      }
    } else {
      setCurrentTier('free');
      setHasAccess(false);
    }
    setLoading(false);
  }, [featureId]);

  useEffect(() => {
    // Initial check
    refreshAccess();

    // Listen for token changes across the app
    const onTokenUpdated = () => refreshAccess();
    const onStorage = (e) => {
      if (e.key === 'token') refreshAccess();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshAccess();
    };

    window.addEventListener('tokenUpdated', onTokenUpdated);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('tokenUpdated', onTokenUpdated);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refreshAccess]);

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
