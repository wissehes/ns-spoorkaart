import { GetServerSideProps } from "next";
import getJourney from "../../../helpers/getJourney";
import getStations from "../../../helpers/getStations";
import { getArrivals } from "../../../helpers/stationHelpers";
import { JourneyDetails, Stop } from "../../../types/getJourneyDetailsResponse";
import { Station } from "../../../types/getStationsResponse";
import Head from "next/head";
import NavBar from "../../../components/NavBar";
import SpoorIcon from "../../../components/StationPage/SpoorIcon";
import Link from "next/link";
import { Arrival } from "../../../types/getArrivalsResponse";
import ArrivalCard from "../../../components/StationPage/ArrivalCard";
import { formatStationType } from "../../../helpers/StationPage";
import StationHero from "../../../components/StationPage/StationHero";

export default function ArrivalsPage({
  arrivals,
  station,
}: {
  arrivals: ArrivalWithJourney[];
  station: Station;
}) {
  return (
    <>
      <Head>
        <title>{station.namen.lang} aankomsttijden | NS Spoorkaart</title>
      </Head>

      <NavBar />

      <StationHero station={station} activeTab="arrivals" />

      <div className="container">
        {arrivals.map((a) => (
          <ArrivalCard arrival={a} key={a.arrival.product.number} />
        ))}
      </div>
      <div style={{ padding: "2rem" }} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = context.params?.code;

  if (!code || code instanceof Array) {
    return {
      notFound: true,
    };
  }

  try {
    const stations = await getStations();
    const foundStation = stations.payload.find(
      (s) => s.code == code.toUpperCase() || s.UICCode == code
    );

    if (!foundStation) {
      return {
        notFound: true,
      };
    }

    const arrivals = await getArrivals(foundStation.code, 10);

    const arrivalsWithJourney: ArrivalWithJourney[] = [];

    for (const a of arrivals) {
      const journey = await getJourney(a.product.number);

      const foundStop = journey.stops.find(
        (s) => s.stop.uicCode == foundStation.UICCode
      );

      arrivalsWithJourney.push({
        arrival: a,
        stop: foundStop,
      });
    }

    return {
      props: {
        arrivals: arrivalsWithJourney,
        station: foundStation,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      notFound: true,
    };
  }
};

export interface ArrivalWithJourney {
  arrival: Arrival;
  journey?: JourneyDetails;
  stop?: Stop;
}
