import { Link } from "react-router-dom";

function PageHome() {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <nav>
        <ul>
          <li>
            <Link to="/itemTable">Bekijk inventaris</Link>
          </li>
          <li>
            <Link to="/item_add">Materiaal toevoegen</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default PageHome;
