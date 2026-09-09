import icon from "../app/icon.png";

export default function Header({ user, onLogin, onLogout }) {
  return (
    <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10 gap-4">
      <div className="flex items-center gap-2 shrink-0">
        <img src={icon.src} alt="App Icon" className="w-8 h-8" />
        <h1 className="font-bold tracking-wide whitespace-nowrap">
          Swindles Shanix
        </h1>
      </div>

      <div className="flex items-center gap-4 min-w-0 justify-end">
        <p className="text-sm truncate">
          {user ? `${user.email}` : "You are not logged in"}
        </p>

        {user ? (
          <button
            onClick={onLogout}
            className="text-xs bg-red-600 hover:bg-red-500 transition-colors px-3 py-1.5 rounded text-white font-bold whitespace-nowrap shrink-0"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="text-xs bg-blue-600 hover:bg-blue-500 transition-colors px-3 py-1.5 rounded text-white font-bold whitespace-nowrap shrink-0"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
}
