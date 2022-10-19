import { SmallStation } from "../types/getStationsResponse";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { StationInfoResponse } from "../types/getStationInfoResponse";

import styles from "../styles/Map.module.css";
import formatTime from "../helpers/formatTime";

export default function StationPopup({ station }: { station: SmallStation }) {
  const query = useQuery(["station", station.code], async () => {
    const { data } = await axios.get<StationInfoResponse>(
      `/api/station/${station.code}`
    );
    return data;
  });

  return (
    <>
      <h1 className={styles.stationheader}>Station {station.namen.lang}</h1>
      <p>
        Sporen: <b>{station.sporen.map((s) => s.spoorNummer).join(", ")}</b>
      </p>

      <div>
        <table>
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
                  <th>{a.product.shortCategoryName}</th>
                  <th>{a.plannedTrack}</th>
                  <th>{a.direction}</th>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
