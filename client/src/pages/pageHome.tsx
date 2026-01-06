import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function PageHome() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center min-h-screen space-y-4">
      <h1 className="py-4 text-4xl font-bold text-gray-900">
        Welcome to the Home Page
      </h1>
      {user ? (
        <nav>
          <ul className="flex flex-col items-center space-y-2">
            <li className="px-4 py-2 rounded-md text-sm font-medium text-gray-800 bg-yellow-300 hover:bg-yellow-300/80 transition-colors">
              <Link to="/itemTable">Bekijk inventaris</Link>
            </li>
            <li className="px-4 py-2 rounded-md text-sm font-medium text-gray-800 bg-yellow-300 hover:bg-yellow-300/80 transition-colors">
              <Link to="/item_add">Materiaal toevoegen</Link>
            </li>
          </ul>
        </nav>
      ) : (
        <>
          <div>log in om de inventaris te bekijken of aan te passen</div>
          <Link
            to="/login"
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-800 bg-yellow-300 hover:bg-yellow-300/80 transition-colors"
          >
            Log in
          </Link>
        </>
      )}
    </div>
  );
}

export default PageHome;
