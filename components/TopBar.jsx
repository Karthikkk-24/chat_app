import { ArrowLeft, Hash, Menu, Search, Users } from 'lucide-react';

export default function TopBar({ title, members, onBack, onMenu, onSearch }) {
    return (
        <div className="w-full h-14 flex items-center justify-between px-4 md:px-5 border-b border-border/50 shrink-0">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors md:hidden shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}
                <Hash className="w-4 h-4 text-text-muted hidden md:block shrink-0" />
                <h2 className="text-sm font-semibold text-text-primary truncate">{title}</h2>
                {members > 0 && (
                    <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-border/50 shrink-0">
                        <Users className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-xs text-text-muted">{members}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
                {onSearch && (
                    <button
                        onClick={onSearch}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors shrink-0"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                )}
                {onMenu && (
                    <button
                        onClick={onMenu}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors md:hidden shrink-0"
                    >
                        <Menu className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}