import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, mockStore } from '@/lib/supabase';
import { Profile, UserDiscipline } from '@/types/database.types';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, displayName?: string, discipline?: UserDiscipline) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  switchDemoUser: (userId: string) => void;
  availableDemoUsers: Profile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableDemoUsers, setAvailableDemoUsers] = useState<Profile[]>([]);

  // Fetch initial profile
  const fetchProfile = async (userId: string) => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setProfile(data as Profile);
      } else {
        const p = mockStore.getProfile(userId);
        if (p) {
          setProfile(p);
        } else {
          const first = mockStore.getProfiles()[0];
          setProfile(first || null);
        }
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      setError(null);

      // Load mock demo users for quick switcher (always available for local multi-tab testing)
      setAvailableDemoUsers(mockStore.getProfiles());

      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          // Check if user previously selected a local demo persona in this tab
          const tabDemoUserId = typeof window !== 'undefined' ? sessionStorage.getItem('studio_demo_current_user') : null;
          if (tabDemoUserId) {
            const demoProfile = mockStore.getProfile(tabDemoUserId);
            if (demoProfile) {
              setProfile(demoProfile);
              setLoading(false);
              return;
            }
          }
          setProfile(null);
          setLoading(false);
        }

      } else {
        // Fallback to offline / mock local store
        const current = mockStore.getCurrentUser();
        setProfile(current);
        setLoading(false);
      }
    };

    let subscription: { unsubscribe: () => void } | undefined;

    if (isSupabaseConfigured) {
      const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          const tabDemoUserId = typeof window !== 'undefined' ? sessionStorage.getItem('studio_demo_current_user') : null;
          if (tabDemoUserId) {
            const demoProfile = mockStore.getProfile(tabDemoUserId);
            if (demoProfile) {
              setProfile(demoProfile);
              setLoading(false);
              return;
            }
          }
          setProfile(null);
          setLoading(false);
        }
      });
      subscription = authListener.data.subscription;
    }

    void initializeAuth();

    return () => subscription?.unsubscribe();
  }, []);

  const signIn = async (email: string, password?: string) => {
    setError(null);
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'password123',
        });
        if (error) throw error;
        if (data.user) {
          await fetchProfile(data.user.id);
        }
        return { success: true };
      } else {
        // Mock sign in: check if user exists by username/email
        const username = email.split('@')[0].toLowerCase();
        const profiles = mockStore.getProfiles();
        const existing = profiles.find((p) => p.username === username || p.id === email);

        if (existing) {
          mockStore.setCurrentUser(existing.id);
          setProfile(existing);
        } else {
          const newProfile = mockStore.registerUser(username, email, 'Programmer');
          setProfile(newProfile);
          setAvailableDemoUsers(mockStore.getProfiles());
        }
        setLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
      return { success: false, error: err.message || 'Sign in failed' };
    }
  };

  const signUp = async (
    email: string,
    password?: string,
    displayName?: string,
    discipline: UserDiscipline = 'Programmer'
  ) => {
    setError(null);
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: password || 'password123',
          options: {
            data: {
              display_name: displayName || email.split('@')[0],
              discipline: discipline,
            },
          },
        });
        if (error) throw error;
        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
          return { success: true };
        }
        setProfile(null);
        setLoading(false);
        return { success: true, requiresEmailConfirmation: true };
      } else {
        const newProfile = mockStore.registerUser(
          displayName || email.split('@')[0],
          email,
          discipline
        );
        setProfile(newProfile);
        setAvailableDemoUsers(mockStore.getProfiles());
        setLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      setLoading(false);
      return { success: false, error: err.message || 'Sign up failed' };
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      const message = 'Google sign-in is available after Supabase is configured.';
      setError(message);
      return { success: false, error: message };
    }

    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message || 'Google sign-in could not be started.');
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      mockStore.setCurrentUser(null);
      setProfile(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!profile) return false;
    try {
      const updated = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        mockStore.saveProfile(updated);
        setAvailableDemoUsers(mockStore.getProfiles());
      }

      setProfile(updated);
      return true;
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Update failed');
      return false;
    }
  };

  const switchDemoUser = (userId: string) => {
    const user = mockStore.getProfile(userId);
    if (user) {
      mockStore.setCurrentUser(user.id);
      setProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        error,
        isConfigured: isSupabaseConfigured,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        updateProfile,
        switchDemoUser,
        availableDemoUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
