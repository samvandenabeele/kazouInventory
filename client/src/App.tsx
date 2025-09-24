import ItemManager from "./components/ItemManager";
import axios from "axios";

function App() {
  let api = axios.create({
    baseURL: "https://localhost:5000/api/",
  });

  return <ItemManager />;
}

export default App;
