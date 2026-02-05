import React from "react";
import type { AxiosInstance } from "axios";
import { Link } from "react-router-dom";

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
    <div className="flex flex-col items-center w-full p-4">
      <div className="w-full overflow-auto rounded-lg shadow border-2 border-gray-300">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="p-3 text-sm font-semibold tracking-wide text-left">
                Description
              </th>
              <th className="w-20 p-3 text-sm font-semibold tracking-wide text-left">
                Total
              </th>
              <th className=" w-20 p-3 text-sm font-semibold tracking-wide text-left">
                Available
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((item, idx) => (
              <tr
                key={idx}
                className="bg-white odd:bg-gray-50 whitespace-nowrap"
              >
                <td className="p-3 text-sm text-gray-700">
                  <Link to={`/item/${encodeURIComponent(item.description)}`}>
                    {item.description}
                  </Link>
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  {item.quantity}
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                  {item.available}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="m-10 flex">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="w-25 px-4 py-2 rounded-l-md text-sm font-medium text-gray-800 bg-yellow-300 hover:bg-blue-400 hover:text-white hover:border hover:underline transition-colors border-r-2 border-gray-400"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-sm font-medium text-gray-800 bg-yellow-300">
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages - 1}
          className="w-25 px-4 py-2 rounded-r-md text-sm font-medium text-gray-800 bg-yellow-300 hover:bg-blue-400 hover:text-white hover:border hover:underline transition-colors border-l-2 border-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}
export default ItemTable;
