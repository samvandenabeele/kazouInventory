interface PropsDataTable {
  tableItems: Array<[string, string, string]>;
  header: string;
}

function DataTable(tableContent: PropsDataTable) {
  return (
    <>
      <h1>{tableContent.header}</h1>
      <div>
        <form style={{ maxWidth: 300 }} role="search">
          <input
            type="search"
            placeholder="Search"
            aria-label="Search"
            data-bs-theme="light"
            style={{ width: 160 }}
          />
          <button type="submit">Search</button>
        </form>
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Item Name</th>
              <th scope="col">Description</th>
              <th scope="col">Code</th>
            </tr>
          </thead>
          <tbody>
            {tableContent.tableItems.map((row, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default DataTable;
