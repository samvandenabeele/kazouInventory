import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-emerald-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <img
              src="/logoJOMBA_LOKAL.svg"
              alt="Logo_Bombal"
              className="h-16 w-20"
            />
            <Link to="/">
              <button className="px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white hover:underline transition-colors border bg-white/10 border-gray-800">
                Home
              </button>
            </Link>
            {user && (
              <>
                <Link to="/itemTable">
                  <button className="px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white hover:underline transition-colors">
                    Bekijk inventaris
                  </button>
                </Link>
                <Link to="/item_add">
                  <button className="px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white hover:underline transition-colors">
                    Materiaal toevoegen
                  </button>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white hover:underline transition-colors"
                >
                  Uitloggen
                </button>
              </>
            )}
          </div>
          {!user && (
            <div className="flex items-center space-x-4">
              <Link to="/signUp">
                <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-800 bg-yellow-300 hover:bg-blue-400 hover:text-white hover:border hover:underline transition-colors">
                  Aanmelden
                </button>
              </Link>
              <Link to="/login">
                <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-800 bg-yellow-300 hover:bg-blue-400 hover:text-white hover:border hover:underline transition-colors">
                  Inloggen
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
