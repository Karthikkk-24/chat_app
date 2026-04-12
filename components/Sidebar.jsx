import { LogOut, MessageSquare, Settings } from 'lucide-react';

export default function Sidebar() {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="h-full w-16 bg-onyx flex flex-col items-center justify-between py-6 border-r border-border/50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                </div>
            </div>
            <div className="flex flex-col items-center gap-3">
                <button className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors">
                    <Settings className="w-4 h-4" />
                </button>
                <button
                    onClick={handleLogout}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
