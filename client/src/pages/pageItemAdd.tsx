import { useState } from "react";
import api from "../components/api";

function item_add() {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [succesMessage, setSuccessMessage] = useState<string>("");

  function handleItemAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Client-side validation
    const itemName = String(data.itemName || "").trim();

    if (!itemName) {
      setErrorMessage("Item name is required");
      return;
    }

    const payload = {
      description: itemName,
    };
    api
      .post("/api/add_item", payload)
      .then((response) => {
        console.log("Response received:", response);
        setSuccessMessage(response.data.message || "Item added succesfully");
        setErrorMessage("");
        form.reset();
      })
      .catch((error) => {
        console.error("Error adding item:", error);
        setSuccessMessage("");
        if (error.response?.data) {
          const serverMessage =
            error.response.data?.error || error.response.data?.message;
          setErrorMessage(serverMessage || "Failed to add item");
        } else if (error.request) {
          setErrorMessage("Network error. Please check your connection.");
        } else {
          setErrorMessage(error.message || "An unexpected error occurred.");
        }
      });
  }

  return (
    <>
      <form onSubmit={handleItemAdd}>
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
        <h1>item toevoegen aan inventaris</h1>
        <div>naam item</div>
        <input type="text" name="itemName" />
        <button type="submit">item toevoegen</button>
      </form>
    </>
  );
}

export default item_add;
