import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Security Check (Moved from Dashboard to Layout for global protection)
    useEffect(() => {
        const isAuth = localStorage.getItem('isAdminAuthenticated');
        if (!isAuth) {
            navigate('/admin', { replace: true });
        }
    }, [navigate]);

    // Page Title
    const getTitle = () => {
        if (location.pathname.includes('clients')) return 'Clients';
        return 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <AdminSidebar />

            <main className="pl-64 min-h-screen flex flex-col">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <h2 className="font-serif text-2xl text-slate-900">{getTitle()}</h2>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-900">Dr. Berrim</p>
                            <p className="text-xs text-slate-500">Administrateur</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <span className="font-serif text-slate-900">D</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
