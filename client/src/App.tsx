import axios from "axios";
import {
  HashRouter as Router,
  Routes,
  Route,
  redirect,
} from "react-router-dom";

import PageSignUp from "./pages/pageSignUp.tsx";
import PageLogin from "./pages/pageLogin.tsx";
import PageItemUse from "./pages/pageItemUse.tsx";
import PageItemTable from "./pages/pageItemTable.tsx";
import PageHome from "./pages/pageHome.tsx";
import Layout from "./Layout.tsx";

function App() {
  const api = axios.create({
    baseURL: "http://${window.location.hostname}:5000",
  });
  // axios.defaults.baseURL = `http://${window.location.hostname}:5000`;

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        redirect("/login");
      }
      return Promise.reject(err);
    }
  );

  return (
    <>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<PageLogin api={api} />} />
            <Route path="/signUp" element={<PageSignUp api={api} />} />
            <Route path="/itemChange" element={<PageItemUse api={api} />} />
            <Route path="/itemTable" element={<PageItemTable api={api} />} />
            <Route path="/" element={<PageHome />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
