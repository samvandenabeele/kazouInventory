import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PageSignUp from "./pages/pageSignUp.tsx";
import PageLogin from "./pages/pageLogin.tsx";
import PageItem from "./pages/pageItem.tsx";
import PageItemTable from "./pages/pageItemTable.tsx";
import PageHome from "./pages/pageHome.tsx";
import PageItemAdd from "./pages/pageItemAdd.tsx";
import Layout from "./Layout.tsx";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function PageItemWrapper() {
  const { itemDescription } = useParams<{ itemDescription: string }>();
  if (!itemDescription) {
    return <Navigate to="/" />;
  }
  return <PageItem item={decodeURIComponent(itemDescription)} />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem("isLoggedIn") === "true";
  });

  // Update localStorage whenever isLoggedIn changes
  useEffect(() => {
    localStorage.setItem("isLoggedIn", String(isLoggedIn));
  }, [isLoggedIn]);

  // Listen for login status changes from other components
  useEffect(() => {
    const handleLoginStatusChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("loginStatusChanged", handleLoginStatusChange);
    return () => {
      window.removeEventListener("loginStatusChanged", handleLoginStatusChange);
    };
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/item_add" element={<PageItemAdd />} />
            <Route
              path="/login"
              element={<PageLogin setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route
              path="/signUp"
              element={<PageSignUp setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route
              path="/item/:itemDescription"
              element={
                isLoggedIn ? <PageItemWrapper /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/itemTable"
              element={
                isLoggedIn ? <PageItemTable /> : <Navigate to="/login" />
              }
            />
            <Route path="/" element={<PageHome />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
