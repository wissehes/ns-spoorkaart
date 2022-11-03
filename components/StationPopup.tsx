import { SmallStation } from "../types/getStationsResponse";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { StationInfoResponse } from "../types/getStationInfoResponse";

import styles from "../styles/Map.module.css";
import formatTime from "../helpers/formatTime";
import Link from "next/link";

export default function StationPopup({ station }: { station: SmallStation }) {
  const query = useQuery(
    ["station", station.code],
    async () => {
      const { data } = await axios.get<StationInfoResponse>(
        `/api/station/${station.code}`
      );
      return data;
    },
    { refetchOnWindowFocus: false }
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1 className="is-size-5">
        <b>🚉 Station {station.namen.lang}</b>
      </h1>
      <p>
        Sporen: <b>{station.sporen.map((s) => s.spoorNummer).join(", ")}</b>
      </p>

      <div>
        <table
          className={query.isLoading ? "table is-loading" : "table"}
          style={{ width: "100%" }}
        >
          <thead>
            <tr style={{ textAlign: "center", fontWeight: "bolder" }}>
              <th>Tijd</th>
              <th>Type</th>
              <th>Spoor</th>
              <th>Bestemming</th>
            </tr>
          </thead>

          <tbody>
            {query.data &&
              query.data.departures.map((a) => (
                <tr
                  key={a.product.number}
                  className={styles.stationtable_content}
                >
                  <th>{formatTime(a.actualDateTime)}</th>
                  <th>{a.product.longCategoryName}</th>
                  <th>{a.plannedTrack}</th>
                  <th>{a.direction}</th>
                </tr>
              ))}
          </tbody>
        </table>
        {query.isLoading && (
          <progress
            style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
            className="progress is-info"
            max="100"
          >
            60%
          </progress>
        )}
      </div>
      <Link href={`/stations/${station.code}`}>
        <a className="button is-small is-primary">Meer info</a>
      </Link>
    </div>
  );
}
