import { GetServerSideProps, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { ReactNode, useMemo } from "react";
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
import { faCircle, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import useTrains from "../../../hooks/useTrains";
import { TreinWithInfo } from "../../../types/getTrainsWithInfoResponse";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import RushIcon from "../../../components/TrainPage/RushIcon";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import SquareDisplay from "../../../components/SquareDisplay";
import FacilityIcons from "../../../components/TrainPage/FacilityIcons";

const getTrainData = (journey: JourneyDetails) => {
  const stop = journey.stops.find((s) => s.departures[0]);
  return stop;
};

const getCurrentStop = (journey: JourneyDetails, train?: TreinWithInfo) => {
  const stopId = train?.info?.station; /*.replace("_0", "")*/
  const foundStop = journey.stops.find((s) => s.id.replace("_0", "") == stopId);
  if (foundStop) return foundStop;

  return journey.stops.find((s) => s.departures[0]);
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

  const currentStop = useMemo(
    () => getCurrentStop(journey, train),
    [journey, train]
  );

  const stops = journey.stops.filter(({ status }) => status !== "PASSING");
  const firstStop = getTrainData(journey);

  const product = firstStop?.departures[0]?.product;
  const destination =
    firstStop?.departures[0]?.destination?.name ||
    stops[stops.length - 1]?.stop?.name;

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
            <div
              className="is-flex"
              style={{ gap: "1rem", overflow: "auto", width: "100%" }}
            >
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
              style={{
                display: "flex",
                flexDirection: "row",
                overflow: "auto",
              }}
            >
              {journey.stops[0]?.actualStock?.trainParts
                .filter((p) => p.image)
                .map((p) => (
                  <div
                    className="is-flex"
                    style={{ height: "4rem" }}
                    key={p.stockIdentifier}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image?.uri || ""}
                      alt={p.stockIdentifier}
                      style={{
                        height: "auto",
                        width: "auto",
                        maxHeight: "4rem",
                        maxWidth: "fit-content",
                      }}
                    />
                  </div>
                ))}
            </div>
            <div style={{ marginTop: "1rem" }}>
              {journey.notes.map((n) => (
                <p key={n.text}>{n.text}</p>
              ))}
            </div>
            <div className="is-flex">
              {currentStop && (
                <SquareDisplay title="Drukte">
                  <RushIcon
                    stop={currentStop}
                    color={false}
                    style={{ textAlign: "center" }}
                  />
                </SquareDisplay>
              )}
              {currentStop?.plannedStock?.trainParts[0]?.facilities && (
                <FacilityIcons
                  facilities={
                    currentStop?.plannedStock?.trainParts[0]?.facilities
                  }
                />
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="container">
        {!trains.isLoading && !train && <JourneyIsOld />}

        <div className="box">
          <h1 className="is-size-3">Route</h1>
          <div style={{ width: "100%", zIndex: 1 }}>
            <JourneyMap geojson={geojson} stops={stops} train={train} />
          </div>
        </div>

        <div className="box" style={{ overflowX: "auto" }}>
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
          <th style={{ textAlign: "center" }}>Spoor</th>
          <th style={{ textAlign: "center" }}>Drukte</th>
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
            <td>
              {checkIfDateHasPassed(
                s.arrivals[0]?.actualTime ||
                  s.departures[0]?.actualTime ||
                  s.arrivals[0]?.plannedTime ||
                  s.departures[0]?.plannedTime
              ) ? (
                <FontAwesomeIcon type="regular" icon={faCircleCheck} />
              ) : (
                <FontAwesomeIcon type="regular" icon={faCircle} />
              )}
            </td>
            <td>
              {time(s, "arr")} {delayTime(s, "arr")}
            </td>
            <td>
              {time(s, "dest")} {delayTime(s, "dep")}
            </td>
            <td>{s.stop.name}</td>
            <td style={{ textAlign: "center" }}>
              {s.arrivals[0]?.actualTrack || "?"}
            </td>
            <td style={{ textAlign: "center" }}>
              <RushIcon stop={s} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const checkIfDateHasPassed = (date?: string) => {
  if (!date) return true;

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
      <article
        className="message is-warning"
        style={{ width: "80%", margin: "1rem" }}
      >
        <div className="message-header">
          <p>Deze reis is niet (meer) live.</p>
          {/* <button className="delete" aria-label="delete"></button> */}
        </div>
        <div className="message-body">
          Dit kan een van meerdere redenen hebben:
          <ol style={{ marginLeft: "2rem" }} type="A">
            <li>De reis is afgelopen of nog niet begonnen.</li>
            <li>
              De reis is niet live te volgen (bij sommige arriva treinen of
              buitenlandse vervoerders)
            </li>
            <li>De trein staat stil bij een station</li>
          </ol>
        </div>
      </article>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const journeyId = context.params?.journey;

  try {
    const {
      data: { payload: journey },
    } = await NS.get<getJourneyDetailsResponse>(
      "/reisinformatie-api/api/v2/journey",
      {
        params: { train: journeyId },
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
        trainId: journeyId,
        geojson: geojson.data.payload,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      notFound: true,
    };
  }
};
