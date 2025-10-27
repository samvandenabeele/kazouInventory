import { Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <Link to="/">
        <button>Home</button>
      </Link>
      <Link to="/itemTable">
        <button>Bekijk inventaris</button>
      </Link>
      <Link to="/itemChange">
        <button>Leen materiaal</button>
      </Link>
    </>
  );
}

export default Navbar;
