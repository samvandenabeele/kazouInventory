import axios from "axios";
import React from "react";

import ItemAdd from "./components/ItemAdd.tsx";
import ItemTable from "./components/ItemTable.tsx";
import ItemLoan from "./components/ItemLoan.tsx";

function App() {
  axios.defaults.baseURL = "http://localhost:5000";
  const [libraries, setLibraries] = React.useState<any[]>([]);

  React.useEffect(() => {
    axios.get("/api/get_inventory").then((response) => {
      // Extract the inventory array from the response JSON object
      setLibraries(response.data.inventory);
    });
  }, []);

  const onItemChange = () => {
    axios.get("/api/get_inventory").then((response) => {
      // Extract the inventory array from the response JSON object
      setLibraries(response.data.inventory);
    });
  };

  return (
    <>
      <ItemAdd api={axios} onAdd={onItemChange} />
      <ItemLoan api={axios} onLoan={onItemChange} />
      <ItemTable data={libraries} />
    </>
  );
}

export default App;
