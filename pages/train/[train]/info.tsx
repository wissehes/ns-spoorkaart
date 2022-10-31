import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useMemo } from "react";
// import { GeoJSONObject } from "leaflet";
import NavBar from "../../../components/NavBar";
import NS from "../../../helpers/NS";
import { formatTime } from "../../../helpers/StationPage";
import {
  getJourneyDetailsResponse,
  JourneyDetails,
  Stop,
} from "../../../types/getJourneyDetailsResponse";

import {
  getGeoJSONResponse,
  NSGeoJSON,
} from "../../../types/getGeoJSONResponse";
import JourneyMap from "../../../components/TrainPage/JourneyMap";

const getTrainData = (journey: JourneyDetails) => {
  const stop = journey.stops.find((s) => s.departures[0]);
  return stop;
};

export default function TrainInfoPage({
  journey,
  geojson,
}: {
  journey: JourneyDetails;
  geojson: NSGeoJSON;
}) {
  const stops = journey.stops.filter(({ status }) => status !== "PASSING");
  const firstStop = getTrainData(journey);
  const product = firstStop?.departures[0]?.product;
  const destination = firstStop?.departures[0]?.destination.name;

  return (
    <>
      <Head>
        <title>
          {product?.longCategoryName || "Trein"} naar {destination} - NS
          Spoorkaart
        </title>
      </Head>

      <NavBar />

      <section className="hero is-info" style={{ marginBottom: "2rem" }}>
        <div className="hero-body">
          <p className="title">
            {product?.operatorName} {product?.longCategoryName} naar{" "}
            {destination}
          </p>
          <div className="hero-foot">
            <div className="is-flex" style={{ gap: "1rem" }}>
              <p>Drukte: {firstStop?.departures[0]?.crowdForecast}</p>
              <p>|</p>
              <p>Zitplaatsen: {firstStop?.actualStock?.numberOfSeats}</p>
              <p>|</p>
              <p>
                Faciliteiten:{" "}
                {firstStop?.plannedStock?.trainParts
                  .map((p) => p.facilities.join(", "))
                  .join(", ")}
              </p>
            </div>

            <div
              className="is-flex"
              style={{ overflow: "auto", height: "2.5rem" }}
            >
              {journey.stops[0]?.actualStock?.trainParts
                .filter((p) => p.image)
                .map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image?.uri || ""}
                    alt={p.stockIdentifier}
                    key={p.stockIdentifier}
                  />
                ))}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                overflow: "scroll",
              }}
            ></div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="box">
          <h1 className="is-size-3">Route</h1>
          <div style={{ width: "100%", height: "500px", zIndex: 1 }}>
            <JourneyMap
              geojson={geojson}
              stops={stops}
              trainId={journey.productNumbers[0]}
            />
          </div>
        </div>

        {stops.map((a) => (
          <TrainCard a={a} key={a.id} />
        ))}
      </div>

      <div style={{ padding: "2rem" }} />
    </>
  );
}

const time = (stop: Stop, type: "dest" | "arr") => {
  switch (type) {
    case "arr":
      return stop.arrivals[0]
        ? formatTime(stop.arrivals[0]?.actualTime)
        : "--:--";
    case "dest":
      return stop.departures[0]
        ? formatTime(stop.departures[0]?.actualTime)
        : "--:--";
  }
};

function TrainCard({ a }: { a: Stop }) {
  return (
    <div className="box is-flex" style={{ gap: "1rem" }}>
      <div style={{ flexDirection: "column", justifyContent: "space-between" }}>
        <h1 className="is-size-5 has-text-weight-bold">A: {time(a, "arr")}</h1>
        <h1 className="is-size-5 has-text-weight-bold">V: {time(a, "dest")}</h1>
      </div>
      <div
        className="is-flex"
        style={{ flexDirection: "column", justifyContent: "space-evenly" }}
      >
        <p className="is-size-5">{a.stop.name}</p>
        <p>{a.status}</p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const train = context.params?.train;

  const {
    data: { payload: journey },
  } = await NS.get<getJourneyDetailsResponse>(
    "/reisinformatie-api/api/v2/journey",
    {
      params: { train },
    }
  );

  const geojson = await NS.get<getGeoJSONResponse>(
    "/Spoorkaart-API/api/v1/traject.json",
    {
      params: {
        stations: journey.stops.map((s) => s.id.replace("_0", "")).join(","),
      },
    }
  );

  // console.log(JSON.stringify(geojson.data));

  return {
    props: {
      journey,
      geojson: geojson.data.payload,
    },
  };
};
