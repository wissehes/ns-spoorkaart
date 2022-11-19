import {
  Box,
  Container,
  createStyles,
  Flex,
  SimpleGrid,
  Text,
  Timeline,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useMemo } from "react";
import Navbar from "../../../components/NavBar";
import JourneyMap from "../../../components/TrainPage/JourneyMap";
import RushIcon from "../../../components/TrainPage/RushIcon";
import NS from "../../../helpers/NS";
import { formatDelay, formatTime } from "../../../helpers/StationPage";
import useTrains from "../../../hooks/useTrains";
import {
  getGeoJSONResponse,
  NSGeoJSON,
} from "../../../types/getGeoJSONResponse";
import {
  getJourneyDetailsResponse,
  JourneyDetails,
  Stop,
} from "../../../types/getJourneyDetailsResponse";

const useStyles = createStyles((theme) => ({
  box: {
    borderRadius: "10px",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    padding: "0.5rem",
    marginTop: "1rem",
  },

  boxTitle: {
    marginBottom: "0.5rem",
  },
}));

export default function JourneyPage({
  initialJourney,
  geojson,
  trainId,
}: {
  initialJourney: JourneyDetails;
  geojson: NSGeoJSON;
  trainId: string;
}) {
  const { classes } = useStyles();
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

  const thisTrain = useMemo(
    () => trains.data?.find((t) => t.ritId == journey.productNumbers[0]),
    [trains, journey]
  );
  const stops = journey.stops.filter(({ status }) => status !== "PASSING");
  const firstStop = journey.stops.find((s) => s.departures[0]);
  const product = firstStop?.departures[0]?.product;

  const destination =
    firstStop?.departures[0]?.destination?.name ||
    stops[stops.length - 1]?.stop?.name;

  const currentStopIndex = useMemo(() => {
    const curStop = stops.find((s) => {
      return s.id.replace("_0", "") == thisTrain?.info?.station;
    });
    if (!curStop) return null;

    return stops.indexOf(curStop) - 1 || null;
  }, [stops, thisTrain]);

  return (
    <>
      <Head>
        <title>
          {product?.longCategoryName || "Trein"} naar {destination} - NS
          Spoorkaart
        </title>
      </Head>

      <Navbar />
      <Container>
        <Title>
          {product?.longCategoryName || "Trein"} naar {destination}
        </Title>

        <Box className={classes.box}>
          <Title order={2} className={classes.boxTitle}>
            Route
          </Title>
          <JourneyMap geojson={geojson} stops={stops} train={thisTrain} />
        </Box>

        <Box className={classes.box}>
          <Title order={2} className={classes.boxTitle}>
            Reis
          </Title>

          <Timeline active={currentStopIndex || 0}>
            {stops.map((s, i) => (
              <Timeline.Item
                key={s.stop.uicCode}
                title={s.stop.name}
                lineVariant={currentStopIndex == i ? "dotted" : "solid"}
              >
                <SimpleGrid cols={3}>
                  <Box>
                    <Text color="dimmed">
                      A: {time(s, "arr")} {delayTime(s, "arr")}
                    </Text>
                    <Text color="dimmed">
                      V: {time(s, "dest")} {delayTime(s, "dep")}
                    </Text>
                  </Box>
                  <Box style={{ textAlign: "center", width: "50px" }}>
                    <Text>Spoor</Text>
                    <Text>
                      {s.arrivals[0]?.actualTrack ||
                        s.departures[0]?.actualTrack ||
                        "?"}
                    </Text>
                  </Box>
                  <RushIcon stop={s} size={1.5} />
                </SimpleGrid>
              </Timeline.Item>
            ))}
          </Timeline>
        </Box>
      </Container>
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
    return (
      <Text c="red" size={"md"} span>
        +{formatDelay(delay)}
      </Text>
    );
  } else {
    return <></>;
  }
};

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
