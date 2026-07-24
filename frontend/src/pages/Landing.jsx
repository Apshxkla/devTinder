import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { user } = useAuth();

  if (user) return <Navigate to="/feed" replace />;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 text-center">
      <div className="max-w-4xl space-y-10 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-500 to-purple-600 drop-shadow-sm pb-2">
          Connect. Code. Collaborate.
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          DevTinder is the premier networking platform for developers. Find your next co-founder, open-source contributor, or coding mentor. Swipe through profiles and start building together.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/signup" className="btn-primary text-lg px-8 py-3.5 w-full sm:w-auto shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 rounded-xl">
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-3.5 w-full sm:w-auto border border-slate-700 rounded-xl hover:bg-slate-800">
            Log In
          </Link>
        </div>
        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="card p-8 border-t-2 border-t-brand-500 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Find Matches</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Discover talented developers based on their technical skills, location, and shared interests.</p>
          </div>
          <div className="card p-8 border-t-2 border-t-indigo-500 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Connect</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Send connection requests to developers you want to collaborate with and expand your network.</p>
          </div>
          <div className="card p-8 border-t-2 border-t-purple-500 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Build Together</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Chat in real-time, share ideas, and start building your next big side project or startup.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
