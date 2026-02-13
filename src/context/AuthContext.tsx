import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
    _id: string;
    email: string;
    full_name: string;
    role: 'freelancer' | 'client';
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: any) => Promise<void>;
    signup: (userData: any) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/me');
                    // If the token is valid, we might want to store the full user object if the /me endpoint returns it
                    // For now, assuming /me returns the user object without the token, and we keep the token in local storage
                    // We need to match the User interface.
                    setUser({ ...data, token });
                } catch (error) {
                    console.error('Auth check failed', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (userData: any) => {
        const { data } = await api.post('/auth/login', userData);
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const signup = async (userData: any) => {
        const { data } = await api.post('/auth/signup', userData);
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
