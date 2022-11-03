import { DepartureWithJourney } from "../../pages/stations/[code]/departures";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/nl";
import SpoorIcon from "./SpoorIcon";
import Link from "next/link";
dayjs.extend(relativeTime);

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const formatDelay = (delay: number) => {
  const d = delay / 60;
  return Math.round(d);
};

function timeUntil(date: string) {
  const day = dayjs();
  return day.locale("nl").to(date);
}

export default function DepartureCard({
  departure: d,
}: {
  departure: DepartureWithJourney;
}) {
  const delay = d.stop?.departures[0]?.delayInSeconds || 0;
  const product = d.departure.product;

  return (
    <div className="box">
      <div className="is-flex is-justify-content-space-between is-align-content-center">
        <div className="is-flex">
          <div style={{ marginRight: "1rem" }}>
            <p className="is-size-3 is-align-content-center">
              {formatTime(d.departure.plannedDateTime)}
            </p>
            {delay > 30 && (
              <p className="has-text-danger">+{formatDelay(delay || 0)}</p>
            )}
            <p className="has-text-grey">
              {timeUntil(d.departure.actualDateTime)}
            </p>
          </div>
          <div>
            <Link href={`/train/${d.departure.product.number}`}>
              <a className="is-size-4">
                {d.departure.product.longCategoryName} naar{" "}
                <b>{d.departure.direction}</b>
              </a>
            </Link>
            <h1>Van {d.stop?.departures[0]?.origin.name}</h1>
            {d.departure.routeStations.length > 0 && (
              <h3>
                Via{" "}
                <b>
                  {d.departure.routeStations
                    .map((r) => r.mediumName)
                    .join(", ")}
                </b>
              </h3>
            )}
          </div>
        </div>
        <div>
          <SpoorIcon spoorNr={d.departure.plannedTrack} />
          <p>{d.stop?.actualStock?.numberOfSeats || "?"} Zitplaatsen</p>
          <p>
            {product.operatorName} {product.longCategoryName} {product.number}
          </p>
        </div>
      </div>
      <div className="is-flex" style={{ overflow: "scroll", height: "2.5rem" }}>
        {d.stop?.actualStock?.trainParts
          .filter((p) => p.image)
          .map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image?.uri || ""}
              alt={p.stockIdentifier}
              key={p.stockIdentifier + i.toString()}
              //   layout="fill"
            />
          ))}
      </div>
      <div>
        <p>{departureStatus(d.departure.departureStatus)}</p>
      </div>
    </div>
  );
}

function departureStatus(status: string) {
  switch (status) {
    case "ON_STATION":
      return "Aan perron";
    case "INCOMING":
      return "Nog niet op station";
  }
}
