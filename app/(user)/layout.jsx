'use client';
import Sidebar from '@/components/Layout/Sidebar';

export default function UserLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content animate-fade">{children}</main>
        </div>
    );
}
