import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { queryClient } from '../lib/queryClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUserState] = useState(null);
    const userIdentityRef = useRef(null);
    const [status, setStatus] = useState('loading');
    const [authError, setAuthError] = useState('');

    const setUser = useCallback((nextUser) => {
        const nextIdentity = nextUser ? String(nextUser.id) + ':' + String(nextUser.role) : null;
        if (userIdentityRef.current !== nextIdentity) {
            queryClient.clear();
            userIdentityRef.current = nextIdentity;
        }
        setUserState(nextUser);
        setStatus(nextUser ? 'authenticated' : 'guest');
        setAuthError('');
    }, []);

    const refreshUser = useCallback(async () => {
        setStatus('loading');
        setAuthError('');
        try {
            const { data } = await axios.get('/api/v1/auth/me');
            setUser(data.data);
            return data.data;
        } catch (error) {
            if (error.response?.status === 401) {
                setUser(null);
                return null;
            }
            setStatus('error');
            setAuthError('وضعیت حساب از سرور دریافت نشد. اتصال را بررسی و دوباره تلاش کنید.');
            return null;
        }
    }, [setUser]);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    useEffect(() => {
        const interceptorId = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && error.config?.url?.startsWith('/api/v1/')) {
                    setUser(null);
                }
                return Promise.reject(error);
            },
        );

        return () => axios.interceptors.response.eject(interceptorId);
    }, [setUser]);

    const logout = useCallback(async () => {
        await axios.post('/api/v1/auth/logout');
        setUser(null);
    }, [setUser]);

    const value = useMemo(() => ({
        user,
        setUser,
        status,
        authError,
        refreshUser,
        logout,
    }), [user, setUser, status, authError, refreshUser, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
