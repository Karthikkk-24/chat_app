const HOST = window.location.hostname;
const API_URL = `http://${HOST}:3000`;
const WS_URL = `ws://${HOST}:3000`;

export default function Serverport() {
    return API_URL;
}

export function getWsUrl() {
    return WS_URL;
}
