import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
    onMenuClick: () => void;
    title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
    const { toggleTheme, isDark } = useTheme();

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-darkBg/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between px-4 lg:px-6 py-4">
                {/* Left section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    {title && (
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h1>
                    )}
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button
                        className="p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    >
                        {isDark ? (
                            <Sun className="w-5 h-5 text-yellow-500" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
