import { useEffect } from 'react';

export default function Logout() {

    useEffect(() => {
        clearStorage();
        window.location.href = '/login';
    }, []);

    function clearStorage() {
        localStorage.clear();
        sessionStorage.clear();
    }

  return (
    <></>
  )
}
