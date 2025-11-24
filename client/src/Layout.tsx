import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import api from "./components/api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
function Layout() {
  let navigate = useNavigate();

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
