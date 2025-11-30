"use client";

import ProtectedFeature from '@/components/ProtectedFeature';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

function DemoChart() {
  return (
    <div className="h-40 w-full bg-slate-900 border border-slate-700 rounded grid grid-cols-12 gap-1 p-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-slate-700 rounded" style={{ height: `${20 + ((i * 7) % 60)}%` }} />
      ))}
    </div>
  );
}

export default function AnalyticsFeaturePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-gray-400">Interactive charts with tier-based functionality</p>
          </div>
          <Link href="/subscription">
            <Button className="bg-purple-600 hover:bg-purple-700">Manage Subscription</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Free: Basic analytics viewing */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Overview (Free)</CardTitle>
              <CardDescription className="text-gray-400">Basic analytics preview</CardDescription>
            </CardHeader>
            <CardContent>
              <ProtectedFeature featureId="basic_analytics_view" requiredTier="free"
                fallback={
                  <div>
                    <DemoChart />
                    <Alert className="mt-3 bg-slate-900 border-slate-700">
                      <AlertDescription className="text-gray-300">Preview mode. Upgrade to unlock more metrics.</AlertDescription>
                    </Alert>
                  </div>
                }>
                <DemoChart />
                <div className="mt-3 text-sm text-gray-300">Daily active users, sessions, and bounce rate.</div>
              </ProtectedFeature>
            </CardContent>
          </Card>

          {/* Basic: Advanced analytics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Trends (Basic)</CardTitle>
              <CardDescription className="text-gray-400">Advanced analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <ProtectedFeature featureId="advanced_analytics" requiredTier="basic"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">Requires Basic plan.</AlertDescription></Alert>}>
                <DemoChart />
                <div className="mt-3 text-sm text-gray-300">Cohort analysis, retention curves, segmentation.</div>
              </ProtectedFeature>
            </CardContent>
          </Card>

          {/* Premium: Real-time analytics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Live (Premium)</CardTitle>
              <CardDescription className="text-gray-400">Real-time analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <ProtectedFeature featureId="real_time_analytics" requiredTier="premium"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">Requires Premium plan.</AlertDescription></Alert>}>
                <DemoChart />
                <div className="mt-3 text-sm text-gray-300">Live users online, events per minute, geo heatmap.</div>
              </ProtectedFeature>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
