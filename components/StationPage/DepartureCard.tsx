import { DepartureWithJourney } from "../../pages/stations/[code]";

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
            {delay > 30 && <p>+{formatDelay(delay || 0)}</p>}
          </div>
          <div>
            <h1 className="is-size-4">
              {d.departure.product.longCategoryName} naar{" "}
              {d.departure.direction}
            </h1>
            {d.departure.routeStations.length > 0 && (
              <h3>
                Via{" "}
                {d.departure.routeStations.map((r) => r.mediumName).join(", ")}
              </h3>
            )}
          </div>
        </div>
        <div>
          <p>Spoor {d.departure.plannedTrack}</p>
          <p>{d.stop?.actualStock?.numberOfSeats || "?"} Zitplaatsen</p>
          <p>
            {product.operatorName} {product.longCategoryName} {product.number}
          </p>
        </div>
      </div>
      <div className="is-flex" style={{ overflow: "scroll" }}>
        {d.stop?.actualStock?.trainParts
          .filter((p) => p.image)
          .map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image?.uri || ""}
              alt={p.stockIdentifier}
              key={p.stockIdentifier}
              // height="80%"
              //   layout="fill"
            />
          ))}
      </div>
    </div>
  );
}
