'use client';

import { useUser } from '@/contexts/UserContext';
import { useState, useEffect } from 'react';

export default function DebugPage() {
  const { session, currentKid, allKids, loading } = useUser();
  const [authData, setAuthData] = useState<unknown>(null);
  const [kidsData, setKidsData] = useState<unknown>(null);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        const authResponse = await fetch('/api/auth/me');
        const authResult = await authResponse.json();
        setAuthData({ status: authResponse.status, data: authResult });

        const kidsResponse = await fetch('/api/kids');
        const kidsResult = await kidsResponse.json();
        setKidsData({ status: kidsResponse.status, data: kidsResult });
      } catch (error) {
        console.error('Debug fetch error:', error);
      }
    };

    fetchDebugData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">UserContext State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
              <div><strong>Session:</strong> {JSON.stringify(session, null, 2)}</div>
              <div><strong>Current Kid:</strong> {JSON.stringify(currentKid, null, 2)}</div>
              <div><strong>All Kids:</strong> {JSON.stringify(allKids, null, 2)}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Responses</h2>
            <div className="space-y-4 text-sm">
              <div>
                <strong>/api/auth/me:</strong>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(authData, null, 2)}
                </pre>
              </div>
              <div>
                <strong>/api/kids:</strong>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(kidsData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.href = '/register'}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Go to Register
            </button>
            <button
              onClick={() => window.location.href = '/add-kid'}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Go to Add Kid
            </button>
            <button
              onClick={() => {
                document.cookie.split(";").forEach(function(c) { 
                  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                window.location.reload();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Cookies & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
