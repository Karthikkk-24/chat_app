export default function Avatar({ username, avatarUrl, avatarColor, size = 'md', isOnline, showStatus = false }) {
    const sizes = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-9 h-9 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-xl',
    };

    const statusSizes = {
        xs: 'w-2 h-2',
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-3.5 h-3.5',
        xl: 'w-4 h-4',
    };

    const initials = (username || '?').charAt(0).toUpperCase();
    const bgColor = avatarColor || '#3b82f6';

    return (
        <div className="relative shrink-0">
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={username}
                    className={`${sizes[size]} rounded-full object-cover`}
                />
            ) : (
                <div
                    className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white`}
                    style={{ backgroundColor: bgColor }}
                >
                    {initials}
                </div>
            )}
            {showStatus && (
                <div className={`absolute -bottom-0.5 -right-0.5 ${statusSizes[size]} rounded-full border-2 border-onyx ${
                    isOnline ? 'bg-emerald-500' : 'bg-gray-500'
                }`} />
            )}
        </div>
    );
}
