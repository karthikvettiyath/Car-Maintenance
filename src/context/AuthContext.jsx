
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
        signUp: async (data) => {
            if (!supabase) throw new Error('Supabase is not configured.');
            const result = await supabase.auth.signUp(data);
            if (!result.error && result.data?.user) {
                const chosenRole = data.options?.data?.role || 'user';
                // The DB trigger creates a profile with role='user' by default.
                // Update the profile to the chosen role after signup.
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ role: chosenRole })
                    .eq('id', result.data.user.id);

                if (updateError) {
                    console.warn('Could not update profile role after signup:', updateError);
                }

                setUser(result.data.user);
                setSession(result.data.session || { user: result.data.user });
                setRole(chosenRole);
            }
            return result;
        },
        signIn: async (data) => {
            if (!supabase) throw new Error('Supabase is not configured.');
            const result = await supabase.auth.signInWithPassword(data);
            if (!result.error && result.data?.user) {
                // Directly update state so route guards see the user immediately
                setUser(result.data.user);
                setSession({ user: result.data.user });
                await fetchUserRole(result.data.user.id);
            }
            return result;
        },
        signOut: async () => {
            if (!supabase) throw new Error('Supabase is not configured.');
            const result = await supabase.auth.signOut();
            if (!result.error) {
                // Immediately clear state so route guards redirect to login
                setUser(null);
                setSession(null);
                setRole(null);
            }
            return result;
        },
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
        isDealer: role === 'dealer',
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
