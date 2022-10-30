/* eslint-disable @next/next/no-img-element */
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { JourneyDetails } from "../types/getJourneyDetailsResponse";
import { TreinWithInfo } from "../types/getTrainsWithInfoResponse";

import styles from "../styles/Map.module.css";
import formatTime from "../helpers/formatTime";
import getDistanceFromGPS from "../helpers/getDistanceFromGPS";
import Link from "next/link";

const formatDelay = (delay: number) => {
  const d = delay / 60;
  return Math.round(d);
};

function TrainPartsVisualized({ train }: { train: TreinWithInfo }) {
  return (
    <div className="is-flex" style={{ overflowX: "scroll", height: "3rem" }}>
      {train.info?.materieeldelen[0].bakken
        .filter((p) => p.afbeelding)
        .map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.afbeelding?.url || ""}
            alt={p.afbeelding.url}
            key={p.afbeelding.url}
            height="2rem"
          />
        ))}
    </div>
  );
}

export default function TrainPopup({ train }: { train: TreinWithInfo }) {
  const { data } = useQuery(
    ["train", train.treinNummer],
    async () => {
      const { data } = await axios.get<JourneyDetails>(
        `/api/trains/${train.treinNummer}`
      );
      return data;
    },
    { refetchOnWindowFocus: false }
  );

  return (
    <div style={{ width: "22rem" }}>
      <h1 className="is-size-5">
        🚂 {train.type} naar {/* {train.} */}
        {data?.stops[data.stops.length - 1].stop.name || ""}
      </h1>

      <TrainPartsVisualized train={train} />

      <ul>
        <li>
          Type{" "}
          <b>
            {data && data.stops[0]?.departures[0]?.product.operatorName}{" "}
            {data && data.stops[0]?.departures[0]?.product.longCategoryName}
          </b>{" "}
          @ <b>{Math.round(train.snelheid)}</b> km/u
        </li>
        <li>{data?.notes.map((a) => a.text).join(", ")}</li>
      </ul>

      <div className={styles.trainstops}>
        <h1 className="is-size-6">Haltes</h1>

        <table className="table">
          <thead>
            <tr>
              <th>Station</th>
              <th>Aankomsttijd</th>
              <th>Afstand</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.stops
                .filter(
                  ({ status }) =>
                    status == "STOP" ||
                    status == "ORIGIN" ||
                    status == "DESTINATION"
                )
                .map((s, i) => (
                  <tr key={s.stop.uicCode}>
                    <th>{s.stop.name}</th>
                    <th>
                      {i == 0 && "Herkomst"}
                      {i > 0 && formatTime(s.arrivals[0]?.plannedTime)}{" "}
                      <span className="has-text-danger">
                        {s.arrivals[0]?.delayInSeconds > 1 &&
                          "+" + formatDelay(s.arrivals[0]?.delayInSeconds)}
                      </span>
                    </th>
                    <th>
                      {getDistanceFromGPS({
                        location1: { lat: train.lat, lon: train.lng },
                        location2: { lat: s.stop.lat, lon: s.stop.lng },
                      })}{" "}
                      km
                    </th>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <Link href={`/train/${train.treinNummer}`}>
        <a>Meer info {"->"}</a>
      </Link>
    </div>
  );
}
