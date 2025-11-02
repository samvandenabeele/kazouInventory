import React from "react";
import type { AxiosInstance } from "axios";

interface ItemTableProps {
  api: AxiosInstance;
}

function ItemTable({ api }: ItemTableProps) {
  const [libraries, setLibraries] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(libraries.length / rowsPerPage);

  React.useEffect(() => {
    setLoading(true);
    api
      .get("/api/get_inventory")
      .then((response) => {
        setLibraries(response.data.inventory);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load inventory");
        console.error("Error fetching inventory:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [api]);

  const handlePrev = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const paginatedData = libraries.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

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
