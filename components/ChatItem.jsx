import { Hash } from 'lucide-react';

export default function ChatItem({ title, lastMessage, active, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`w-full cursor-pointer flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                active
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:bg-card hover:text-text-primary'
            }`}
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                active ? 'bg-accent/20' : 'bg-card'
            }`}>
                <Hash className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{title}</h3>
                {lastMessage && (
                    <p className="text-xs text-text-muted truncate mt-0.5">{lastMessage}</p>
                )}
            </div>
        </div>
    );
}
