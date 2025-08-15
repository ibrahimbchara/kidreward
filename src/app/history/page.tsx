'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import UserSwitcher from '@/components/UserSwitcher';

interface PointTransaction {
  id: number;
  points: number;
  description: string;
  type: 'reward' | 'penalty';
  created_at: string;
}

export default function HistoryPage() {
  const { currentKid, session, logout: userLogout, loading: contextLoading } = useUser();
  const [history, setHistory] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(50);
  const router = useRouter();

  useEffect(() => {
    if (currentKid) {
      loadHistory();
    }
  }, [currentKid, limit, loadHistory]);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/points/history?limit=${limit}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load history');
      }
      
      const data = await response.json();
      setHistory(data.history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [limit, router]);

  const handleLogout = async () => {
    try {
      await userLogout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRunningTotal = (index: number) => {
    return history.slice(index).reduce((total, transaction) => total + transaction.points, 0);
  };

  if (contextLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  if (!currentKid) {
    router.push('/add-kid');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Kid Rewards</h1>
              <nav className="flex space-x-4">
                <a
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/manage"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Manage
                </a>
                <span className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  History
                </span>
                <a
                  href="/settings"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <UserSwitcher />
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Activity History</h2>
              <div className="flex items-center space-x-2">
                <label htmlFor="limit" className="text-sm text-gray-600">Show:</label>
                <select
                  id="limit"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white"
                >
                  <option value={25}>25 entries</option>
                  <option value={50}>50 entries</option>
                  <option value={100}>100 entries</option>
                  <option value={200}>200 entries</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          )}

          <div className="p-6">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <p className="text-gray-500 text-lg">No activity yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Start earning points to see your history here!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((transaction, index) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                        transaction.type === 'reward' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'reward' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'reward' ? '+' : ''}{transaction.points}
                      </div>
                      <div className="text-sm text-gray-500">
                        Running total: {getRunningTotal(index)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Showing {history.length} most recent entries</span>
                <div className="flex space-x-4">
                  <span>
                    Total Rewards: <span className="font-medium text-green-600">
                      +{history.filter(t => t.type === 'reward').reduce((sum, t) => sum + t.points, 0)}
                    </span>
                  </span>
                  <span>
                    Total Penalties: <span className="font-medium text-red-600">
                      {history.filter(t => t.type === 'penalty').reduce((sum, t) => sum + t.points, 0)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
