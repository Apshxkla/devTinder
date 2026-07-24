const Loader = ({ fullScreen = false, label = "Loading..." }) => (
  <div className={fullScreen ? "min-h-screen flex items-center justify-center" : "flex items-center justify-center py-10"}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

export default Loader;
