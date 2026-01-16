import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Security Check
    useEffect(() => {
        const isAuth = localStorage.getItem('isAdminAuthenticated');
        if (!isAuth) {
            navigate('/admin', { replace: true });
        }
    }, [navigate]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // Page Title Logic
    const getTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'Tableau de bord';
        if (path.includes('requests')) return 'Demandes';
        if (path.includes('services')) return 'Offres & Services';
        if (path.includes('products')) return 'Produits & Stock';
        if (path.includes('suppliers')) return 'Fournisseurs';
        if (path.includes('appointments')) return 'Agenda';
        if (path.includes('clients')) return 'Clients';
        if (path.includes('consultations')) return 'Consultations';
        return 'Admin';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content - Adjusted padding for desktop only */}
            <main className="md:pl-64 min-h-screen flex flex-col transition-all duration-300">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        {/* Hamburger Menu (Mobile Only) */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <h2 className="font-serif text-xl md:text-2xl text-slate-900 truncate">{getTitle()}</h2>
                    </div>

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
                <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
