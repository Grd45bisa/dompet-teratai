import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
    title?: string;
}

export function MainLayout({ title }: MainLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-bgSoft dark:bg-darkBg">
            <div className="flex">
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main content */}
                <div className="flex-1 min-w-0 lg:ml-0">
                    <Header
                        onMenuClick={() => setSidebarOpen(true)}
                        title={title}
                    />
                    <main className="p-4 lg:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default MainLayout;
