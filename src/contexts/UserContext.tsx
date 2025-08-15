'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Kid {
  id: number;
  name: string;
  age?: number;
  total_points: number;
}

interface Session {
  parentId: number;
  parentName: string;
  currentKidId?: number;
  currentKidName?: string;
  currentKidAge?: number;
  currentKidPoints?: number;
}

interface UserContextType {
  session: Session | null;
  currentKid: Kid | null;
  allKids: Kid[];
  switchKid: (kid: Kid) => Promise<void>;
  refreshKids: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentKid, setCurrentKid] = useState<Kid | null>(null);
  const [allKids, setAllKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshKids = async () => {
    try {
      const response = await fetch('/api/kids');
      if (response.ok) {
        const data = await response.json();
        setAllKids(data.kids);
      }
    } catch (error) {
      console.error('Failed to fetch kids:', error);
    }
  };

  const switchKid = async (kid: Kid) => {
    try {
      const response = await fetch(`/api/kids/${kid.id}/switch`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        setCurrentKid(kid);
        // Refresh kids data to get updated points
        await refreshKids();
      }
    } catch (error) {
      console.error('Failed to switch kid:', error);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      setCurrentKid(null);
      setAllKids([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    // Check if parent is logged in and load session
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();

          // Check if session has required parent data
          if (data.session && data.session.parentId) {
            setSession(data.session);

            // If there's a current kid in the session, set it
            if (data.session.currentKidId) {
              setCurrentKid({
                id: data.session.currentKidId,
                name: data.session.currentKidName,
                age: data.session.currentKidAge,
                total_points: data.session.currentKidPoints || 0
              });
            }

            await refreshKids();

            // If no current kid is selected but kids exist, auto-switch to first kid
            if (!data.session.currentKidId) {
              const kidsResponse = await fetch('/api/kids');
              if (kidsResponse.ok) {
                const kidsData = await kidsResponse.json();
                if (kidsData.kids && kidsData.kids.length > 0) {
                  const firstKid = kidsData.kids[0];
                  // Auto-switch to first kid
                  const switchResponse = await fetch(`/api/kids/${firstKid.id}/switch`, {
                    method: 'POST',
                  });
                  if (switchResponse.ok) {
                    const switchData = await switchResponse.json();
                    setSession(switchData.session);
                    setCurrentKid({
                      id: switchData.session.currentKidId,
                      name: switchData.session.currentKidName,
                      age: switchData.session.currentKidAge,
                      total_points: switchData.session.currentKidPoints || 0
                    });
                  }
                }
              }
            }
          } else {
            // Invalid or empty session, clear everything
            setSession(null);
            setCurrentKid(null);
            setAllKids([]);
          }
        } else {
          // Not authenticated, clear everything
          setSession(null);
          setCurrentKid(null);
          setAllKids([]);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // On error, clear everything
        setSession(null);
        setCurrentKid(null);
        setAllKids([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{
      session,
      currentKid,
      allKids,
      switchKid,
      refreshKids,
      logout,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
