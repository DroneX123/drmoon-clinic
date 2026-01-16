import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    // Secure the route
    useEffect(() => {
        const isAuth = localStorage.getItem('isAdminAuthenticated');
        if (!isAuth) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('isAdminAuthenticated');
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="flex justify-between items-center mb-12">
                <h1 className="font-serif text-3xl text-gold">Tableau de Bord</h1>
                <button
                    onClick={handleLogout}
                    className="text-xs uppercase tracking-widest text-white/50 hover:text-white"
                >
                    Déconnexion
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-gold font-bold mb-2">Rendez-vous</h3>
                    <p className="text-3xl font-light">0</p>
                </div>
                <div className="bg-slate-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-gold font-bold mb-2">En Attente</h3>
                    <p className="text-3xl font-light">0</p>
                </div>
                <div className="bg-slate-900 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-gold font-bold mb-2">Revenus (Est.)</h3>
                    <p className="text-3xl font-light">0 DA</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
