function ItemManager() {
  function addItem() {
    return 0;
  }

  function changeItem() {
    return 0;
  }

  function reviewItems() {
    const barcodeInput = document
      .getElementById("ChangeItemForm")
      ?.querySelector<HTMLInputElement>("#barcode");

    const likes = <axios className="get"></axios>;
    return barcodeInput;
  }

  return (
    <>
      <h1>Item Toevoegen of Aanpassen</h1>
      <form id="AddItemForm" onSubmit={addItem}>
        <input id="barcode" type="text" />
        <input id="description" type="text" />
        <input id="status" type="text" />
        <button type="submit">Aanpassen</button>
      </form>
      <form id="ChangeItemForm" onChange={reviewItems} onSubmit={changeItem}>
        <input id="barcode" type="text" />
        <input id="description" type="text" />
        <input id="status" type="text" />
        <button type="submit">Aanpassen</button>
        <div id="barcode-suggestions"></div>
      </form>
    </>
  );
}

export default ItemManager;
