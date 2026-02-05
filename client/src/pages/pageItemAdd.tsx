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
      <form
        onSubmit={handleItemAdd}
        className="py-4 flex flex-col items-center min-h-screen space-y-4"
      >
        {errorMessage && (
          <div className="border-2 border-red-600 rounded-md px-2 py-2">
            {errorMessage}
          </div>
        )}
        {succesMessage && (
          <div className="border-2 border-green-600 rounded-md px-2 py-2">
            {succesMessage}
          </div>
        )}
        <h1 className="py-4 text-4xl font-bold text-gray-900">
          item toevoegen aan inventaris
        </h1>
        <div>naam item</div>
        <input
          type="text"
          name="itemName"
          className="px-2 py-2 rounded-md border-2 border-gray-800"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md text-sm font-medium text-gray-800 bg-yellow-300 hover:bg-blue-400 hover:text-white hover:border hover:underline transition-colors"
        >
          item toevoegen
        </button>
      </form>
    </>
  );
}

export default item_add;
