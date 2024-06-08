import { useEffect, useState } from 'react';
import ChatItem from './ChatItem';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Dashboard() {

    const [messages, setMessages] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // Establish WebSocket connection
        const socket = new WebSocket('ws://localhost:3000');
        socket.onopen = () => {
            console.log('WebSocket connected');
        };
        socket.onclose = () => {
            console.log('WebSocket disconnected');
        };
        socket.onerror = (error) => {
            console.error('WebSocket error', error);
        };
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setChatHistory((prevHistory) => [...prevHistory, message]);
        };
        setWs(socket);

        // Clean up the WebSocket connection when the component is unmounted
        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, []);

    const handleSend = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const message = { text: messages, timestamp: new Date() };
            ws.send(JSON.stringify(message));
            setMessages(''); // Clear the input after sending
        } else {
            console.error('WebSocket is not connected');
        }
    };

    return (
        <div className="bg-background h-screen w-screen flex items-center justify-between p-5">
            <Sidebar />
            <div className="p-5 bg-primary rounded-3xl h-full w-full flex items-start justify-between gap-1">
                <div className="w-[30%] h-full flex flex-col items-start justify-start gap-2 overflow-x-hidden overflow-y-auto p-5">
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        pin="true"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        pin="true"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        pin="true"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                    <ChatItem
                        title="General Chat"
                        time="00:00"
                        notifications="2"
                    />
                </div>
                <div className="w-[70%] h-full relative items-start justify-start p-5">
                    <TopBar title={'General'} members={5} />
                    <div className=''></div>
                    <div className="absolute bottom-5 left-1/2 translate-x-[-50%] flex items-center w-full justify-center gap-10">
                        <input
                            type="text"
                            className="w-[70%] bg-slate-50 h-12 pl-5 rounded-full pr-5"
                            placeholder="Search"
                            onChange={(e) => setMessages(e.target.value)}
                            value={messages}
                        />
                        <button className="w-12 flex items-center justify-center h-12 hover:scale-105 transition-all rounded-full bg-slate-50" onClick={handleSend}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon icon-tabler icons-tabler-outline icon-tabler-send-2"
                            >
                                <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                />
                                <path d="M4.698 4.034l16.302 7.966l-16.302 7.966a.503 .503 0 0 1 -.546 -.124a.555 .555 0 0 1 -.12 -.568l2.468 -7.274l-2.468 -7.274a.555 .555 0 0 1 .12 -.568a.503 .503 0 0 1 .546 -.124z" />
                                <path d="M6.5 12h14.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
