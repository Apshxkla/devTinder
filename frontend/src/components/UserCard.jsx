const UserCard = ({ user, onIgnore, onInterested, disabled, swipeDirection }) => {
  return (
    <div className={`card w-full max-w-sm mx-auto overflow-hidden relative ${swipeDirection === 'left' ? 'swipe-left' : swipeDirection === 'right' ? 'swipe-right' : ''}`}>
      <div className="h-96 w-full bg-slate-800 relative">
        <img src={user.photoUrl} alt={user.firstName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">
              {user.firstName} {user.lastName}
            </h2>
            {user.age && <span className="text-slate-200 text-lg drop-shadow-md">{user.age}</span>}
          </div>
          {user.location && <p className="text-sm text-slate-300 mt-1 drop-shadow-md">{user.location}</p>}
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm text-slate-300 mt-1 line-clamp-3">{user.about}</p>
        {user.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {user.skills.slice(0, 6).map((skill) => (
              <span key={skill} className="skill-pill">{skill}</span>
            ))}
          </div>
        )}
        <div className="flex gap-4 mt-6">
          <button onClick={onIgnore} disabled={disabled} className="btn-secondary flex-1 py-3 text-lg rounded-xl">
            Pass
          </button>
          <button onClick={onInterested} disabled={disabled} className="btn-primary flex-1 py-3 text-lg rounded-xl">
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
