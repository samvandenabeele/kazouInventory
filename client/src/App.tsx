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
import { useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

function PageItemWrapper() {
  const { itemDescription } = useParams<{ itemDescription: string }>();
  if (!itemDescription) {
    return <Navigate to="/" />;
  }
  return <PageItem item={decodeURIComponent(itemDescription)} />;
}

function App() {
  const { user } = useAuth();

  return (
    <>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/item_add" element={<PageItemAdd />} />
            <Route path="/login" element={<PageLogin />} />
            <Route path="/signUp" element={<PageSignUp />} />
            <Route
              path="/item/:itemDescription"
              element={user ? <PageItemWrapper /> : <Navigate to="/login" />}
            />
            <Route
              path="/itemTable"
              element={user ? <PageItemTable /> : <Navigate to="/login" />}
            />
            <Route path="/" element={<PageHome />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
