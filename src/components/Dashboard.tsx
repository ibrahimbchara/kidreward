'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import UserSwitcher from '@/components/UserSwitcher';



interface Stats {
  totalPoints: number;
  totalRewards: number;
  totalPenalties: number;
  goalsAchieved: number;
  goalsTotal: number;
}

interface PointTransaction {
  id: number;
  points: number;
  description: string;
  type: 'reward' | 'penalty';
  created_at: string;
}

interface Goal {
  id: number;
  title: string;
  description: string;
  points_required: number;
  is_achieved: boolean;
  created_at: string;
  achieved_at?: string;
}

export default function Dashboard() {
  const { currentKid, session, logout: userLogout, loading: contextLoading } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<PointTransaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load user stats
      const statsResponse = await fetch('/api/user/stats');
      if (!statsResponse.ok) {
        if (statsResponse.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load stats');
      }
      const statsData = await statsResponse.json();
      setStats(statsData.stats);

      // Load point history
      const historyResponse = await fetch('/api/points/history?limit=10');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history);
      }

      // Load goals
      const goalsResponse = await fetch('/api/goals');
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setGoals(goalsData.goals);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (currentKid) {
      loadDashboardData();
    }
  }, [currentKid, loadDashboardData]);

  const handleLogout = async () => {
    try {
      await userLogout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (contextLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !session.parentId) {
    // Not logged in or invalid session, redirect to login
    router.push('/login');
    return null;
  }

  if (!currentKid) {
    // Logged in but no kid selected, redirect to add-kid
    router.push('/add-kid');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
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
                <span className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </span>
                <a
                  href="/manage"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Manage
                </a>
                <a
                  href="/history"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  History
                </a>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">★</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">+</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Rewards Earned</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalRewards}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">-</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Penalties</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalPenalties}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Goals</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.goalsAchieved}/{stats.goalsTotal}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No activity yet</p>
              ) : (
                <div className="space-y-4">
                  {history.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          transaction.type === 'reward' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold ${
                        transaction.type === 'reward' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'reward' ? '+' : ''}{transaction.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Goals</h2>
            </div>
            <div className="p-6">
              {goals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No goals set yet</p>
              ) : (
                <div className="space-y-4">
                  {goals.slice(0, 5).map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{goal.title}</h3>
                        {goal.is_achieved && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Achieved!
                          </span>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {goal.points_required} points required
                        </span>
                        {!goal.is_achieved && stats && (
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{
                                  width: `${Math.min(100, (stats.totalPoints / goal.points_required) * 100)}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {Math.round((stats.totalPoints / goal.points_required) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
