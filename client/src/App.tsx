import Navbar from "./components/Navbar.tsx";
import DataTable from "./components/DataTable.tsx";
import ItemForm from "./components/ItemForm.tsx";
import "./App.css";

function App() {
  const dataTable: Array<[string, string, string]> = [
    ["stift", "zwarte style", "A0001A"],
    ["plakband", "plakband 10m", "A0002A"],
    ["DuctTape", "ductape 50m x 5cm", "A0003A"],
  ];

  return (
    <>
      <Navbar />
      <div className="container-fluid d-flex flex-column align-items-center">
        <DataTable
          tableItems={dataTable}
          header="Inventaris individueel materiaal"
        />
        <ItemForm />
      </div>
    </>
  );
}

export default App;
