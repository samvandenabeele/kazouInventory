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
            <Link to="/itemChange">Leen materiaal</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default PageHome;
