import type { AxiosInstance } from "axios";
import type { FormEvent } from "react";

interface ItemLoanProps {
  api: AxiosInstance;
}

function ItemLoan({ api }: ItemLoanProps) {
  const handleLoan = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    api.post("/api/add_item_loan", {
      description: data.description,
      quantity: data.quantity,
    });
  };

  const handleEndLoan = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    api.post("/api/end_item_loan", {
      description: data.description,
      quantity: data.quantity,
    });
  };
  return (
    <>
      <h1>Item uitlenen</h1>
      <form id="itemLoanForm" onSubmit={handleLoan}>
        <input type="text" name="description" />
        <input type="number" name="quantity" min={1} />
        <button type="submit">Item uitlenen</button>
      </form>
      <h1>lening beëindigen</h1>
      <form id="itemEndLoanForm" onSubmit={handleEndLoan}>
        <input type="text" name="description" />
        <input type="number" name="quantity" min={1} />
        <button type="submit">lening beëindigen</button>
      </form>
    </>
  );
}

export default ItemLoan;
