import type { MouseEvent } from "react";

function ItemForm() {
  const handleSubmit = (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const inputs = form.querySelectorAll("input");
    const data = Array.from(inputs).map((input) => input.value);
    console.log("Form data:", data);
  };

  return (
    <>
      <form
        style={{ maxWidth: 620 }}
        role="add-item-form"
        onSubmit={handleSubmit}
      >
        <input
          placeholder="Balpen"
          data-bs-theme="light"
          style={{ width: 160 }}
        />
        <input
          placeholder="Zwarte balpen"
          data-bs-theme="light"
          style={{ width: 160 }}
        />
        <input
          placeholder="A0001A"
          data-bs-theme="light"
          style={{ width: 160 }}
          disabled
        />
        <button type="submit">Toevoegen</button>
      </form>
    </>
  );
}

export default ItemForm;
