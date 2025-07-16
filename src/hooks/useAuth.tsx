
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Check for master admin status
    const masterAdminStatus = localStorage.getItem('masterAdmin') === 'true';
    setIsMasterAdmin(masterAdminStatus);

    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (mounted && !error) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          console.log('Auth state changed:', event, session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Clear master admin status if regular user logs in
          if (session?.user) {
            setIsMasterAdmin(false);
            localStorage.removeItem('masterAdmin');
          }
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // Also clear master admin status
    setIsMasterAdmin(false);
    localStorage.removeItem('masterAdmin');
  };

  return {
    user,
    session,
    loading,
    signOut,
    isMasterAdmin
  };
};
