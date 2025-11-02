import ItemAdd from "../components/ItemAdd";
import ItemLoan from "../components/ItemLoan";
import type { AxiosInstance } from "axios";

interface PageItemAddProps {
  api: AxiosInstance;
}

export default function PageItemUse({ api }: PageItemAddProps) {
  return (
    <>
      <ItemAdd api={api} />
      <ItemLoan api={api} />
    </>
  );
}
