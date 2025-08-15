'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';

export default function UserSwitcher() {
  const { currentKid, allKids, switchKid } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentKid || allKids.length <= 1) {
    return null;
  }

  const otherKids = allKids.filter(kid => kid.id !== currentKid.id);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
      >
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {currentKid.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{currentKid.name}</span>
          {currentKid.age && (
            <span className="text-xs text-blue-600">Age {currentKid.age}</span>
          )}
        </div>
        <span className="text-xs bg-blue-200 px-2 py-1 rounded-full">
          {currentKid.total_points} pts
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Switch Kid</h3>
              <p className="text-xs text-gray-500">Select which kid to manage</p>
            </div>
            
            <div className="py-2">
              {otherKids.map((kid) => (
                <button
                  key={kid.id}
                  onClick={() => {
                    switchKid(kid);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {kid.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">
                      {kid.name} {kid.age && `(${kid.age})`}
                    </div>
                    <div className="text-sm text-gray-500">{kid.total_points} points</div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-gray-200 space-y-2">
              <a
                href="/settings"
                className="block w-full text-center bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                ⚙️ Settings
              </a>
              <a
                href="/add-kid"
                className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                + Add Another Kid
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
