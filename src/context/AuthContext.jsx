
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(() => Boolean(supabase));

    useEffect(() => {
        console.log('AuthProvider: Initializing...');
        if (!supabase) {
            console.error('AuthProvider: Supabase client is null');
            return;
        }

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            console.log('AuthProvider: getSession result', { session, error });
            if (error) console.error('AuthProvider: session error', error);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        }).catch(err => {
            console.error('AuthProvider: Unexpected error getting session', err);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('AuthProvider: Auth state changed', _event);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        signUp: (data) => supabase
            ? supabase.auth.signUp(data)
            : Promise.reject(new Error('Supabase is not configured.')),
        signIn: (data) => supabase
            ? supabase.auth.signInWithPassword(data)
            : Promise.reject(new Error('Supabase is not configured.')),
        signOut: () => supabase
            ? supabase.auth.signOut()
            : Promise.reject(new Error('Supabase is not configured.')),
        user,
        session,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
