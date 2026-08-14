'use client';
import AdminSidebar from '@/components/Layout/AdminSidebar';

export default function AdminLayout({ children }) {
    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="main-content animate-fade">{children}</main>
        </div>
    );
}
