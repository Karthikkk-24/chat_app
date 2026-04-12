import { ArrowLeft, Hash, Users } from 'lucide-react';

export default function TopBar({ title, members, onBack }) {
    return (
        <div className="w-full h-14 flex items-center justify-between px-4 md:px-5 border-b border-border/50 shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors md:hidden shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}
                <Hash className="w-4 h-4 text-text-muted hidden md:block" />
                <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
                {members > 0 && (
                    <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-border/50">
                        <Users className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-xs text-text-muted">{members}</span>
                    </div>
                )}
            </div>
        </div>
    );
}