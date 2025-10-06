import React from "react";

interface Item {
  description: string;
  quantity: number;
  loaned: number;
}

interface propsItemTable {
  data: Item[];
}

function ItemTable({ data }: propsItemTable) {
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handlePrev = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Total Amount</th>
            <th>Amount Loaned</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, idx) => (
            <tr key={idx}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{item.loaned}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "10px" }}>
        <button onClick={handlePrev} disabled={page === 0}>
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {page + 1} of {totalPages}
        </span>
        <button onClick={handleNext} disabled={page === totalPages - 1}>
          Next
        </button>
      </div>
    </div>
  );
}
export default ItemTable;
