import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/profile/view")
      .then(({ data }) => {
        setProfile(data.data.user);
        setConnectionCount(data.data.connectionCount);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;
  if (!profile) return null;

  const calculateCompleteness = () => {
    const fields = ['firstName', 'lastName', 'age', 'gender', 'photoUrl', 'about', 'skills', 'location'];
    const filled = fields.filter(f => {
      if (Array.isArray(profile[f])) return profile[f].length > 0;
      return profile[f] && String(profile[f]).trim() !== '';
    }).length;
    return Math.round((filled / fields.length) * 100);
  };
  const completeness = calculateCompleteness();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="card p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <img
            src={profile.photoUrl}
            alt={profile.firstName}
            className="w-28 h-28 rounded-2xl object-cover border border-slate-800"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h1 className="text-2xl font-bold">
                {profile.firstName} {profile.lastName}
                {profile.age && <span className="text-slate-400 font-normal text-lg"> · {profile.age}</span>}
              </h1>
              <Link to="/profile/edit" className="btn-secondary text-sm">
                Edit Profile
              </Link>
            </div>
            {profile.location && <p className="text-slate-500 text-sm mt-1">{profile.location}</p>}
            <p className="text-sm text-slate-300 mt-4">{profile.about}</p>

            {profile.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {profile.skills.map((skill) => (
                  <span key={skill} className="skill-pill">{skill}</span>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
              <span className="font-semibold text-slate-100">{connectionCount}</span> connections
              <span className="mx-1">•</span>
              <span>Member since {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Profile Completeness</span>
                <span className="text-sm text-brand-400">{completeness}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-brand-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${completeness}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
