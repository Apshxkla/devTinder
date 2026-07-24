const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} DevTinder. Built for developers.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
