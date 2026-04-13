import axios from 'axios';
import { Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import Serverport from './Serverport';

export default function NewChatModal({ onClose, onCreated }) {
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState([]);
    const [chatName, setChatName] = useState('');
    const [search, setSearch] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${Serverport()}/api/chat/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(res.data);
            } catch (err) {
                console.error('Failed to load users:', err);
            }
        };
        fetchUsers();
    }, []);

    const toggleUser = (user) => {
        setSelected(prev =>
            prev.find(u => u._id === user._id)
                ? prev.filter(u => u._id !== user._id)
                : [...prev, user]
        );
    };

    const handleCreate = async () => {
        if (selected.length === 0) return;
        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            const name = chatName.trim() || (selected.length === 1
                ? selected[0].username
                : selected.map(u => u.username).join(', '));
            const res = await axios.post(`${Serverport()}/api/chat/conversations`, {
                name,
                participantIds: selected.map(u => u._id),
            }, { headers: { Authorization: `Bearer ${token}` } });
            onCreated(res.data);
            onClose();
        } catch (err) {
            console.error('Failed to create conversation:', err);
        } finally {
            setCreating(false);
        }
    };

    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <h2 className="text-text-primary font-semibold">New Conversation</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    <input
                        type="text"
                        placeholder="Chat name (optional)"
                        value={chatName}
                        onChange={e => setChatName(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg bg-card border border-border/50 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                    />

                    {selected.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {selected.map(u => (
                                <span key={u._id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 text-accent text-xs">
                                    {u.username}
                                    <button onClick={() => toggleUser(u)} className="hover:text-white">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 rounded-lg bg-card border border-border/50 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-1">
                    {filtered.map(user => {
                        const isSelected = selected.find(u => u._id === user._id);
                        return (
                            <button
                                key={user._id}
                                onClick={() => toggleUser(user)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                                    isSelected ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-card hover:text-text-primary'
                                }`}
                            >
                                <Avatar username={user.username} avatarColor={user.avatarColor} avatarUrl={user.avatarUrl} size="sm" showStatus isOnline={user.isOnline} />
                                <span className="text-sm font-medium flex-1">{user.username}</span>
                                {isSelected && <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center"><Plus className="w-3 h-3 text-white rotate-45" /></div>}
                            </button>
                        );
                    })}
                    {filtered.length === 0 && (
                        <p className="text-center text-text-muted text-xs py-4">No users found</p>
                    )}
                </div>

                <div className="p-4 border-t border-border/50">
                    <button
                        onClick={handleCreate}
                        disabled={selected.length === 0 || creating}
                        className="w-full h-10 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                        {creating ? 'Creating...' : `Create Chat${selected.length > 0 ? ` (${selected.length})` : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
