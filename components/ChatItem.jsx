import PropTypes from 'prop-types';

export default function ChatItem({ title, time, notifications }) {
    return (
        <div className="w-full relative border-2 bg-highlight border-slate-50 h-20 flex items-center justify-start gap-2 rounded-xl min-h-20 p-2">
            <div className="h-full w-auto aspect-square">
                <img
                    src="https://i.pravatar.cc/300"
                    alt="profile"
                    className="w-full h-full object-cover rounded-xl"
                />
            </div>
            <div className="flex flex-col items-start justify-start gap-1">
                <h2 className="text-lg font-semibold">{title}</h2>
                <h5 className="text-slate-900 text-xs">{time}</h5>
            </div>
            <span className="text-slate-900 absolute right-2 top-2 bg-amber-500 text-xs flex items-center justify-center rounded-full w-5 h-5 aspect-square font-semibold">
                {notifications}
            </span>
        </div>
    );
}

ChatItem.propTypes = {
    title: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    notifications: PropTypes.number.isRequired,
};
