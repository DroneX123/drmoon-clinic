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
        navigate('/admin', { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="flex justify-between items-center mb-12">
                <div className="flex items-baseline gap-4">
                    <h1 className="font-serif text-3xl text-gold">Tableau de Bord</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="text-xs text-white/40 hover:text-white underline"
                    >
                        Retour au Site
                    </button>
                </div>

                <button
                    onClick={handleLogout}
                    className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors"
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
