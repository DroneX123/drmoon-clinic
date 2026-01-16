import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Calendar, Clock } from 'lucide-react';

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Demandes', path: '/admin/requests', icon: Clock },
        { name: 'Agenda', path: '/admin/appointments', icon: Calendar },
        { name: 'Clients', path: '/admin/clients', icon: Users },
    ];

    const handleLogout = () => {
        localStorage.removeItem('isAdminAuthenticated');
        navigate('/admin', { replace: true });
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 shadow-sm">
            {/* Brand */}
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-gold font-serif">M</div>
                    <h1 className="font-serif text-2xl text-slate-900">Dr. Moon</h1>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1 pl-11">Portal Admin</p>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 space-y-2 mt-8">
                <p className="px-4 text-[10px] uppercase tracking-widest text-slate-400 mb-4 font-semibold">MENU</p>

                {menuItems.map((item) => {
                    const isActive = currentPath === item.path;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-gold' : 'text-slate-400 group-hover:text-slate-900'}`} />
                            <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
                >
                    <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                    <span className="text-sm font-medium">Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
