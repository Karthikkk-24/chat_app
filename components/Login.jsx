import axios from 'axios';
import { Lock, LogIn, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Serverport from './Serverport';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            window.location.href = '/dashboard';
        }
    }, []);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post(`${Serverport()}/api/auth/login`, {
                email,
                password,
            });
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.location.href = '/dashboard';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-onyx flex items-center justify-center">
            <div className="w-full max-w-md px-8">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-6">
                        <LogIn className="w-7 h-7 text-accent" />
                    </div>
                    <h1 className="text-2xl font-semibold text-text-primary">Welcome back</h1>
                    <p className="text-text-secondary text-sm mt-2">Sign in to continue to your chats</p>
                </div>

                {error && (
                    <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <span className="text-text-muted text-sm">Don&apos;t have an account? </span>
                    <Link to="/register" className="text-accent text-sm font-medium hover:text-accent-light transition-colors">
                        Create one
                    </Link>
                </div>
            </div>
        </div>
    );
}
