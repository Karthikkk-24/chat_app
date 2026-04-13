import { LogOut, MessageSquare, Moon, Sun, User, X } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function Sidebar({ open, onClose, onProfileOpen }) {
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <>
            {open && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
            )}

            <div className={`
                fixed top-0 left-0 h-full w-60 bg-surface z-50 flex flex-col justify-between py-6 px-4 border-r border-border/50
                transform transition-transform duration-200 ease-in-out md:hidden
                ${open ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-text-primary font-semibold text-sm">Chat App</span>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => { onProfileOpen?.(); onClose(); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors text-sm">
                        <User className="w-4 h-4" />
                        Profile
                    </button>
                    <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors text-sm">
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>

            <div className="hidden md:flex h-full w-16 bg-onyx flex-col items-center justify-between py-6 border-r border-border/50 shrink-0">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <button onClick={() => onProfileOpen?.()} className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors" title="Profile">
                        <User className="w-4 h-4" />
                    </button>
                    <button onClick={toggleTheme} className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors" title="Toggle theme">
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </>
    );
}
