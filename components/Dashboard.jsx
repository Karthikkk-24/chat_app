import axios from 'axios';
import { Menu, Search, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ChatItem from './ChatItem';
import Serverport, { getWsUrl } from './Serverport';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Dashboard() {
    const [messageText, setMessageText] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [ws, setWs] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileShowChat, setMobileShowChat] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch {
                localStorage.clear();
                window.location.href = '/login';
            }
        }

        loadConversations(token);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadConversations = async (token) => {
        try {
            const res = await axios.get(`${Serverport()}/api/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConversations(res.data);
            if (res.data.length > 0 && !activeConversation) {
                setActiveConversation(res.data[0]);
                loadMessages(res.data[0]._id, token);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.clear();
                window.location.href = '/login';
            }
            console.error('Failed to load conversations:', err);
        }
    };

    const loadMessages = async (conversationId, token) => {
        try {
            const tkn = token || localStorage.getItem('token');
            const res = await axios.get(`${Serverport()}/api/chat/messages/${conversationId}`, {
                headers: { Authorization: `Bearer ${tkn}` },
            });
            setChatHistory(res.data);
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    useEffect(() => {
        const socket = new WebSocket(getWsUrl());

        socket.onopen = () => console.log('WebSocket connected');
        socket.onclose = () => console.log('WebSocket disconnected');
        socket.onerror = (err) => console.error('WebSocket error:', err);

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.error) return;
                setChatHistory((prev) => [...prev, message]);

                setConversations((prev) =>
                    prev.map((c) =>
                        c._id === message.conversationId
                            ? { ...c, lastMessage: message.text, updatedAt: message.createdAt }
                            : c
                    )
                );
            } catch (err) {
                console.error('Failed to parse message:', err);
            }
        };

        setWs(socket);
        return () => {
            socket.close();
        };
    }, []);

    const handleSend = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN || !messageText.trim() || !activeConversation || !currentUser) return;

        ws.send(JSON.stringify({
            conversationId: activeConversation._id,
            senderId: currentUser._id,
            senderName: currentUser.username,
            text: messageText.trim(),
        }));
        setMessageText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        setChatHistory([]);
        loadMessages(conv._id);
        setMobileShowChat(true);
    };

    const handleMobileBack = () => {
        setMobileShowChat(false);
    };

    const filteredConversations = conversations.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-onyx h-[100dvh] w-screen flex overflow-hidden">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Conversation list — full width on mobile, fixed 288px on desktop */}
            <div className={`
                h-full bg-surface flex flex-col shrink-0 border-r border-border/50
                w-full md:w-72
                ${mobileShowChat ? 'hidden md:flex' : 'flex'}
            `}>
                <div className="p-3 md:p-4 border-b border-border/50 flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card transition-colors shrink-0 md:hidden"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 rounded-lg bg-card border border-border/50 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {filteredConversations.map((conv) => (
                        <ChatItem
                            key={conv._id}
                            title={conv.name}
                            lastMessage={conv.lastMessage}
                            active={activeConversation?._id === conv._id}
                            onClick={() => handleSelectConversation(conv)}
                        />
                    ))}
                    {filteredConversations.length === 0 && (
                        <p className="text-center text-text-muted text-xs mt-8">No conversations found</p>
                    )}
                </div>
            </div>

            {/* Chat area — full width on mobile when selected, flex-1 on desktop */}
            <div className={`
                flex-1 h-full flex flex-col bg-onyx min-w-0
                ${mobileShowChat ? 'flex' : 'hidden md:flex'}
            `}>
                {activeConversation ? (
                    <>
                        <TopBar
                            title={activeConversation.name}
                            members={activeConversation.participants?.length || 0}
                            onBack={handleMobileBack}
                        />

                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto px-4 md:px-5 py-4 space-y-1"
                        >
                            {chatHistory.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser?._id;
                                const showName = !isMe && (idx === 0 || chatHistory[idx - 1]?.senderId !== msg.senderId);

                                return (
                                    <div key={msg._id || idx}>
                                        {showName && (
                                            <p className="text-xs font-medium text-accent ml-1 mt-3 mb-1">
                                                {msg.senderName}
                                            </p>
                                        )}
                                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[85%] md:max-w-[70%] px-3.5 py-2 rounded-2xl text-sm ${
                                                    isMe
                                                        ? 'bg-accent text-white rounded-br-md'
                                                        : 'bg-surface text-text-primary rounded-bl-md'
                                                }`}
                                            >
                                                <p className="break-words">{msg.text}</p>
                                                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-text-muted'}`}>
                                                    {formatTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="px-3 md:px-5 pb-4 md:pb-5 pt-2 shrink-0">
                            <div className="flex items-center gap-2 md:gap-3 bg-surface border border-border/50 rounded-xl px-3 md:px-4 py-2 focus-within:border-accent/50 transition-colors">
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted focus:outline-none min-w-0"
                                    placeholder="Type a message..."
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!messageText.trim()}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-text-muted text-sm">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
