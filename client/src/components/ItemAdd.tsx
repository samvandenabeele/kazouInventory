import type { AxiosInstance } from "axios";

interface ItemAddProps {
  api: AxiosInstance;
}

function ItemAdd({ api }: ItemAddProps) {
  const itemAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    api
      .post("/api/add_item", {
        description: data.description,
        quantity: Number(data.quantity),
      })
      .catch((error) => {
        console.error("Error adding item:", error);
      })
      .finally(() => {
        form.reset();
      });
  };
  return (
    <>
      <h1>Item(s) toevoegen</h1>
      <form id="addItemForm" onSubmit={itemAddSubmit}>
        <input
          type="text"
          name="description"
          placeholder="blauwe stylo's"
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="120"
          min="1"
          required
        />
        <button type="submit">Item(s) toevoegen</button>
      </form>
    </>
  );
}

export default ItemAdd;
