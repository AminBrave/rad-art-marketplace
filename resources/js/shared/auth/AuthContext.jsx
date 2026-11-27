import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';

const AuthContext = createContext(null);

function readInitialAuth() {
    if (typeof document === 'undefined') {
        return { available: false, user: null };
    }

    const bootstrap = document.getElementById('rad-auth-bootstrap');
    if (!bootstrap) {
        return { available: false, user: null };
    }

    try {
        const user = JSON.parse(bootstrap.textContent || 'null');
        if (user === null) {
            return { available: true, user: null };
        }

        const validUser = user
            && Number.isInteger(user.id) && user.id > 0
            && typeof user.name === 'string'
            && typeof user.email === 'string'
            && ['artist', 'buyer', 'admin'].includes(user.role);

        return validUser
            ? { available: true, user }
            : { available: false, user: null };
    } catch {
        return { available: false, user: null };
    }
}

export function AuthProvider({ children }) {
    const [initialAuth] = useState(readInitialAuth);
    const [user, setUserState] = useState(initialAuth.user);
    const userIdentityRef = useRef(initialAuth.user
        ? String(initialAuth.user.id) + ':' + String(initialAuth.user.role)
        : null);
    const [status, setStatus] = useState(initialAuth.available
        ? (initialAuth.user ? 'authenticated' : 'guest')
        : 'loading');
    const [authError, setAuthError] = useState('');
    const initialRefreshStartedRef = useRef(false);

    const setUser = useCallback((nextUser) => {
        const nextIdentity = nextUser ? String(nextUser.id) + ':' + String(nextUser.role) : null;
        if (userIdentityRef.current !== null && userIdentityRef.current !== nextIdentity) {
            queryClient.clear();
        }
        userIdentityRef.current = nextIdentity;
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
        // The Blade shell already resolved the current web session. Only use /me
        // when the app is rendered without the normal server bootstrap payload.
        if (!initialAuth.available && !initialRefreshStartedRef.current) {
            initialRefreshStartedRef.current = true;
            refreshUser();
        }
    }, [initialAuth.available, refreshUser]);

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

    const logoutMutation = useMutation({
        mutationKey: ['auth', 'logout'],
        mutationFn: () => axios.post('/api/v1/auth/logout'),
        onSuccess: () => setUser(null),
    });
    const { mutateAsync: mutateLogout } = logoutMutation;
    const logout = useCallback(() => mutateLogout(), [mutateLogout]);

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
