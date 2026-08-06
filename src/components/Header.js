export default function Header({ user, onLogin, onLogout }) {
  return (
    <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          ></path>
        </svg>
        <h1 className="font-bold tracking-wide">Money Hub</h1>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm">
          {user ? `${user.email}` : "You are not logged in"}
        </p>
      </div>

      {/* DYNAMIC AUTH BUTTON */}
      {user ? (
        <button
          onClick={onLogout}
          className="text-xs bg-red-600 hover:bg-red-500 transition-colors px-3 py-1.5 rounded text-white font-bold"
        >
          Sign Out
        </button>
      ) : (
        <button
          onClick={onLogin}
          className="text-xs bg-blue-600 hover:bg-blue-500 transition-colors px-3 py-1.5 rounded text-white font-bold"
        >
          Log In
        </button>
      )}
    </header>
  );
}
