import { GetServerSideProps } from "next";
import getJourney from "../../helpers/getJourney";
import getStations from "../../helpers/getStations";
import { getDepartures } from "../../helpers/stationHelpers";
import { Departure } from "../../types/getDeparturesResponse";
import { JourneyDetails, Stop } from "../../types/getJourneyDetailsResponse";
import { Station } from "../../types/getStationsResponse";
import { TrainInformation } from "../../types/getTrainInfoResponse";
import DepartureCard from "../../components/StationPage/DepartureCard";
import Head from "next/head";

const formatStationType = (type: string) => {
  switch (type) {
    case "MEGA_STATION":
      return "Megastation";
    case "KNOOPPUNT_STOPTREIN_STATION":
      return "Stoptrijn knooppunt";
    case "KNOOPPUNT_INTERCITY_STATION":
      return "Intercity knooppunt";
    default:
      return type;
  }
};

export default function StationPage({
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

      <div className="container">
        <section className="hero">
          <div className="hero-body">
            <p className="title">{station.namen.lang}</p>
            <p className="subtitle">
              Vertrektijden | {formatStationType(station.stationType)}
            </p>
          </div>
        </section>

        {departures.map((d) => (
          <DepartureCard departure={d} key={d.departure.product.number} />
        ))}
      </div>
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
      // const train = await getTrainInformation(d.product.number);
      const journey = await getJourney(d.product.number);

      const foundStop = journey.stops.find(
        (s) => s.stop.uicCode == foundStation.UICCode
      );

      departuresWithTripInfo.push({
        departure: d,
        stop: foundStop,
      });
      // departuresWithTripInfo.push({ departure: d, train });
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
  train?: TrainInformation;
  stop?: Stop;
}

// class DepartureWithTrip {
//   constructor(departure: Departure, trip: JourneyDetails) {
//     this.departure = departure;
//     this.trip = trip;
//   }

//   departure: Departure;
//   trip: JourneyDetails;
// }

// new DepartureWithTrip();
