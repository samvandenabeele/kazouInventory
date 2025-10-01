import ItemAdd from "./components/ItemAdd.tsx";
import axios from "axios";

function App() {
  axios.defaults.baseURL = "http://localhost:5000";
  return <ItemAdd api={axios} />;
}

export default App;
