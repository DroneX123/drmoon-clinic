import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useQuery } from "convex/react";
// Actually query runs automatically. For login, we usually use an ACTION or just separate logic.
// But my auth.ts is a QUERY.
// To use a query for login "check" on button click is not standard pattern (query is reactive).
// Better pattern: fetch directly or assume we use useImperativeQuery (lazy).
// Since Convex doesn't have useLazyQuery easily without action,
// I will just use `fetchQuery` from generic client if available, OR
// I will change auth.ts to an ACTION? No, action is simpler.
// OR I will simply use a client-side simple check if I load the user? NO that's insecure.
//
// Correct pattern:
// The component shouldn't use useQuery for login submission.
// I should change `convex/auth.ts` to be an ACTION `loginAction`.
//
// Let's create the UI first. I will refactor auth.ts to action briefly.

import { Lock, User } from 'lucide-react';
import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";

const AdminLoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const convex = useConvex();

    // Redirect if already logged in
    React.useEffect(() => {
        if (localStorage.getItem('isAdminAuthenticated')) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Using convex.query to fetch once
            const isValid = await convex.query(api.auth.login, { username, password });

            if (isValid) {
                // SUCCESS
                localStorage.setItem('isAdminAuthenticated', 'true');
                navigate('/admin/dashboard', { replace: true });
            } else {
                setError('Identifiants incorrects');
            }
        } catch (err) {
            setError('Erreur de connexion');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-xl my-auto">

                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl text-gold mb-2">Dr. Moon Portal</h1>
                    <p className="text-white/40 text-xs tracking-widest uppercase">Accès Réservé</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2 pl-1">Utilisateur</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                placeholder="Admin ID"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2 pl-1">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs text-center font-bold tracking-wide">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gold text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Connexion...' : 'Accéder'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
