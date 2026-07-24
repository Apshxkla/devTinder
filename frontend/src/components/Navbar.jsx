import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const linkClass = ({ isActive }) =>
  `px-3 py-2 flex flex-col md:flex-row items-center gap-1 rounded-lg text-xs md:text-sm font-medium transition-colors ${
    isActive ? "bg-brand-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
  }`;

const IconFeed = () => <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const IconRequests = () => <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const IconConnections = () => <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconChat = () => <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const IconProfile = () => <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [reqCount, setReqCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get("/request/received")
        .then(res => setReqCount(res.data.data.requests.length))
        .catch(() => {});
    }
  }, [user, location.pathname]); // re-fetch when path changes to keep it updated

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold text-brand-400">{"<DevTinder />"}</span>
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/feed" className={linkClass}>Feed</NavLink>
            <NavLink to="/requests" className={linkClass}>
              Requests
              {reqCount > 0 && (
                <span className="bg-brand-500 text-white rounded-full px-1.5 py-0.5 text-[10px] ml-1">{reqCount}</span>
              )}
            </NavLink>
            <NavLink to="/connections" className={linkClass}>Connections</NavLink>
            <NavLink to="/chat" className={linkClass}>Chat</NavLink>
            <NavLink to="/profile" className={linkClass}>Profile</NavLink>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={user.photoUrl}
            alt={user.firstName}
            className="w-8 h-8 rounded-full object-cover border border-slate-700"
          />
          <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-rose-400 transition-colors">
            Logout
          </button>
        </div>
      </div>
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800 py-2 pb-safe">
        <NavLink to="/feed" className={linkClass}>
          <IconFeed /><span>Feed</span>
        </NavLink>
        <NavLink to="/requests" className={linkClass}>
          <div className="relative">
            <IconRequests />
            {reqCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-500 rounded-full border border-slate-950" />}
          </div>
          <span>Requests</span>
        </NavLink>
        <NavLink to="/connections" className={linkClass}>
          <IconConnections /><span>Conns</span>
        </NavLink>
        <NavLink to="/chat" className={linkClass}>
          <IconChat /><span>Chat</span>
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <IconProfile /><span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
