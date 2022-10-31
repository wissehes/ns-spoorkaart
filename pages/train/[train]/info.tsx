import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useMemo } from "react";
// import { GeoJSONObject } from "leaflet";
import NavBar from "../../../components/NavBar";
import NS from "../../../helpers/NS";
import { formatDelay, formatTime } from "../../../helpers/StationPage";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faCircle,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import useTrains from "../../../hooks/useTrains";
import { TreinWithInfo } from "../../../types/getTrainsWithInfoResponse";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import RushIcon from "../../../components/TrainPage/RushIcon";

const getTrainData = (journey: JourneyDetails) => {
  const stop = journey.stops.find((s) => s.departures[0]);
  return stop;
};

export default function TrainInfoPage({
  initialJourney,
  geojson,
  trainId,
}: {
  initialJourney: JourneyDetails;
  geojson: NSGeoJSON;
  trainId: string;
}) {
  const trains = useTrains();
  const { data: journey } = useQuery(
    ["journey", trainId],
    async () => {
      const { data } = await axios.get<JourneyDetails>(
        `/api/trains/${trainId}`
      );
      return data;
    },
    { initialData: initialJourney /*refetchInterval: 5000*/ }
  );

  const train = useMemo(
    () => trains.data?.find((t) => t.ritId == journey.productNumbers[0]),
    [trains, journey]
  );

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
              <p>Rit {product?.number || journey.productNumbers[0] || "?"}</p>
              <p>|</p>
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
        {!trains.isLoading && !train && <JourneyIsOld />}

        <div className="box">
          <h1 className="is-size-3">Route</h1>
          <div style={{ width: "100%", height: "300px", zIndex: 1 }}>
            <JourneyMap geojson={geojson} stops={stops} train={train} />
          </div>
        </div>

        <div className="box">
          <h1 className="is-size-3">Reis</h1>

          <StopTable stops={stops} train={train} />
        </div>
      </div>

      <div style={{ padding: "2rem" }} />
    </>
  );
}

const time = (stop: Stop, type: "dest" | "arr") => {
  switch (type) {
    case "arr":
      return stop.arrivals[0]
        ? formatTime(stop.arrivals[0]?.plannedTime)
        : "--:--";
    case "dest":
      return stop.departures[0]
        ? formatTime(stop.departures[0]?.plannedTime)
        : "--:--";
  }
};

const delayTime = (stop: Stop, type: "dep" | "arr") => {
  const delay =
    type == "dep"
      ? stop.departures[0]?.delayInSeconds || 0
      : stop.arrivals[0]?.delayInSeconds || 0;

  if (delay > 30) {
    return <span className="has-text-danger">+{formatDelay(delay)}</span>;
  } else {
    return <></>;
  }
};

function StopTable({ stops, train }: { stops: Stop[]; train?: TreinWithInfo }) {
  return (
    <table className="table" style={{ width: "100%" }}>
      <thead>
        <tr>
          <th></th>
          <th>Aankomst</th>
          <th>Vertrek</th>
          <th>Station</th>
          <th>Spoor</th>
          <th>Drukte</th>
        </tr>
      </thead>

      <tbody>
        {stops.map((s) => (
          <tr
            key={s.id}
            className={
              s.id.replace("_0", "") == train?.info?.station
                ? "is-selected"
                : ""
            }
          >
            <th>
              {checkIfDateHasPassed(
                s.arrivals[0]?.actualTime || s.departures[0].actualTime
              ) ? (
                <FontAwesomeIcon type="regular" icon={faCircleCheck} />
              ) : (
                <FontAwesomeIcon type="regular" icon={faCircle} />
              )}
            </th>
            <th>
              {time(s, "arr")} {delayTime(s, "arr")}
            </th>
            <th>
              {time(s, "dest")} {delayTime(s, "dep")}
            </th>
            <th>{s.stop.name}</th>
            <th>{s.arrivals[0]?.actualTrack || "?"}</th>
            <th>
              <RushIcon stop={s} />
            </th>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const checkIfDateHasPassed = (date: string) => {
  const parsed = new Date(date);
  const now = new Date();

  return parsed.getTime() < now.getTime();
};

function JourneyIsOld() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        className="notification is-warning"
        style={{ width: "80%", margin: "1rem" }}
      >
        <span className="icon-text">
          <span className="icon ">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </span>
          Deze reis is niet meer live.
        </span>
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

  return {
    props: {
      initialJourney: journey,
      trainId: train,
      geojson: geojson.data.payload,
    },
  };
};
