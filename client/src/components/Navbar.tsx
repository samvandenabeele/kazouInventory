import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  // Listen for localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    // Check on mount and when storage changes
    window.addEventListener("storage", checkLoginStatus);

    // Custom event for same-tab updates
    window.addEventListener("loginStatusChanged", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("loginStatusChanged", checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login");
  };

  return (
    <>
      <Link to="/">
        <button>Home</button>
      </Link>
      {isLoggedIn && (
        <>
          <Link to="/itemTable">
            <button>Bekijk inventaris</button>
          </Link>
          <Link to="/item_add">
            <button>Leen materiaal</button>
          </Link>
          <button onClick={handleLogout}>Uitloggen</button>
        </>
      )}
      {!isLoggedIn && (
        <>
          <Link to="/signUp">
            <button>aanmelden</button>
          </Link>
          <Link to="/login">
            <button>inloggen</button>
          </Link>
        </>
      )}
    </>
  );
}

export default Navbar;
