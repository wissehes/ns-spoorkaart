/* eslint-disable @next/next/no-img-element */
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { JourneyDetails } from "../types/getJourneyDetailsResponse";
import { TreinWithInfo } from "../types/getTrainsWithInfoResponse";

import styles from "../styles/Map.module.css";
import formatTime from "../helpers/formatTime";
import getDistanceFromGPS from "../helpers/getDistanceFromGPS";
import Link from "next/link";
import { Zitplaatsen } from "../types/getTrainInfoResponse";

const formatDelay = (delay: number) => {
  const d = delay / 60;
  return Math.round(d);
};

function TrainPartsVisualized({ train }: { train: TreinWithInfo }) {
  return (
    <div style={{ height: "4rem", overflowX: "auto" }}>
      <div className="is-flex" style={{ height: "3rem" }}>
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
    </div>
  );
}

const TrainPopupHeader = ({
  train,
  journey,
}: {
  train: TreinWithInfo;
  journey?: JourneyDetails;
}) => {
  const product = journey?.stops[0].departures[0].product;

  // const;
  const destination =
    journey?.stops[0].destination ||
    journey?.stops[journey.stops.length - 1].stop.name ||
    "?";

  return (
    <h1 className="is-size-5">
      🚂 {product?.operatorName} {product?.longCategoryName || train.type} naar{" "}
      {destination}
    </h1>
  );
};

const calcSeats = (z?: Zitplaatsen) => {
  if (!z) return "?";
  const totaal =
    z.zitplaatsEersteKlas +
    z.zitplaatsEersteKlas +
    z.klapstoelEersteKlas +
    z.klapstoelTweedeKlas +
    z.staanplaatsTweedeKlas +
    z.staanplaatsEersteKlas;
  return totaal;
};

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

  // const zitplaatsen = useMemo

  return (
    <div
      style={{
        width: "22rem",
      }}
    >
      <TrainPopupHeader train={train} journey={data} />

      <TrainPartsVisualized train={train} />

      <ul>
        <li>
          Type <b>{train.info?.type}</b> @ <b>{Math.round(train.snelheid)}</b>{" "}
          km/u
        </li>
        <li>
          Zitplaatsen: {calcSeats(train.info?.materieeldelen[0].zitplaatsen)}
        </li>
        <li>
          Richting:{" "}
          <div
            style={{
              display: "inline-block",
              transform: `rotate(${train.richting}deg)`,
              width: "15px",
              fontSize: "15px",
            }}
          >
            ⬆️
          </div>
        </li>
        <li>{data?.notes.map((a) => a.text).join(", ")}</li>
      </ul>

      <Link href={`/train/${train.treinNummer}`}>
        <a>Meer info {"->"}</a>
      </Link>
    </div>
  );
}
