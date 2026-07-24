import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { useSocketEvent } from "../hooks/useSocket";
import { useSocketContext } from "../context/SocketContext";
import Loader from "./Loader";

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ChatWindow = ({ targetUser }) => {
  const { user } = useAuth();
  const { onlineUsers } = useSocketContext();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const online = onlineUsers.has(targetUser._id);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/messages/${targetUser._id}`)
      .then(({ data }) => active && setMessages(data.data.messages))
      .catch(() => active && setMessages([]))
      .finally(() => active && setLoading(false));

    const socket = getSocket();
    socket.emit("joinChat", { targetUserId: targetUser._id });

    return () => {
      active = false;
    };
  }, [targetUser._id]);

  useSocketEvent(
    "messageReceived",
    (msg) => {
      const isRelevant =
        (msg.senderId === targetUser._id && msg.receiverId === user._id) ||
        (msg.senderId === user._id && msg.receiverId === targetUser._id);
      if (isRelevant) setMessages((prev) => [...prev, msg]);
    },
    [targetUser._id, user._id]
  );

  useSocketEvent("typing", ({ userId }) => {
    if (userId === targetUser._id) {
      setIsTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setIsTyping(false), 2000);
    }
  }, [targetUser._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const socket = getSocket();
    socket.emit("sendMessage", { targetUserId: targetUser._id, text: trimmed });
    setText("");
  };

  const handleTyping = () => {
    const socket = getSocket();
    socket.emit("typing", { targetUserId: targetUser._id });
  };

  return (
    <div className="card flex flex-col h-[70vh]">
      <div className="flex items-center gap-3 p-4 border-b border-slate-800">
        <img src={targetUser.photoUrl} alt={targetUser.firstName} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="font-medium">{targetUser.firstName} {targetUser.lastName}</p>
          <p className={`text-xs ${online ? "text-emerald-400" : "text-slate-500"}`}>
            {isTyping ? "typing..." : online ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <Loader label="Loading chat history..." />
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500 mt-10">
            No messages yet. Say hi to {targetUser.firstName}!
          </p>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderId === user._id;
            return (
              <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                    mine ? "bg-brand-600 text-white rounded-br-sm" : "bg-slate-800 text-slate-100 rounded-bl-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-brand-100" : "text-slate-500"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message..."
          className="input-field"
        />
        <button type="submit" disabled={!text.trim()} className="btn-primary">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
