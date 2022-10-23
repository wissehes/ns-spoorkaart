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
import NavBar from "../../components/NavBar";
import SpoorIcon from "../../components/StationPage/SpoorIcon";
import Link from "next/link";

const formatStationType = (type: string) => {
  switch (type) {
    case "MEGA_STATION":
      return "Megastation";
    case "KNOOPPUNT_STOPTREIN_STATION":
      return "Stoptrijn knooppunt";
    case "KNOOPPUNT_INTERCITY_STATION":
      return "Intercity knooppunt";
    case "STOPTREIN_STATION":
      return "Stoptrein station";
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

      <NavBar />

      <section className="hero is-info" style={{ marginBottom: "2rem" }}>
        <div className="hero-body">
          <p className="title">{station.namen.lang}</p>
          <p className="subtitle">
            {formatStationType(station.stationType)}
            {station.synoniemen.length > 0 &&
              "| Ook bekend als: " + station.synoniemen.join(", ")}
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              overflow: "scroll",
            }}
          >
            {station.sporen.map((a) => (
              <SpoorIcon key={a.spoorNummer} spoorNr={a.spoorNummer} />
            ))}
          </div>
        </div>

        <div className="hero-foot">
          <nav className="tabs is-boxed is-fullwidth">
            <div className="container">
              <ul>
                <li className="is-active">
                  <Link href={`/stations/${station.code}`}>
                    <a>Vertrektijden</a>
                  </Link>
                </li>
                <li>
                  <a>Aankomsttijden</a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </section>
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
      // const train = await getTrainInformation(d.product.number);
      const journey = await getJourney(d.product.number);

      const foundStop = journey.stops.find(
        (s) => s.stop.uicCode == foundStation.UICCode
      );
      const origin = journey.stops[0];

      departuresWithTripInfo.push({
        departure: d,
        stop: foundStop,
        origin,
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
  origin?: Stop;
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
