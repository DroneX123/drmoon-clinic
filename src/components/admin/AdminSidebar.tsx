import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, Bell, LogOut, Sparkles, Clock, ClipboardList, Package, Truck, X } from 'lucide-react';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Demandes', path: '/admin/requests', icon: Clock },
        { name: 'Offres & Services', path: '/admin/services', icon: Sparkles },
        { name: 'Produits & Stock', path: '/admin/products', icon: Package },
        { name: 'Fournisseurs', path: '/admin/suppliers', icon: Truck },
        { name: 'Agenda', path: '/admin/appointments', icon: Calendar },
        { name: 'Clients', path: '/admin/clients', icon: Users },
        { name: 'Consultations', path: '/admin/consultations', icon: ClipboardList },
    ];

    const handleLogout = () => {
        localStorage.removeItem('isAdminAuthenticated');
        navigate('/admin', { replace: true });
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            `}>
                {/* Brand */}
                <div className="p-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-gold font-serif">M</div>
                            <h1 className="font-serif text-2xl text-slate-900">Dr. Moon</h1>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1 pl-11">Portal Admin</p>
                    </div>
                    {/* Close Button (Mobile Only) */}
                    <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Menu (Scrollable) */}
                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    <p className="px-4 text-[10px] uppercase tracking-widest text-slate-400 mb-4 font-semibold">MENU</p>

                    {menuItems.map((item) => {
                        const isActive = currentPath === item.path;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    onClose(); // Close on mobile navigation
                                }}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group flex-shrink-0
                                    ${isActive
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-gold' : 'text-slate-400 group-hover:text-slate-900'}`} />
                                <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-slate-100 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
                    >
                        <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                        <span className="text-sm font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
