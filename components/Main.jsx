import { useEffect } from 'react';

export default function Main() {
    useEffect(() => {
        if (localStorage.getItem('token')) {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/login';
        }
    }, []);

    return <></>;
}
