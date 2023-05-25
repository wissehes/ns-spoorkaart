import Link from "next/link";
import SpoorIcon from "./SpoorIcon";

import { formatStationType } from "../../helpers/StationPage";

import { Station } from "../../types/getStationsResponse";

type TabType = "departures" | "arrivals" | "disruptions";

export default function StationHero({
  station,
  activeTab,
}: {
  station: Station;
  activeTab: TabType;
}) {
  return (
    <section className="hero is-info" style={{ marginBottom: "2rem" }}>
      <div className="hero-body">
        <p className="title">{station.namen.lang}</p>
        <p className="subtitle">
          {formatStationType(station.stationType)}
          {station.synoniemen.length > 0 &&
            " | Ook bekend als: " + station.synoniemen.join(", ")}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            overflow: "scroll",
          }}
        >
          {station.sporen.map((a) => (
            <SpoorIcon key={a.spoorNummer} spoorNr={a.spoorNummer} />
          ))}
        </div>
      </div>

      <div className="hero-foot">
        <nav className="tabs is-boxed is-fullwidth">
          <div className="container">
            <ul>
              <li className={activeTab == "departures" ? "is-active" : ""}>
                <Link href={`/stations/${station.code}/departures`}>
                  Vertrektijden
                </Link>
              </li>
              <li className={activeTab == "arrivals" ? "is-active" : ""}>
                <Link href={`/stations/${station.code}/arrivals`}>
                  Aankomsttijden
                </Link>
              </li>
              <li className={activeTab == "disruptions" ? "is-active" : ""}>
                <Link href={`/stations/${station.code}/disruptions`}>
                  Storingen
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </section>
  );
}
