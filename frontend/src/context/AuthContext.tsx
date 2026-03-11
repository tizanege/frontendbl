"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
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
        const savedUser = Cookies.get('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: any) => {
        const { data } = await api.post('/auth/login', credentials);
        const { access_token, user: userData } = data;

        Cookies.set('auth_token', access_token, { expires: 1 });
        Cookies.set('user', JSON.stringify(userData), { expires: 1 });
        Cookies.set('tenant_id', userData.tenantId, { expires: 1 });

        setUser(userData);
        router.push('/dashboard');
    };

    const register = async (regData: any) => {
        const { data } = await api.post('/auth/register', regData);
        const { access_token, user: userData } = data;

        Cookies.set('auth_token', access_token, { expires: 1 });
        Cookies.set('user', JSON.stringify(userData), { expires: 1 });
        Cookies.set('tenant_id', userData.tenantId, { expires: 1 });

        setUser(userData);
        router.push('/dashboard');
    };

    const logout = () => {
        Cookies.remove('auth_token');
        Cookies.remove('user');
        Cookies.remove('tenant_id');
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
