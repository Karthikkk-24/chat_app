import PropTypes from 'prop-types';

export default function ChatItem({ title, time, notifications, pin }) {
    function showPin() {
        if (pin) {
            return (
                <>
                    <span className="text-slate-900 absolute right-2 bottom-2 bg-slate-50 text-xs flex items-center justify-center rounded-full w-5 h-5 aspect-square font-semibold">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-pin"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" />
                            <path d="M9 15l-4.5 4.5" />
                            <path d="M14.5 4l5.5 5.5" />
                        </svg>
                    </span>
                </>
            );
        }
    }
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

            {showPin(pin)}
        </div>
    );
}

ChatItem.propTypes = {
    title: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    notifications: PropTypes.number.isRequired,
    pin: PropTypes.bool.isRequired,
};
