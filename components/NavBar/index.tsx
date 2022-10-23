import Link from "next/link";
import { useRouter } from "next/router";

export default function NavBar() {
  const router = useRouter();

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <p className="is-size-4" style={{ padding: "1rem" }}>
          Treinen
        </p>

        <a
          role="button"
          className="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navBar"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navBar" className="navbar-menu">
        <div className="navbar-start">
          <Link href="/trains">
            <a
              className={
                router.pathname == "/trains"
                  ? "navbar-item is-active"
                  : "navbar-item"
              }
            >
              Home
            </a>
          </Link>

          {/* <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">Opties</a>
            <div className="navbar-dropdown" style={{ zIndex: "10000" }}>
              <label className="checkbox">
                <input
                  type="checkbox"
                  style={{ marginLeft: "10px", marginRight: "10px" }}
                ></input>
                Stations
              </label>
            </div>
          </div> */}
        </div>
      </div>
    </nav>
  );
}
