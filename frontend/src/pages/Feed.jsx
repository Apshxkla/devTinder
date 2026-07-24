import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import UserCard from "../components/UserCard";
import Loader from "../components/Loader";

const Feed = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [error, setError] = useState("");
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadFeed = useCallback(async (p = 1, append = false) => {
    if (!append) setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/feed?page=${p}&limit=10`);
      const newUsers = data.data.users;
      if (append) {
        setUsers((prev) => [...prev, ...newUsers]);
      } else {
        setUsers(newUsers);
      }
      setHasMore(newUsers.length === 10);
      setPage(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleAction = async (userId, status) => {
    setActioning(true);
    setSwipeDirection(status === "interested" ? "right" : "left");
    
    try {
      await api.post(`/request/send/${status}/${userId}`);
      setTimeout(() => {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setSwipeDirection(null);
        setActioning(false);
      }, 400); // wait for animation
    } catch (err) {
      setError(err.message);
      setSwipeDirection(null);
      setActioning(false);
    }
  };

  if (loading) return <Loader fullScreen label="Finding developers for you..." />;

  const current = users[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Discover Developers</h1>
      <p className="text-slate-400 text-sm mb-8">Swipe through profiles and connect with fellow builders.</p>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg px-3 py-2 mb-6 max-w-sm mx-auto">
          {error}
        </div>
      )}

      {!current ? (
        <div className="card max-w-sm mx-auto p-10 text-center animate-fade-in">
          <p className="text-lg font-medium">You're all caught up!</p>
          <p className="text-sm text-slate-500 mt-2 mb-4">No new developers to show right now.</p>
          <button onClick={() => loadFeed(1, false)} className="btn-secondary text-sm">
            Refresh
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <UserCard
            user={current}
            disabled={actioning}
            swipeDirection={swipeDirection}
            onIgnore={() => handleAction(current._id, "ignored")}
            onInterested={() => handleAction(current._id, "interested")}
          />
          {users.length < 3 && hasMore && (
            <button
              onClick={() => loadFeed(page + 1, true)}
              className="mt-6 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
            >
              Load more developers ↓
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;
