import PropTypes from 'prop-types';

export default function TopBar({ title, members, notifications }) {
    return (
        <div className="w-full h-18 flex items-center justify-between">
            <div className="h-full flex flex-col items-start justify-start">
                <div className="w-auto h-auto">
                    <h2 className='text-3xl text-slate-900'>{title}</h2>
                </div>
                <div className="w-auto h-auto">
                    <h5 className='text-slate-900 text-lg'>{members} members</h5>
                </div>
            </div>
            <div className="h-full flex items-center justify-center gap-3 relative">
                <span className='cursor-pointer'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-dots-vertical"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    </svg>
                    <div className="absolute"></div>
                </span>
            </div>
        </div>
    );
}
