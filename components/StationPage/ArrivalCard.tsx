import SpoorIcon from "./SpoorIcon";

import { ArrivalWithJourney } from "../../pages/stations/[code]/arrivals";
import {
  departureStatus,
  formatDelay,
  timeUntil,
  formatTime,
} from "../../helpers/StationPage";

export default function ArrivalCard({
  arrival: a,
}: {
  arrival: ArrivalWithJourney;
}) {
  const delay = a.stop?.arrivals[0]?.delayInSeconds || 0;
  const product = a.arrival.product;
  const destination = a.stop?.destination;

  return (
    <div className="box">
      <div className="is-flex is-justify-content-space-between is-align-content-center">
        <div className="is-flex">
          <div style={{ marginRight: "1rem" }}>
            <p className="is-size-3 is-align-content-center">
              {formatTime(a.arrival.plannedDateTime)}
            </p>
            {delay > 30 && (
              <p className="has-text-danger">+{formatDelay(delay || 0)}</p>
            )}
            <p className="has-text-grey">
              {timeUntil(a.arrival.actualDateTime)}
            </p>
          </div>
          <div>
            <h1 className="is-size-4">
              {a.arrival.product.longCategoryName} van <b>{a.arrival.origin}</b>{" "}
              naar <b>{destination}</b>
            </h1>

            {/* {a.arrival.routeStations.length > 0 && (
              <h3>
                Via{" "}
                <b>
                  {d.departure.routeStations
                    .map((r) => r.mediumName)
                    .join(", ")}
                </b>
              </h3>
            )} */}
          </div>
        </div>
        <div>
          {/* <p>Spoor {d.departure.plannedTrack}</p> */}
          <SpoorIcon spoorNr={a.arrival.plannedTrack} />
          <p>{a.stop?.actualStock?.numberOfSeats || "?"} Zitplaatsen</p>
          <p>
            {product.operatorName} {product.longCategoryName} {product.number}
          </p>
        </div>
      </div>
      <div className="is-flex" style={{ overflow: "scroll", height: "2.5rem" }}>
        {a.stop?.actualStock?.trainParts
          .filter((p) => p.image)
          .map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image?.uri || ""}
              alt={p.stockIdentifier}
              key={p.stockIdentifier}
              //   layout="fill"
            />
          ))}
      </div>
      <div>
        <p>{departureStatus(a.arrival.arrivalStatus)}</p>
      </div>
    </div>
  );
}
