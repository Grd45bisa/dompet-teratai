import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, User, getToken, clearToken } from '../lib/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    updateUser: (data: Partial<User>) => Promise<{ error: Error | null }>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'expense_tracker_user';

function AuthProviderInner({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Refresh user data from backend
    const refreshUser = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const result = await authApi.getProfile();
            if (result.success && result.data) {
                setUser(result.data);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.data));
            } else {
                // Token invalid, clear it
                clearToken();
                setUser(null);
            }
        } catch (err) {
            console.error('Error refreshing user:', err);
            clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        const token = getToken();

        if (storedUser && token) {
            try {
                const userData = JSON.parse(storedUser) as User;
                setUser(userData);
                // Refresh user data from backend in background
                refreshUser();
            } catch (err) {
                console.error('Error parsing stored user:', err);
                clearToken();
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [refreshUser]);

    // Sign out
    const signOut = async () => {
        authApi.logout();
        setUser(null);
        localStorage.removeItem('demo_mode');
        localStorage.removeItem('demo_expenses');
        localStorage.removeItem('demo_categories');
        localStorage.removeItem('demo_profile');
    };

    // Update user data
    const updateUser = async (data: Partial<User>) => {
        if (!user) {
            return { error: new Error('No user logged in') };
        }

        try {
            const result = await authApi.updateProfile(data);

            if (!result.success) {
                return { error: new Error(result.error || 'Update failed') };
            }

            if (result.data) {
                setUser(result.data);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.data));
            }

            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err : new Error('Update failed') };
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        signOut,
        updateUser,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// No more GoogleOAuthProvider wrapper - all OAuth is handled by backend!
export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <AuthProviderInner>{children}</AuthProviderInner>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Re-export User type for use in components
export type { User };

export default AuthContext;
