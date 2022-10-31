/* eslint-disable @next/next/no-img-element */
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { JourneyDetails } from "../types/getJourneyDetailsResponse";
import { TreinWithInfo } from "../types/getTrainsWithInfoResponse";

import Link from "next/link";

function TrainPartsVisualized({ train }: { train: TreinWithInfo }) {
  return (
    <div style={{ height: "4rem", overflowX: "auto" }}>
      <div className="is-flex" style={{ height: "3rem" }}>
        {train.info?.materieeldelen.map((m) =>
          m.bakken
            .filter((p) => p.afbeelding)
            .map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.afbeelding?.url || ""}
                alt={p.afbeelding.url}
                key={p.afbeelding.url}
                height="2rem"
              />
            ))
        )}
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
  const product = journey?.stops[0]?.departures[0]?.product;

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

const calcSeats = (t: TreinWithInfo) => {
  if (!t.info?.materieeldelen[0]) return "?";

  const seats = t.info?.materieeldelen
    ?.map((m) => {
      if (!m.zitplaatsen) return 0;
      const z = m.zitplaatsen;

      return (
        z.zitplaatsEersteKlas +
        z.zitplaatsEersteKlas +
        z.klapstoelEersteKlas +
        z.klapstoelTweedeKlas +
        z.staanplaatsTweedeKlas +
        z.staanplaatsEersteKlas
      );
    })
    .reduce((prev, cur) => prev + cur);

  return seats > 0 ? seats : "?";
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
        <li>Zitplaatsen: {calcSeats(train)}</li>
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
