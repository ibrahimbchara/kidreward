'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import PointsManager from '@/components/PointsManager';
import GoalsManager from '@/components/GoalsManager';
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

export default function ManagePage() {
  const { currentKid, session, logout: userLogout, loading: contextLoading } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<PointTransaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'points' | 'goals'>('points');
  const router = useRouter();

  useEffect(() => {
    if (currentKid) {
      loadStats();
    }
  }, [currentKid]);

  const loadStats = async () => {
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

      // Load recent transactions
      const historyResponse = await fetch('/api/points/history?limit=5');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setRecentTransactions(historyData.history);
      }

      // Load goals
      const goalsResponse = await fetch('/api/goals');
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setGoals(goalsData.goals);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

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
                <span className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Manage
                </span>
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
              {stats && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{stats.totalPoints}</span> points
                </div>
              )}
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
        {/* Current Points Display */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalPoints} Points
              </h2>
              <p className="text-gray-600">
                {stats.totalRewards} earned • {stats.totalPenalties} lost • {stats.goalsAchieved}/{stats.goalsTotal} goals achieved
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('points')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'points'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Add Points
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'goals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Goals & Rewards
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {activeTab === 'points' && (
            <>
              <PointsManager onPointsAdded={loadStats} />
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {recentTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
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
                        <span className={`font-bold text-sm ${
                          transaction.type === 'reward' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'reward' ? '+' : ''}{transaction.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Goal Progress */}
                {goals.length > 0 && stats && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Goal Progress</h4>
                    <div className="space-y-3">
                      {goals.filter(goal => !goal.is_achieved).slice(0, 3).map((goal) => (
                        <div key={goal.id} className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-900">{goal.title}</span>
                            <span className="text-xs text-gray-600">
                              {stats.totalPoints}/{goal.points_required} pts
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, (stats.totalPoints / goal.points_required) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {Math.max(0, goal.points_required - stats.totalPoints)} points needed
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'goals' && (
            <>
              <GoalsManager
                currentPoints={stats?.totalPoints || 0}
                onGoalUpdate={loadStats}
              />
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Summary</h3>
                {goals.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No goals set yet. Create your first goal!</p>
                ) : (
                  <div className="space-y-4">
                    {/* Achieved Goals */}
                    {goals.filter(goal => goal.is_achieved).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2">🎉 Achieved Goals</h4>
                        <div className="space-y-2">
                          {goals.filter(goal => goal.is_achieved).map((goal) => (
                            <div key={goal.id} className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-green-900">{goal.title}</span>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                  {goal.points_required} pts
                                </span>
                              </div>
                              {goal.achieved_at && (
                                <p className="text-xs text-green-600 mt-1">
                                  Achieved on {new Date(goal.achieved_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Active Goals */}
                    {goals.filter(goal => !goal.is_achieved).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-blue-700 mb-2">🎯 Active Goals</h4>
                        <div className="space-y-3">
                          {goals.filter(goal => !goal.is_achieved).map((goal) => (
                            <div key={goal.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-blue-900">{goal.title}</span>
                                <span className="text-xs text-blue-600">
                                  {stats?.totalPoints || 0}/{goal.points_required} pts
                                </span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(100, ((stats?.totalPoints || 0) / goal.points_required) * 100)}%`
                                  }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-blue-600">
                                  {Math.max(0, goal.points_required - (stats?.totalPoints || 0))} points needed
                                </span>
                                <span className="text-blue-600">
                                  {Math.round(((stats?.totalPoints || 0) / goal.points_required) * 100)}% complete
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
