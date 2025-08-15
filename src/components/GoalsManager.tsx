'use client';

import { useState, useEffect } from 'react';

interface Goal {
  id: number;
  title: string;
  description: string;
  points_required: number;
  is_achieved: boolean;
  created_at: string;
  achieved_at?: string;
}

interface GoalsManagerProps {
  currentPoints: number;
  onGoalUpdate?: () => void;
}

export default function GoalsManager({ currentPoints, onGoalUpdate }: GoalsManagerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pointsRequired: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const pointsRequired = parseInt(formData.pointsRequired);
      if (isNaN(pointsRequired) || pointsRequired <= 0) {
        throw new Error('Please enter a valid number of points');
      }

      if (!formData.title.trim()) {
        throw new Error('Please enter a goal title');
      }

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          pointsRequired
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create goal');
      }

      setSuccess('Goal created successfully!');
      setFormData({
        title: '',
        description: '',
        pointsRequired: ''
      });
      setShowForm(false);
      loadGoals();

      if (onGoalUpdate) {
        onGoalUpdate();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleAchieveGoal = async (goalId: number) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/achieve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to achieve goal');
      }

      setSuccess('Congratulations! Goal achieved!');
      loadGoals();

      if (onGoalUpdate) {
        onGoalUpdate();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Goals & Rewards</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          {showForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Goal</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., New toy, Movie night, Special treat"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Describe the reward..."
              />
            </div>

            <div>
              <label htmlFor="pointsRequired" className="block text-sm font-medium text-gray-700 mb-1">
                Points Required
              </label>
              <input
                type="number"
                id="pointsRequired"
                name="pointsRequired"
                value={formData.pointsRequired}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="How many points needed?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No goals set yet. Create your first goal to start earning rewards!
          </p>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  )}
                </div>
                {goal.is_achieved && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">
                    Achieved! 🎉
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>{currentPoints} / {goal.points_required} points</span>
                    <span>{Math.round((currentPoints / goal.points_required) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        goal.is_achieved ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${Math.min(100, (currentPoints / goal.points_required) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                {!goal.is_achieved && currentPoints >= goal.points_required && (
                  <button
                    onClick={() => handleAchieveGoal(goal.id)}
                    className="ml-4 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Claim Reward!
                  </button>
                )}
              </div>

              {goal.achieved_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Achieved on {new Date(goal.achieved_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Goal Templates */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Goal Ideas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => setFormData({ title: 'Small toy or treat', description: 'Something small and fun', pointsRequired: '20' })}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 text-left"
          >
            Small reward (20 pts)
          </button>
          <button
            onClick={() => setFormData({ title: 'Movie night', description: 'Choose a movie for family night', pointsRequired: '50' })}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 text-left"
          >
            Movie night (50 pts)
          </button>
          <button
            onClick={() => setFormData({ title: 'Special outing', description: 'Trip to park, zoo, or fun place', pointsRequired: '100' })}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 text-left"
          >
            Special outing (100 pts)
          </button>
          <button
            onClick={() => setFormData({ title: 'Big reward', description: 'Something special you really want', pointsRequired: '200' })}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 text-left"
          >
            Big reward (200 pts)
          </button>
        </div>
      </div>
    </div>
  );
}
