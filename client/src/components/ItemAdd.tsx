import type { AxiosInstance } from "axios";

interface ItemAddProps {
  api: AxiosInstance;
}

function ItemAdd({ api }: ItemAddProps) {
  const itemAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    api
      .post("/api/add_item", {
        description: data.description,
        quantity: Number(data.quantity),
      })
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        console.error("Error adding item:", error);
      });
  };
  return (
    <>
      <h1>Item(s) toevoegen</h1>
      <form id="addItemForm" onSubmit={itemAddSubmit}>
        <input type="text" name="description" placeholder="blauwe stylo's" />
        <input type="number" name="quantity" placeholder="120" min="1" />
        <button type="submit">Item(s) toevoegen</button>
      </form>
    </>
  );
}

export default ItemAdd;
