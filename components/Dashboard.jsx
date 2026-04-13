import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import {
    Check,
    CheckCheck,
    Download,
    Edit3,
    FileText,
    Menu,
    Paperclip,
    Plus,
    Reply,
    Search,
    Send,
    Smile,
    Trash2,
    WifiOff,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import ChatItem from './ChatItem';
import NewChatModal from './NewChatModal';
import ProfileModal from './ProfileModal';
import Serverport, { getWsUrl } from './Serverport';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

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

    // Feature states
    const [wsConnected, setWsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [editingMsg, setEditingMsg] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [messageSearch, setMessageSearch] = useState('');
    const [messageSearchResults, setMessageSearchResults] = useState([]);
    const [showMessageSearch, setShowMessageSearch] = useState(false);
    const [uploading, setUploading] = useState(false);

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);
    const typingTimer = useRef(null);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);
    const activeConvRef = useRef(null);

    activeConvRef.current = activeConversation;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // ─── Auth & Init ───
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setCurrentUser(JSON.parse(storedUser)); }
            catch { localStorage.clear(); window.location.href = '/login'; }
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
            if (res.data.length > 0 && !activeConvRef.current) {
                setActiveConversation(res.data[0]);
                loadMessages(res.data[0]._id, token);
            }
        } catch (err) {
            if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
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

    useEffect(() => { scrollToBottom(); }, [chatHistory]);

    // ─── WebSocket with Auto-Reconnect ───
    const connectWs = useCallback(() => {
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        const socket = new WebSocket(getWsUrl());

        socket.onopen = () => {
            setWsConnected(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user._id) socket.send(JSON.stringify({ type: 'auth', userId: user._id }));
        };

        socket.onclose = () => {
            setWsConnected(false);
            reconnectTimer.current = setTimeout(connectWs, 3000);
        };

        socket.onerror = () => setWsConnected(false);

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.error) return;

                if (data.type === 'message') {
                    setChatHistory(prev => {
                        if (data.conversationId === activeConvRef.current?._id) return [...prev, data];
                        return prev;
                    });
                    setConversations(prev => prev.map(c =>
                        c._id === data.conversationId ? { ...c, lastMessage: data.text || 'Sent a file', updatedAt: data.createdAt } : c
                    ));
                } else if (data.type === 'typing') {
                    setTypingUsers(prev => {
                        const key = `${data.conversationId}`;
                        const current = prev[key] || {};
                        if (data.isTyping) return { ...prev, [key]: { ...current, [data.userId]: data.username } };
                        const next = { ...current };
                        delete next[data.userId];
                        return { ...prev, [key]: next };
                    });
                } else if (data.type === 'presence') {
                    setConversations(prev => prev.map(c => ({
                        ...c,
                        participants: c.participants?.map(p =>
                            (p._id || p) === data.userId ? { ...p, isOnline: data.isOnline, lastSeen: data.lastSeen } : p
                        )
                    })));
                } else if (data.type === 'reaction') {
                    setChatHistory(prev => prev.map(m =>
                        m._id === data.messageId ? { ...m, reactions: data.reactions } : m
                    ));
                } else if (data.type === 'edit') {
                    setChatHistory(prev => prev.map(m =>
                        m._id === data.messageId ? { ...m, text: data.text, edited: true } : m
                    ));
                } else if (data.type === 'delete') {
                    setChatHistory(prev => prev.map(m =>
                        m._id === data.messageId ? { ...m, deleted: true, text: '' } : m
                    ));
                } else if (data.type === 'read') {
                    setChatHistory(prev => prev.map(m =>
                        m.conversationId === data.conversationId && !m.readBy?.includes(data.userId)
                            ? { ...m, readBy: [...(m.readBy || []), data.userId] }
                            : m
                    ));
                }
            } catch (err) {
                console.error('WS parse error:', err);
            }
        };

        wsRef.current = socket;
        setWs(socket);
    }, []);

    useEffect(() => {
        connectWs();
        return () => {
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            wsRef.current?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Send Read Receipt on conversation switch ───
    useEffect(() => {
        if (activeConversation && currentUser && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'read', conversationId: activeConversation._id, userId: currentUser._id
            }));
        }
    }, [activeConversation, currentUser, chatHistory]);

    // ─── Typing Indicator ───
    const sendTyping = (isTyping) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !activeConversation || !currentUser) return;
        wsRef.current.send(JSON.stringify({
            type: 'typing', conversationId: activeConversation._id, userId: currentUser._id, username: currentUser.username, isTyping,
        }));
    };

    const handleInputChange = (e) => {
        setMessageText(e.target.value);
        sendTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => sendTyping(false), 2000);
    };

    // ─── Send Message ───
    const handleSend = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN || !activeConversation || !currentUser) return;

        if (editingMsg) {
            if (!messageText.trim()) return;
            ws.send(JSON.stringify({ type: 'edit', messageId: editingMsg._id, senderId: currentUser._id, text: messageText.trim() }));
            setEditingMsg(null);
            setMessageText('');
            sendTyping(false);
            return;
        }

        if (!messageText.trim()) return;
        const payload = {
            conversationId: activeConversation._id,
            senderId: currentUser._id,
            senderName: currentUser.username,
            text: messageText.trim(),
        };
        if (replyTo) {
            payload.replyTo = { messageId: replyTo._id, senderName: replyTo.senderName, text: replyTo.text?.substring(0, 100) };
        }
        ws.send(JSON.stringify(payload));
        setMessageText('');
        setReplyTo(null);
        sendTyping(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
        if (e.key === 'Escape') { setReplyTo(null); setEditingMsg(null); setMessageText(''); }
    };

    // ─── File Upload ───
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !activeConversation || !currentUser) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`${Serverport()}/api/upload`, formData);
            wsRef.current?.send(JSON.stringify({
                conversationId: activeConversation._id,
                senderId: currentUser._id,
                senderName: currentUser.username,
                text: '',
                fileUrl: res.data.fileUrl,
                fileType: res.data.fileType,
                fileName: res.data.fileName,
            }));
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ─── Reactions ───
    const handleReaction = (messageId, emoji) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !currentUser) return;
        wsRef.current.send(JSON.stringify({ type: 'reaction', messageId, userId: currentUser._id, emoji }));
        setContextMenu(null);
    };

    // ─── Delete ───
    const handleDelete = (messageId) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !currentUser) return;
        wsRef.current.send(JSON.stringify({ type: 'delete', messageId, senderId: currentUser._id }));
        setContextMenu(null);
    };

    // ─── Edit ───
    const startEdit = (msg) => {
        setEditingMsg(msg);
        setMessageText(msg.text);
        setContextMenu(null);
        setReplyTo(null);
        inputRef.current?.focus();
    };

    // ─── Reply ───
    const startReply = (msg) => {
        setReplyTo(msg);
        setContextMenu(null);
        setEditingMsg(null);
        inputRef.current?.focus();
    };

    // ─── Message Search ───
    const searchMessages = async (q) => {
        setMessageSearch(q);
        if (!q.trim() || !activeConversation) { setMessageSearchResults([]); return; }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${Serverport()}/api/chat/messages/${activeConversation._id}/search?q=${encodeURIComponent(q)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessageSearchResults(res.data);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    // ─── Conversation Selection ───
    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        setChatHistory([]);
        loadMessages(conv._id);
        setMobileShowChat(true);
        setShowMessageSearch(false);
        setMessageSearchResults([]);
        setMessageSearch('');
    };

    const handleNewConversation = (conv) => {
        setConversations(prev => [conv, ...prev]);
        handleSelectConversation(conv);
    };

    // ─── Helpers ───
    const filteredConversations = conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getTypingText = () => {
        if (!activeConversation) return '';
        const users = typingUsers[activeConversation._id];
        if (!users) return '';
        const names = Object.values(users).filter(n => n !== currentUser?.username);
        if (names.length === 0) return '';
        if (names.length === 1) return `${names[0]} is typing...`;
        return `${names.join(', ')} are typing...`;
    };

    const isImageFile = (type) => type?.startsWith('image/');

    return (
        <div className="bg-onyx fixed inset-0 flex overflow-hidden">
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onProfileOpen={() => setShowProfileModal(true)}
            />

            {/* ─── Conversation List Panel ─── */}
            <div className={`h-full bg-surface flex flex-col shrink-0 border-r border-border/50 w-full md:w-72 ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-3 md:p-4 border-b border-border/50 flex items-center gap-2">
                    <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-card transition-colors shrink-0 md:hidden">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type="text" placeholder="Search chats..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 rounded-lg bg-card border border-border/50 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors" />
                    </div>
                    <button onClick={() => setShowNewChatModal(true)} className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 transition-colors shrink-0" title="New chat">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {filteredConversations.map(conv => (
                        <ChatItem key={conv._id} title={conv.name} lastMessage={conv.lastMessage} active={activeConversation?._id === conv._id} onClick={() => handleSelectConversation(conv)} />
                    ))}
                    {filteredConversations.length === 0 && <p className="text-center text-text-muted text-xs mt-8">No conversations found</p>}
                </div>
            </div>

            {/* ─── Chat Area ─── */}
            <div className={`flex-1 h-full flex flex-col bg-onyx min-w-0 ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
                {!wsConnected && (
                    <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-1.5 flex items-center justify-center gap-2 shrink-0">
                        <WifiOff className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-xs text-red-400">Reconnecting...</span>
                    </div>
                )}

                {activeConversation ? (
                    <>
                        <TopBar
                            title={activeConversation.name}
                            members={activeConversation.participants?.length || 0}
                            onBack={() => setMobileShowChat(false)}
                            onMenu={() => setSidebarOpen(true)}
                            onSearch={() => setShowMessageSearch(prev => !prev)}
                        />

                        {showMessageSearch && (
                            <div className="px-4 py-2 border-b border-border/50 shrink-0">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input type="text" placeholder="Search messages..." value={messageSearch}
                                        onChange={e => searchMessages(e.target.value)}
                                        className="w-full h-9 pl-9 pr-8 rounded-lg bg-card border border-border/50 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                                    <button onClick={() => { setShowMessageSearch(false); setMessageSearch(''); setMessageSearchResults([]); }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {messageSearchResults.length > 0 && (
                                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                                        {messageSearchResults.map(msg => (
                                            <div key={msg._id} className="px-3 py-2 rounded-lg bg-card/50 text-xs cursor-pointer hover:bg-card">
                                                <span className="text-accent font-medium">{msg.senderName}</span>
                                                <span className="text-text-muted ml-2">{formatTime(msg.createdAt)}</span>
                                                <p className="text-text-secondary mt-0.5 truncate">{msg.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Messages */}
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 md:px-5 py-4 space-y-1" onClick={() => setContextMenu(null)}>
                            {chatHistory.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser?._id;
                                const showName = !isMe && (idx === 0 || chatHistory[idx - 1]?.senderId !== msg.senderId);
                                const isDeleted = msg.deleted;

                                return (
                                    <div key={msg._id || idx}>
                                        {showName && (
                                            <div className="flex items-center gap-2 ml-1 mt-3 mb-1">
                                                <Avatar username={msg.senderName} size="xs" avatarColor={activeConversation.participants?.find(p => (p._id || p) === msg.senderId)?.avatarColor} />
                                                <p className="text-xs font-medium text-accent">{msg.senderName}</p>
                                            </div>
                                        )}
                                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                            <div className="relative max-w-[85%] md:max-w-[70%]">
                                                {/* Reply preview */}
                                                {msg.replyTo?.text && !isDeleted && (
                                                    <div className={`text-[10px] px-3 py-1 mb-0.5 rounded-t-xl border-l-2 border-accent/50 ${isMe ? 'bg-accent/20 text-white/70' : 'bg-card text-text-muted'}`}>
                                                        <span className="font-medium text-accent">{msg.replyTo.senderName}</span>
                                                        <p className="truncate">{msg.replyTo.text}</p>
                                                    </div>
                                                )}

                                                <div
                                                    onClick={(e) => { if (isDeleted) return; e.stopPropagation(); setContextMenu(contextMenu?._id === msg._id ? null : msg); }}
                                                    className={`px-3.5 py-2 rounded-2xl text-sm cursor-pointer ${isDeleted ? 'italic opacity-50' : ''} ${
                                                        isMe ? 'bg-accent text-white rounded-br-md' : 'bg-surface text-text-primary rounded-bl-md'
                                                    } ${msg.replyTo?.text && !isDeleted ? 'rounded-t-none' : ''}`}
                                                >
                                                    {isDeleted ? (
                                                        <p className="text-xs">Message deleted</p>
                                                    ) : (
                                                        <>
                                                            {/* File attachment */}
                                                            {msg.fileUrl && (
                                                                isImageFile(msg.fileType) ? (
                                                                    <img src={msg.fileUrl} alt={msg.fileName} className="max-w-full rounded-lg mb-1 max-h-60 object-contain" />
                                                                ) : (
                                                                    <a href={msg.fileUrl} target="_blank" rel="noreferrer"
                                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 ${isMe ? 'bg-white/10' : 'bg-card'}`}>
                                                                        <FileText className="w-4 h-4 shrink-0" />
                                                                        <span className="text-xs truncate flex-1">{msg.fileName || 'File'}</span>
                                                                        <Download className="w-3.5 h-3.5 shrink-0" />
                                                                    </a>
                                                                )
                                                            )}
                                                            {msg.text && <p className="break-words">{msg.text}</p>}
                                                            <div className={`flex items-center gap-1.5 mt-1 ${isMe ? 'justify-end' : ''}`}>
                                                                <span className={`text-[10px] ${isMe ? 'text-white/50' : 'text-text-muted'}`}>{formatTime(msg.createdAt)}</span>
                                                                {msg.edited && <span className={`text-[10px] ${isMe ? 'text-white/40' : 'text-text-muted'}`}>(edited)</span>}
                                                                {isMe && (
                                                                    msg.readBy?.length > 1
                                                                        ? <CheckCheck className="w-3 h-3 text-blue-300" />
                                                                        : <Check className="w-3 h-3 text-white/40" />
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Reactions display */}
                                                {msg.reactions?.length > 0 && !isDeleted && (
                                                    <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        {Object.entries(msg.reactions.reduce((acc, r) => {
                                                            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                                            return acc;
                                                        }, {})).map(([emoji, count]) => (
                                                            <button key={emoji} onClick={() => handleReaction(msg._id, emoji)}
                                                                className="px-1.5 py-0.5 rounded-full bg-card text-xs flex items-center gap-0.5 hover:bg-card-hover transition-colors">
                                                                {emoji} <span className="text-text-muted">{count}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Context menu */}
                                                {contextMenu?._id === msg._id && !isDeleted && (
                                                    <div className={`absolute z-30 ${isMe ? 'right-0' : 'left-0'} mt-1 bg-surface border border-border/50 rounded-xl shadow-xl py-1.5 min-w-[160px]`}
                                                        onClick={e => e.stopPropagation()}>
                                                        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/50">
                                                            {REACTION_EMOJIS.map(emoji => (
                                                                <button key={emoji} onClick={() => handleReaction(msg._id, emoji)}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-card text-sm transition-colors">{emoji}</button>
                                                            ))}
                                                        </div>
                                                        <button onClick={() => startReply(msg)} className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-text-secondary hover:bg-card hover:text-text-primary transition-colors">
                                                            <Reply className="w-3.5 h-3.5" /> Reply
                                                        </button>
                                                        {isMe && (
                                                            <>
                                                                <button onClick={() => startEdit(msg)} className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-text-secondary hover:bg-card hover:text-text-primary transition-colors">
                                                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                                                </button>
                                                                <button onClick={() => handleDelete(msg._id)} className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Typing indicator */}
                        {getTypingText() && (
                            <div className="px-5 pb-1 shrink-0">
                                <p className="text-xs text-accent animate-pulse">{getTypingText()}</p>
                            </div>
                        )}

                        {/* Reply/Edit bar */}
                        {(replyTo || editingMsg) && (
                            <div className="px-3 md:px-5 pt-2 shrink-0">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl bg-card border border-border/50 border-b-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-accent font-medium">{editingMsg ? 'Editing message' : `Replying to ${replyTo?.senderName}`}</p>
                                        <p className="text-xs text-text-muted truncate">{(editingMsg || replyTo)?.text}</p>
                                    </div>
                                    <button onClick={() => { setReplyTo(null); setEditingMsg(null); setMessageText(''); }} className="text-text-muted hover:text-text-primary shrink-0">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Input bar */}
                        <div className={`px-3 md:px-5 ${replyTo || editingMsg ? '' : 'pt-2'} pb-2 md:pb-5 shrink-0`}>
                            <div className={`flex items-center gap-2 md:gap-3 bg-surface border border-border/50 px-3 md:px-4 py-2 focus-within:border-accent/50 transition-colors ${replyTo || editingMsg ? 'rounded-b-xl rounded-t-none' : 'rounded-xl'}`}>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                                    className="text-text-muted hover:text-text-primary transition-colors shrink-0 disabled:opacity-30">
                                    {uploading ? <span className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin block" /> : <Paperclip className="w-4 h-4" />}
                                </button>
                                <div className="relative shrink-0">
                                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-text-muted hover:text-text-primary transition-colors">
                                        <Smile className="w-4 h-4" />
                                    </button>
                                    {showEmojiPicker && (
                                        <>
                                            <div className="fixed inset-0 z-30" onClick={() => setShowEmojiPicker(false)} />
                                            <div className="absolute bottom-10 left-0 z-40">
                                                <EmojiPicker
                                                    onEmojiClick={(e) => { setMessageText(prev => prev + e.emoji); setShowEmojiPicker(false); inputRef.current?.focus(); }}
                                                    theme="dark" width={300} height={350}
                                                    searchDisabled skinTonesDisabled previewConfig={{ showPreview: false }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted focus:outline-none min-w-0"
                                    placeholder={editingMsg ? 'Edit your message...' : 'Type a message...'}
                                    value={messageText}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                />
                                <button onClick={handleSend} disabled={!messageText.trim()}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0">
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

            {/* Modals */}
            {showProfileModal && <ProfileModal user={currentUser} onClose={() => setShowProfileModal(false)} onUpdate={setCurrentUser} />}
            {showNewChatModal && <NewChatModal onClose={() => setShowNewChatModal(false)} onCreated={handleNewConversation} />}
        </div>
    );
}
