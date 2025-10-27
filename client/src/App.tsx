import axios from "axios";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import PageItemUse from "./pages/pageItemUse.tsx";
import PageItemTable from "./pages/pageItemTable.tsx";
import PageHome from "./pages/pageHome.tsx";
import Layout from "./Layout.tsx";

function App() {
  axios.defaults.baseURL = `http://${window.location.hostname}:5000`;

  return (
    <>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/itemChange" element={<PageItemUse api={axios} />} />
            <Route path="/itemTable" element={<PageItemTable api={axios} />} />
            <Route path="/" element={<PageHome />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
