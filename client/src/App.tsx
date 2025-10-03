import ItemAdd from "./components/ItemAdd.tsx";
import ItemTable from "./components/ItemTable.tsx";
import axios from "axios";
import React from "react";

function App() {
  axios.defaults.baseURL = "http://localhost:5000";
  const [libraries, setLibraries] = React.useState<any[]>([]);

  React.useEffect(() => {
    axios.get("/get_inventory").then((response) => {
      // Extract the inventory array from the response JSON object
      setLibraries(response.data.inventory);
    });
  }, []);

  return (
    <>
      <ItemAdd api={axios} />
      <ItemTable data={libraries} />
    </>
  );
}

export default App;
