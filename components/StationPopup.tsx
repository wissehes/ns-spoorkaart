import { SmallStation } from "../types/getStationsResponse";
import styles from "../styles/Map.module.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { StationInfoResponse } from "../types/getStationInfoResponse";

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

      {query.data &&
        query.data.departures.map((a) => (
          <div key={a.product.number} style={{ margin: "0px" }}>
            <p>
              <b>{a.product.shortCategoryName}</b> naar <b>{a.direction}</b> om{" "}
              {a.actualDateTime}
            </p>
          </div>
        ))}
    </>
  );
}
