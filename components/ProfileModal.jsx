import axios from 'axios';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import Avatar from './Avatar';
import Serverport from './Serverport';

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4'];

export default function ProfileModal({ user, onClose, onUpdate }) {
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#3b82f6');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!username.trim() || !email.trim()) {
            setError('All fields are required');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${Serverport()}/api/auth/profile`, {
                username: username.trim(),
                email: email.trim(),
                avatarColor,
            }, { headers: { Authorization: `Bearer ${token}` } });

            const updatedUser = { ...user, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            onUpdate(updatedUser);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl w-full max-w-sm p-6 space-y-5" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-text-primary font-semibold">Edit Profile</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex justify-center">
                    <Avatar username={username} avatarColor={avatarColor} avatarUrl={user?.avatarUrl} size="xl" />
                </div>

                <div className="flex items-center justify-center gap-2">
                    {AVATAR_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => setAvatarColor(color)}
                            className={`w-6 h-6 rounded-full transition-transform ${avatarColor === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-surface' : 'hover:scale-110'}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>

                {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-text-muted mb-1 block">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-card border border-border/50 text-text-primary text-sm focus:outline-none focus:border-accent/50"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-text-muted mb-1 block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-card border border-border/50 text-text-primary text-sm focus:outline-none focus:border-accent/50"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-10 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
