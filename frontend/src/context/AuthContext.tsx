"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Cookies from 'js-cookie';
import api from '@/lib/api';

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
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Store the Supabase access token as the Bearer token
                Cookies.set('auth_token', session.access_token, { expires: 1 });
                const userData = {
                    id: session.user.id,
                    email: session.user.email!,
                    role: session.user.user_metadata?.role || 'admin',
                    tenantId: session.user.user_metadata?.tenantId || 'default',
                };
                setUser(userData);
            } else {
                Cookies.remove('auth_token');
                Cookies.remove('user');
                Cookies.remove('tenant_id');
                setUser(null);
            }
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                // Always keep cookie fresh with latest Supabase access_token
                Cookies.set('auth_token', session.access_token, { expires: 1 });
                const userData = {
                    id: session.user.id,
                    email: session.user.email!,
                    role: session.user.user_metadata?.role || 'admin',
                    tenantId: session.user.user_metadata?.tenantId || 'default',
                };
                setUser(userData);
            } else {
                setUser(null);
                Cookies.remove('auth_token');
                Cookies.remove('user');
                Cookies.remove('tenant_id');
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async ({ email, password }: any) => {
        try {
            // 1. Sign in via Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            if (data.session) {
                // 2. Store the Supabase JWT — the backend validates this via JWKS
                Cookies.set('auth_token', data.session.access_token, { expires: 1 });
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error("Supabase login error:", err);
            if (err.message === "Failed to fetch" || err.name === "TypeError") {
                throw new Error("Unable to reach the Supabase authentication server. Please verify your internet connection or check if an ad-blocker/firewall is blocking request to Supabase.");
            }
            throw err;
        }
    };

    const register = async ({ email, password, firstName, lastName, companyName, name }: any) => {
        const fullName = name || `${firstName || ''} ${lastName || ''}`.trim();
        const company = companyName || fullName;

        // 1. Sign up in Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role: 'admin' }
            }
        });
        if (signUpError) throw signUpError;

        // 2. Create tenant + user record in backend DB
        // Use the Supabase session token if available, otherwise use password flow
        if (signUpData.session) {
            Cookies.set('auth_token', signUpData.session.access_token, { expires: 1 });
        }

        try {
            await api.post('/auth/register', {
                firstName: firstName || fullName.split(' ')[0],
                lastName: lastName || fullName.split(' ').slice(1).join(' ') || '-',
                email,
                password,   // backend hashes this for local lookup fallback
                companyName: company,
            });
        } catch (err: any) {
            // If user already exists in backend DB (e.g. re-register), ignore duplicate errors
            if (!err.response?.data?.message?.includes('already exists')) {
                throw err;
            }
        }

        if (signUpData.session) {
            router.push('/dashboard');
        } else {
            alert("Please check your email to confirm your account, then log in.");
            router.push('/login');
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        Cookies.remove('auth_token');
        Cookies.remove('user');
        Cookies.remove('tenant_id');
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
