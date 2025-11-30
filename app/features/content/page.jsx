"use client";

import ProtectedFeature from '@/components/ProtectedFeature';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ContentFeaturePage() {
  const [text, setText] = useState('Welcome to the editor. Upgrade to edit or create content.');

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Content</h1>
            <p className="text-gray-400">Create and edit content with tier-based permissions</p>
          </div>
          <Link href="/subscription">
            <Button className="bg-purple-600 hover:bg-purple-700">Manage Subscription</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Free: Preview only */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Preview (Free)</CardTitle>
              <CardDescription className="text-gray-400">Read-only preview</CardDescription>
            </CardHeader>
            <CardContent>
              <ProtectedFeature featureId="content_preview" requiredTier="free"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">Login to preview content.</AlertDescription></Alert>}>
                <div className="p-3 bg-slate-900 border border-slate-700 rounded text-gray-200 text-sm">
                  {text}
                </div>
              </ProtectedFeature>
            </CardContent>
          </Card>

          {/* Basic: Creation */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Create (Basic)</CardTitle>
              <CardDescription className="text-gray-400">Create new content</CardDescription>
            </CardHeader>
            <CardContent>
              <ProtectedFeature featureId="content_creation" requiredTier="basic"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">Requires Basic plan to create content.</AlertDescription></Alert>}>
                <textarea value={text} onChange={(e)=>setText(e.target.value)} className="w-full h-32 bg-slate-900 border border-slate-700 rounded p-2 text-gray-200" />
                <Button className="mt-3 bg-blue-600 hover:bg-blue-700">Save Draft</Button>
              </ProtectedFeature>
            </CardContent>
          </Card>

          {/* Premium: Editing & AI */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Editing & AI (Premium)</CardTitle>
              <CardDescription className="text-gray-400">Full editing and AI generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProtectedFeature featureId="content_editing" requiredTier="premium"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">Requires Premium for advanced editing.</AlertDescription></Alert>}>
                <div className="flex gap-2">
                  <Button className="bg-green-600 hover:bg-green-700">Publish</Button>
                  <Button variant="outline" className="border-slate-600 text-gray-200">Version History</Button>
                </div>
              </ProtectedFeature>

              <ProtectedFeature featureId="ai_content_generation" requiredTier="premium"
                fallback={<Alert className="bg-slate-900 border-slate-700"><AlertDescription className="text-gray-300">AI generation available on Premium.</AlertDescription></Alert>}>
                <Button className="bg-pink-600 hover:bg-pink-700">Generate with AI</Button>
              </ProtectedFeature>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
