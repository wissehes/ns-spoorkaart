import { GetServerSideProps } from "next";
import getStations from "../../helpers/getStations";
import { JourneyDetails, Stop } from "../../types/getJourneyDetailsResponse";
import { Departure } from "../../types/getDeparturesResponse";
import { Station } from "../../types/getStationsResponse";
import Head from "next/head";
import { useStyles } from "../../styles/important";
import {
  Box,
  Center,
  Container,
  Flex,
  Loader,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import Navbar from "../../components/NavBar";
import { formatStationType } from "../../helpers/StationPage";
import SpoorIcon from "../../components/StationPage/SpoorIcon";
import { trpc } from "../../helpers/trpc";
import { useRouter } from "next/router";
import DepartureCard from "../../components/StationPage/DepartureCard";
import ArrivalCard from "../../components/StationPage/ArrivalCard";

export default function DeparturesPage({ station }: { station: Station }) {
  const { classes } = useStyles();

  return (
    <>
      <Head>
        <title>{station.namen.lang} vertrektijden | NS Spoorkaart</title>
      </Head>

      <main className={classes.main}>
        <Navbar />
        <Container className={classes.container}>
          <Box className={classes.header}>
            <Title>{station.namen.lang}</Title>

            <Text className={classes.description}>
              {formatStationType(station.stationType)}
              {station.synoniemen.length > 0 &&
                " | Ook bekend als: " + station.synoniemen.join(", ")}
            </Text>

            <Flex style={{ overflow: "auto" }}>
              {station.sporen.map((a) => (
                <SpoorIcon key={a.spoorNummer} spoorNr={a.spoorNummer} />
              ))}
            </Flex>
          </Box>

          <Tabs defaultValue="departures" keepMounted={false}>
            <Tabs.List grow>
              <Tabs.Tab value="departures">Vertrektijden</Tabs.Tab>
              <Tabs.Tab value="arrivals">Aankomsttijden</Tabs.Tab>
              <Tabs.Tab value="disruptions">Storingen</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="departures">
              <Departures />
            </Tabs.Panel>
            <Tabs.Panel value="arrivals">
              <Arrivals />
            </Tabs.Panel>
          </Tabs>
        </Container>
      </main>
    </>
  );
}

function Departures() {
  const router = useRouter();
  const { code } = router.query;
  // can't be bothered to check if 'code' is a string or not
  const departures = trpc.station.departures.useQuery({ code: code as string });

  if (departures.isLoading) {
    return (
      <Center style={{ marginTop: "1rem" }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Flex direction="column" gap="md" style={{ marginTop: "1rem" }}>
      {departures.data?.map((d) => (
        <DepartureCard key={d.departure.product.number} d={d} />
      ))}
    </Flex>
  );
}

function Arrivals() {
  const router = useRouter();
  const { code } = router.query;
  // can't be bothered to check if 'code' is a string or not
  const arrivals = trpc.station.arrivals.useQuery({
    code: code as string,
  });

  if (arrivals.isLoading) {
    return (
      <Center style={{ marginTop: "1rem" }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Flex direction="column" gap="md" style={{ marginTop: "1rem" }}>
      {arrivals.data?.map((a) => (
        <ArrivalCard key={a.arrival.product.number} a={a} />
      ))}
    </Flex>
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

    return {
      props: {
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
