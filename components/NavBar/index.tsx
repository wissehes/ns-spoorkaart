import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import useStations from "../../hooks/useStations";

export default function NavBar() {
  const router = useRouter();
  const stations = useStations();

  const [expanded, setExpanded] = useState(false);

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <p
          className="is-size-4 has-text-primary"
          style={{ margin: "10px 10px " }}
        >
          Treinen
        </p>

        <a
          role="button"
          className={expanded ? "navbar-burger is-active" : "navbar-burger"}
          aria-label="menu"
          aria-expanded="false"
          data-target="navBar"
          onClick={() => setExpanded((a) => !a)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div
        id="navBar"
        className={expanded ? "navbar-menu is-active" : "navbar-menu"}
      >
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

          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">Stations</a>

            <div className="navbar-dropdown" style={{ zIndex: 100000000 }}>
              <Link href="/stations/">
                <a className="navbar-item">Alle stations</a>
              </Link>
              <hr className="dropdown-divider" />

              {stations.data
                ?.filter(
                  ({ stationType: t, sporen }) =>
                    t == "MEGA_STATION" || sporen.length > 7
                )
                .filter(({ land }) => land == "NL")
                .map((s) => (
                  <Link key={s.code} href={`/stations/${s.code}`}>
                    <a className="navbar-item">{s.namen.lang}</a>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
