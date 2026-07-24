import { useEffect, useState } from "react";
import api from "../services/api";
import ConnectionCard from "../components/ConnectionCard";
import Loader from "../components/Loader";

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/connections")
      .then(({ data }) => setConnections(data.data.connections))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;

  const filtered = connections.filter((c) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Your Connections</h1>
          <p className="text-slate-400 text-sm">Developers you're already connected with.</p>
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search connections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}

      {connections.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-lg font-medium">No connections yet</p>
          <p className="text-sm text-slate-500 mt-2">Head to the feed to start connecting with developers.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm text-slate-500 mt-2">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <ConnectionCard key={c._id} connection={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Connections;
