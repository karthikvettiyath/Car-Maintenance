
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(() => Boolean(supabase));

    const fetchUserRole = async (userId) => {
        if (!supabase || !userId) {
            setRole('user');
            return 'user';
        }
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('AuthProvider: Could not fetch profile role, defaulting to user', error);
                setRole('user');
                return 'user';
            }
            const userRole = data?.role || 'user';
            setRole(userRole);
            return userRole;
        } catch (err) {
            console.error('AuthProvider: Error fetching role', err);
            setRole('user');
            return 'user';
        }
    };

    useEffect(() => {
        console.log('AuthProvider: Initializing...');
        if (!supabase) {
            console.error('AuthProvider: Supabase client is null');
            return;
        }

        // Check active sessions and sets the user
        supabase.auth.getSession().then(async ({ data: { session }, error }) => {
            console.log('AuthProvider: getSession result', { session, error });
            if (error) console.error('AuthProvider: session error', error);
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchUserRole(session.user.id);
            }
            setLoading(false);
        }).catch(err => {
            console.error('AuthProvider: Unexpected error getting session', err);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('AuthProvider: Auth state changed', _event);
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchUserRole(session.user.id);
            } else {
                setRole(null);
            }
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
        resetPassword: (email) => supabase
            ? supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            : Promise.reject(new Error('Supabase is not configured.')),
        updatePassword: (newPassword) => supabase
            ? supabase.auth.updateUser({ password: newPassword })
            : Promise.reject(new Error('Supabase is not configured.')),
        user,
        session,
        role,
        isAdmin: role === 'admin',
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
