import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState<boolean>(() => {
        // Check localStorage first
        const saved = localStorage.getItem('theme');
        if (saved) {
            return saved === 'dark';
        }
        // Check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Apply dark mode class to html element with smooth transition
    useEffect(() => {
        const root = document.documentElement;

        // Add transitioning class for smooth animation
        root.classList.add('theme-transitioning');

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Remove transitioning class after animation completes
        const timeout = setTimeout(() => {
            root.classList.remove('theme-transitioning');
        }, 450); // Slightly longer than the CSS transition duration

        // Save to localStorage
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        return () => clearTimeout(timeout);
    }, [isDark]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            // Only auto-switch if user hasn't set a preference
            if (!localStorage.getItem('theme')) {
                setIsDark(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = useCallback(() => {
        setIsDark((prev) => !prev);
    }, []);

    const setTheme = useCallback((dark: boolean) => {
        setIsDark(dark);
    }, []);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
