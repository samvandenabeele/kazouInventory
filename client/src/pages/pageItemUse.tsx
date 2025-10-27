import type { AxiosInstance } from "axios";
import ItemAdd from "../components/ItemAdd";
import ItemLoan from "../components/ItemLoan";

interface PageItemAddProps {
  api: AxiosInstance;
}

function PageItemAdd({ api }: PageItemAddProps) {
  return (
    <>
      <ItemAdd api={api} />
      <ItemLoan api={api} />
    </>
  );
}

export default PageItemAdd;
