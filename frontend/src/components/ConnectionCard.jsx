import { Link } from "react-router-dom";
import { useSocketContext } from "../context/SocketContext";

const ConnectionCard = ({ connection }) => {
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.has(connection._id);

  return (
    <div className="card p-4 flex gap-4 items-start relative overflow-hidden group">
      <div className="relative flex-shrink-0">
        <img
          src={connection.photoUrl}
          alt={connection.firstName}
          className="w-16 h-16 rounded-xl object-cover border border-slate-800"
        />
        {isOnline && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate text-slate-100 group-hover:text-brand-400 transition-colors">
          {connection.firstName} {connection.lastName}
        </h3>
        {connection.location && <p className="text-xs text-slate-500">{connection.location}</p>}
        {connection.lastMessage ? (
          <div className="mt-2 text-sm">
            <p className={`line-clamp-1 ${connection.unreadCount > 0 ? "text-slate-200 font-medium" : "text-slate-400"}`}>
              {connection.lastMessage.senderId === connection._id ? "" : "You: "}
              {connection.lastMessage.text}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{connection.about}</p>
        )}
        
        <div className="flex items-center gap-2 mt-3">
          <Link to={`/chat/${connection._id}`} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 w-max">
            <span>Open Chat</span>
            {connection.unreadCount > 0 && (
              <span className="bg-white text-brand-600 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                {connection.unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;
