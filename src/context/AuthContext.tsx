"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Cookies from 'js-cookie';

interface User {
    id: string;
    email: string;
    role: string;
    tenantId: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                const userData = {
                    id: session.user.id,
                    email: session.user.email!,
                    role: session.user.user_metadata.role || 'user',
                    tenantId: session.user.user_metadata.tenantId || 'default'
                };
                setUser(userData);
                Cookies.set('auth_token', session.access_token, { expires: 1 });
            }
            setLoading(false);
        };

        getSession();

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                const userData = {
                    id: session.user.id,
                    email: session.user.email!,
                    role: session.user.user_metadata.role || 'user',
                    tenantId: session.user.user_metadata.tenantId || 'default'
                };
                setUser(userData);
                Cookies.set('auth_token', session.access_token, { expires: 1 });
            } else {
                setUser(null);
                Cookies.remove('auth_token');
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async ({ email, password }: any) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        if (data.session) {
            router.push('/dashboard');
        }
    };

    const register = async ({ email, password, name, role = 'user', tenantId = 'default' }: any) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role,
                    tenantId
                }
            }
        });

        if (error) throw error;

        if (data.session) {
            router.push('/dashboard');
        } else {
            // Probably need email confirmation
            alert("Check your email for the confirmation link!");
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
