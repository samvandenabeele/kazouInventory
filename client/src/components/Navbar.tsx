function Navbar() {
  return (
    <nav data-bs-theme="light">
      <div>
        <a href="#">Navbar</a>
        <button
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        ></button>
        <div id="navbarSupportedContent">
          <ul>
            <li>
              <a aria-current="page" href="#Accounts">
                Accounts
              </a>
            </li>
            <li>
              <a
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Items
              </a>
              <ul>
                <li>
                  <a href="#Individueel">Individueel</a>
                </li>
                <li>
                  <a href="#Dozen">Dozen</a>
                </li>
              </ul>
            </li>
          </ul>
          <form role="search">
            <input
              type="search"
              placeholder="Search"
              aria-label="Search"
              data-bs-theme="light"
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
