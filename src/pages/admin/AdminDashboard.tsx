import React from 'react';

const AdminDashboard: React.FC = () => {
    return (
        <div>
            <div className="mb-8">
                <h1 className="font-serif text-3xl text-slate-900 mb-1">Bonjour, Dr. Berrim!</h1>
                <p className="text-slate-500 text-sm">Voici un aperçu de votre activité.</p>
            </div>

            {/* Empty for now as requested */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30 pointer-events-none">
                {/* Placeholders to show structure but dimmed */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="text-slate-400 font-bold text-xs uppercase mb-2">Rendez-vous</h3>
                    <p className="text-3xl font-light text-slate-900">--</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="text-slate-400 font-bold text-xs uppercase mb-2">En Attente</h3>
                    <p className="text-3xl font-light text-slate-900">--</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="text-slate-400 font-bold text-xs uppercase mb-2">Revenus</h3>
                    <p className="text-3xl font-light text-slate-900">--</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
