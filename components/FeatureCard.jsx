'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Check } from 'lucide-react';
import Link from 'next/link';

export default function FeatureCard({ feature, available, requiredTier, currentTier }) {
  return (
    <Card className={`${available ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800 opacity-75'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{feature.icon}</span>
            <div>
              <CardTitle className="text-white text-lg">{feature.name}</CardTitle>
              {!available && requiredTier && (
                <Badge className="mt-1 bg-purple-600 text-xs">
                  {requiredTier.toUpperCase()} Required
                </Badge>
              )}
            </div>
          </div>
          {available ? (
            <Check className="text-green-500 w-5 h-5" />
          ) : (
            <Lock className="text-gray-500 w-5 h-5" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-400 mb-4">
          {feature.description}
        </CardDescription>
        {!available && (
          <Link href="/subscription">
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full">
              Upgrade to Unlock
            </Button>
          </Link>
        )}
        {available && (
          <Badge className="bg-green-600 text-xs">
            ✓ Available on your {currentTier.toUpperCase()} plan
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
