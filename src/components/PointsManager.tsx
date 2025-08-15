'use client';

import { useState } from 'react';

interface PointsManagerProps {
  onPointsAdded?: () => void;
}

export default function PointsManager({ onPointsAdded }: PointsManagerProps) {
  const [formData, setFormData] = useState({
    points: '',
    description: '',
    type: 'reward' as 'reward' | 'penalty'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const points = parseInt(formData.points);
      if (isNaN(points) || points === 0) {
        throw new Error('Please enter a valid number of points');
      }

      if (!formData.description.trim()) {
        throw new Error('Please enter a description');
      }

      // For penalties, make points negative
      const finalPoints = formData.type === 'penalty' ? -Math.abs(points) : Math.abs(points);

      const response = await fetch('/api/points/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: finalPoints,
          description: formData.description.trim(),
          type: formData.type
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add points');
      }

      setSuccess(`Successfully ${formData.type === 'reward' ? 'added' : 'deducted'} ${Math.abs(finalPoints)} points!`);
      setFormData({
        points: '',
        description: '',
        type: 'reward'
      });

      if (onPointsAdded) {
        onPointsAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Add Points</h2>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="reward">Reward (Good Behavior)</option>
            <option value="penalty">Penalty (Bad Behavior)</option>
          </select>
        </div>

        <div>
          <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
            Points
          </label>
          <input
            type="number"
            id="points"
            name="points"
            value={formData.points}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            placeholder="Enter number of points"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            placeholder="Describe what this is for..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            formData.type === 'reward'
              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
          }`}
        >
          {loading ? 'Adding...' : (
            formData.type === 'reward' ? 'Add Reward Points' : 'Deduct Penalty Points'
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFormData({ points: '5', description: 'Helped with chores', type: 'reward' })}
            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
          >
            +5 Chores
          </button>
          <button
            onClick={() => setFormData({ points: '10', description: 'Good behavior at school', type: 'reward' })}
            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
          >
            +10 School
          </button>
          <button
            onClick={() => setFormData({ points: '3', description: 'Forgot to clean room', type: 'penalty' })}
            className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
          >
            -3 Room
          </button>
          <button
            onClick={() => setFormData({ points: '5', description: 'Misbehavior', type: 'penalty' })}
            className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
          >
            -5 Behavior
          </button>
        </div>
      </div>
    </div>
  );
}
