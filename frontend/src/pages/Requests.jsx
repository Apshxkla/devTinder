import { useEffect, useState } from "react";
import api from "../services/api";
import Loader from "../components/Loader";

const Requests = () => {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([api.get("/request/received"), api.get("/request/sent")]);
      setReceived(r1.data.data.requests);
      setSent(r2.data.data.requests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (requestId, status) => {
    setBusyId(requestId);
    try {
      await api.patch(`/request/review/${status}/${requestId}`);
      setReceived((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      {error && <p className="text-rose-400 text-sm">{error}</p>}

      <section>
        <h2 className="text-xl font-bold mb-4">Received Requests</h2>
        {received.length === 0 ? (
          <p className="text-sm text-slate-500">No pending requests right now.</p>
        ) : (
          <div className="space-y-3">
            {received.map((req) => (
              <div key={req._id} className="card p-4 flex items-center gap-4">
                <img src={req.fromUserId.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{req.fromUserId.firstName} {req.fromUserId.lastName}</p>
                  {req.fromUserId.location && <p className="text-xs text-slate-500 truncate">{req.fromUserId.location}</p>}
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{req.fromUserId.about}</p>
                  {req.fromUserId.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {req.fromUserId.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="skill-pill">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  disabled={busyId === req._id}
                  onClick={() => review(req._id, "rejected")}
                  className="btn-secondary text-sm"
                >
                  Reject
                </button>
                <button
                  disabled={busyId === req._id}
                  onClick={() => review(req._id, "accepted")}
                  className="btn-primary text-sm"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Sent Requests</h2>
        {sent.length === 0 ? (
          <p className="text-sm text-slate-500">You haven't sent any requests yet.</p>
        ) : (
          <div className="space-y-3">
            {sent.map((req) => (
              <div key={req._id} className="card p-4 flex items-center gap-4">
                <img src={req.toUserId.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{req.toUserId.firstName} {req.toUserId.lastName}</p>
                  {req.toUserId.location && <p className="text-xs text-slate-500 truncate">{req.toUserId.location}</p>}
                  <p className="text-xs font-semibold mt-1 capitalize text-brand-400">Status: {req.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Requests;
