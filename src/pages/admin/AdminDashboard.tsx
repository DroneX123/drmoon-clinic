import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const stats = useQuery(api.dashboard.getStats);
    const navigate = useNavigate();

    // Helper for formatting currency
    const formatCurrency = (amount: number) => {
        return amount?.toLocaleString('fr-DZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' DA';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl text-slate-900 mb-1">Tableau de Bord</h1>
                    <p className="text-slate-500 text-sm">Aperçu de la performance financière et opérationnelle.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-xs font-bold uppercase text-slate-400">Date</p>
                    <p className="font-serif text-lg text-slate-900">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Financial Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* REVENUE */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-[160px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-green-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Chiffre d'Affaires</h3>
                        </div>
                        <p className="font-serif text-3xl font-bold text-slate-900">
                            {stats ? formatCurrency(stats.revenue) : '...'}
                        </p>
                    </div>
                    <div className="text-xs text-green-600 font-medium bg-green-50 self-start px-2 py-1 rounded-full">
                        + Revenus Bruts
                    </div>
                </div>

                {/* EXPENSES */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-[160px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown className="w-24 h-24 text-red-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Dépenses Totales</h3>
                        </div>
                        <p className="font-serif text-3xl font-bold text-slate-900">
                            {stats ? formatCurrency(stats.expenses) : '...'}
                        </p>
                    </div>
                    <div className="text-xs text-red-600 font-medium bg-red-50 self-start px-2 py-1 rounded-full">
                        - Charges & Achats
                    </div>
                </div>

                {/* NET PROFIT */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between h-[160px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-24 h-24 text-gold" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <DollarSign className="w-5 h-5 text-gold" />
                            </div>
                            <h3 className="text-gold/60 font-bold text-xs uppercase tracking-wider">Bénéfice Net</h3>
                        </div>
                        <p className="font-serif text-4xl font-bold text-white">
                            {stats ? formatCurrency(stats.profit) : '...'}
                        </p>
                    </div>
                    <div className="text-xs text-black font-bold bg-gold self-start px-3 py-1 rounded-full">
                        Marge Nette
                    </div>
                </div>
            </div>

            {/* Quick Actions / Operational Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TODAY */}
                <div
                    onClick={() => navigate('/admin/appointments')}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Rendez-vous Aujourd'hui</h3>
                            <p className="text-slate-500 text-sm">Consultations confirmées ce jour</p>
                        </div>
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{stats ? stats.todayCount : '-'}</span>
                </div>

                {/* REQUESTS */}
                <div
                    onClick={() => navigate('/admin/requests')}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Demandes en Attente</h3>
                            <p className="text-slate-500 text-sm">Nécessite votre confirmation</p>
                        </div>
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{stats ? stats.pendingCount : '-'}</span>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
