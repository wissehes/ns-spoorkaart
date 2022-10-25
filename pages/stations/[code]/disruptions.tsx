import { GetServerSideProps } from "next";
import Head from "next/head";
import NavBar from "../../../components/NavBar";
import StationHero from "../../../components/StationPage/StationHero";
import getStationDisruptions from "../../../helpers/getStationDisruptions";
import getStations from "../../../helpers/getStations";
import { StationDisruption } from "../../../types/getStationDisruptionsResponse";
import { Station } from "../../../types/getStationsResponse";

export default function DisruptionsScreen({
  station,
  disruptions,
}: {
  station: Station;
  disruptions: StationDisruption[];
}) {
  return (
    <>
      <Head>
        <title>{station.namen.lang} vertrektijden | NS Spoorkaart</title>
      </Head>

      <NavBar />

      <StationHero station={station} activeTab="disruptions" />

      <div className="container">
        <h1 className="is-size-3" style={{ textAlign: "center" }}>
          Deze pagina is nog niet af.
        </h1>

        {disruptions.length == 0 && (
          <h1 className="is-size-5" style={{ textAlign: "center" }}>
            Geen storingen gevonden.
          </h1>
        )}

        {disruptions.map((d) => (
          <div className="box" key={d.id}>
            <h1 className="is-size-4">
              {d.type} {d.phase?.label && " - " + d.phase?.label}
            </h1>
            <p>{d.title}</p>
            <p>{d.expectedDuration?.description}</p>

            {d.timespans.map((t) => (
              <div key={t.start}>
                <h1 className="is-size-6">
                  {t.cause.label} - {t.additionalTravelTime?.label}{" "}
                </h1>
              </div>
            ))}
          </div>
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

  const stations = await getStations();
  const foundStation = stations.payload.find(
    (s) => s.code == code.toUpperCase() || s.UICCode == code
  );

  if (!foundStation) {
    return {
      notFound: true,
    };
  }

  const disruptions = await getStationDisruptions(code);

  return {
    props: {
      disruptions,
      station: foundStation,
    },
  };
};
