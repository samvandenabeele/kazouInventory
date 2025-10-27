import type { AxiosInstance } from "axios";
import ItemTable from "../components/ItemTable";

interface PageItemTableProps {
  api: AxiosInstance;
}

function PageItemTable({ api }: PageItemTableProps) {
  return <ItemTable api={api} />;
}

export default PageItemTable;
