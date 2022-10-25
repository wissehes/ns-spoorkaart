import { GetServerSideProps } from "next";
import getJourney from "../../../helpers/getJourney";
import getStations from "../../../helpers/getStations";
import { getDepartures } from "../../../helpers/stationHelpers";
import { Departure } from "../../../types/getDeparturesResponse";
import { JourneyDetails, Stop } from "../../../types/getJourneyDetailsResponse";
import { Station } from "../../../types/getStationsResponse";
import { TrainInformation } from "../../../types/getTrainInfoResponse";
import DepartureCard from "../../../components/StationPage/DepartureCard";
import Head from "next/head";
import NavBar from "../../../components/NavBar";
import SpoorIcon from "../../../components/StationPage/SpoorIcon";
import Link from "next/link";
import { formatStationType } from "../../../helpers/StationPage";
import StationHero from "../../../components/StationPage/StationHero";

export default function DeparturesPage({
  departures,
  station,
}: {
  departures: DepartureWithJourney[];
  // departures:
  station: Station;
}) {
  return (
    <>
      <Head>
        <title>{station.namen.lang} vertrektijden | NS Spoorkaart</title>
      </Head>

      <NavBar />

      <StationHero station={station} activeTab="departures" />

      <div className="container">
        {departures.map((d) => (
          <DepartureCard departure={d} key={d.departure.product.number} />
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

    const departures = await getDepartures(foundStation.code, 10);

    const departuresWithTripInfo: DepartureWithJourney[] = [];

    for (const d of departures) {
      try {
        // const train = await getTrainInformation(d.product.number);
        const journey = await getJourney(d.product.number);

        const foundStop = journey.stops.find(
          (s) => s.stop.uicCode == foundStation.UICCode
        );

        departuresWithTripInfo.push({
          departure: d,
          stop: foundStop,
        });
      } catch (e) {
        console.log(`[TRAINS] Fetching journey ${d.product.number} failed.`);
        // console.error(e);
        departuresWithTripInfo.push({
          departure: d,
        });
      }
    }

    return {
      props: {
        departures: departuresWithTripInfo,
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

export interface DepartureWithJourney {
  departure: Departure;
  journey?: JourneyDetails;
  stop?: Stop;
}
