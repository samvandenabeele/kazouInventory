import { useEffect, useState } from "react";
import api from "../components/api";
import { useNavigate } from "react-router-dom";

interface PageItemInterface {
  item: string;
}

export default function PageItem({ item }: PageItemInterface) {
  const navigate = useNavigate();
  if (item === "") {
    navigate("/");
  }

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [succesMessage, setSuccessMessage] = useState<string>("");

  function handleTransactionForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const url = "/api/transaction/" + data.transaction_type;

    api
      .post(url, {
        item_description: item,
        quantity: data.quantity,
      })
      .then((response) => {
        setSuccessMessage(response.data.message);
        setErrorMessage("");
      })
      .catch((response) => {
        setSuccessMessage("");
        setErrorMessage(response.data.error);
      });
  }

  const [libraries, setLibraries] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rowsPerPage = 10;
  const totalPages = Math.ceil((libraries?.length || 0) / rowsPerPage);

  useEffect(() => {
    setLoading(true);

    const url = "/api/item/" + item;

    api
      .get(url)
      .then((response) => {
        setLibraries(response.data.transaction_list);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load inventory");
        console.error("Error fetching inventory:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [item]);

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
    <>
      <h1>Transacties voor {item}</h1>
      <form id="transactionForm" onSubmit={handleTransactionForm}>
        {errorMessage && (
          <div
            style={{
              color: "red",
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid red",
              borderRadius: "4px",
            }}
          >
            {errorMessage}
          </div>
        )}
        {succesMessage && (
          <div
            style={{
              color: "green",
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid green",
              borderRadius: "4px",
            }}
          >
            {succesMessage}
          </div>
        )}
        <select name="transaction_type" id="transaction_selector">
          <option value="borrow" selected>
            lening
          </option>
          <option value="return">teruggave</option>
          <option value="purchase">aankoop</option>
          <option value="dispose">verwijdering</option>
        </select>
        <input type="number" name="quantity" placeholder="10" required />
        <button type="submit">transactie uitvoeren</button>
      </form>
      <div>
        <table>
          <thead>
            <tr>
              <th>Transactietype</th>
              <th>Hoeveelheid</th>
              <th>datum</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id}>
                <td>{item.transaction_type}</td>
                <td>{item.quantity}</td>
                <td>{item.date}</td>
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
    </>
  );
}
