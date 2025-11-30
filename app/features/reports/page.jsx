"use client";

import ProtectedFeature from '@/components/ProtectedFeature';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

function ReportPreview({ days }) {
  return (
    <div className="p-3 bg-slate-900 border border-slate-700 rounded text-sm text-gray-300">
      Showing sample report data for last {days} days...
    </div>
  );
}

export default function ReportsFeaturePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports</h1>
            <p className="text-gray-400">Generate, preview, and export reports based on your tier</p>
          </div>
          <Link href="/subscription">
            <Button className="bg-purple-600 hover:bg-purple-700">Manage Subscription</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Free: Limited reports */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Limited (Free)</CardTitle>
              <CardDescription className="text-gray-400">7-day basic report</CardDescription>
            </CardHeader>
            <CardContent>
              <ProtectedFeature featureId="limited_reports" requiredTier="free"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">Login to preview limited reports.</AlertDescription></Alert>}>
                <ReportPreview days={7} />
              </ProtectedFeature>
            </CardContent>
          </Card>

          {/* Basic: Standard reports + CSV export */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Standard (Basic)</CardTitle>
              <CardDescription className="text-gray-400">30-day report with CSV export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProtectedFeature featureId="standard_reports" requiredTier="basic"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">Requires Basic plan.</AlertDescription></Alert>}>
                <ReportPreview days={30} />
              </ProtectedFeature>

              <ProtectedFeature featureId="export_csv" requiredTier="basic"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">CSV export requires Basic plan.</AlertDescription></Alert>}>
                <Button className="bg-blue-600 hover:bg-blue-700">Export CSV</Button>
              </ProtectedFeature>
            </CardContent>
          </Card>

          {/* Premium: Advanced reports + PDF export + Custom builder */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Advanced (Premium)</CardTitle>
              <CardDescription className="text-gray-400">Unlimited range, PDF export, custom builder</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProtectedFeature featureId="advanced_reports" requiredTier="premium"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">Requires Premium plan.</AlertDescription></Alert>}>
                <ReportPreview days={90} />
              </ProtectedFeature>

              <ProtectedFeature featureId="export_pdf" requiredTier="premium"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">PDF export requires Premium.</AlertDescription></Alert>}>
                <Button className="bg-red-600 hover:bg-red-700">Export PDF</Button>
              </ProtectedFeature>

              <ProtectedFeature featureId="custom_reports" requiredTier="premium"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">Custom builder available on Premium.</AlertDescription></Alert>}>
                <Button variant="outline" className="border-slate-600 text-gray-200">Open Custom Builder</Button>
              </ProtectedFeature>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
