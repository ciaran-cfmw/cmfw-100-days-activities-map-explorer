/// <reference types="vite/client" />
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader } from '../../components/Loader';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/admin';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) throw loginError;

            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-ocean px-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-brandDeep p-8 shadow-2xl border border-brandRed/20 dark:border-white/10">
                <div className="text-center">
                    <img
                        src="https://static.wixstatic.com/media/4b4c63_54d21e482fea49acaba50908b008a873~mv2.png/v1/fill/w_562,h_170,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/cmfw-logo-two-color_edited.png"
                        alt="CMFW Logo"
                        className="mx-auto h-16 w-auto mb-6"
                    />
                    <h2 className="text-3xl font-heading text-brandCream">Admin Portal</h2>
                    <p className="mt-2 text-brandGrey">Sign in to manage campaign activities</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="rounded-md bg-red-900/50 p-4 border border-red-500/50">
                            <p className="text-sm text-red-200 text-center">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-brandGrey mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg bg-ocean/50 border border-brandRed/20 dark:border-white/10 px-4 py-3 text-brandCream placeholder-white/20 focus:border-brandRed focus:ring-1 focus:ring-brandRed outline-none transition-all"
                                placeholder="admin@cmfw.world"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-brandGrey mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg bg-ocean/50 border border-brandRed/20 dark:border-white/10 px-4 py-3 text-brandCream placeholder-white/20 focus:border-brandRed focus:ring-1 focus:ring-brandRed outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-brandRed px-4 py-3 text-sm font-bold text-brandCream transition-all hover:bg-brandRed/90 focus:outline-none focus:ring-2 focus:ring-brandRed focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brandCream border-t-transparent" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
