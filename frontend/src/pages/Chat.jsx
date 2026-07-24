import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import ChatWindow from "../components/ChatWindow";
import Loader from "../components/Loader";

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/connections")
      .then(({ data }) => setConnections(data.data.connections))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;

  const activeUser = connections.find((c) => c._id === userId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
      <div className="card p-3 md:col-span-1 h-fit">
        <h2 className="font-semibold px-2 py-1 mb-1">Conversations</h2>
        {connections.length === 0 ? (
          <p className="text-sm text-slate-500 px-2 py-4">No connections to chat with yet.</p>
        ) : (
          <div className="space-y-1">
            {connections.map((c) => (
              <button
                key={c._id}
                onClick={() => navigate(`/chat/${c._id}`)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                  c._id === userId ? "bg-brand-600/20 border border-brand-500/40" : "hover:bg-slate-800"
                }`}
              >
                <img src={c.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                <span className="text-sm truncate">{c.firstName} {c.lastName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        {activeUser ? (
          <ChatWindow targetUser={activeUser} />
        ) : (
          <div className="card h-[70vh] flex items-center justify-center text-slate-500 text-sm">
            Select a connection to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
