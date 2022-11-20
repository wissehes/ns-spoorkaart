import {
  Alert,
  Badge,
  Box,
  Container,
  createStyles,
  Flex,
  Group,
  List,
  SimpleGrid,
  Tabs,
  Text,
  Timeline,
  Title,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useMemo } from "react";
import Navbar from "../../../components/NavBar";
import JourneyMap from "../../../components/TrainPage/JourneyMap";
import RushIcon from "../../../components/TrainPage/RushIcon";
import NS from "../../../helpers/NS";
import { formatDelay, formatTime } from "../../../helpers/StationPage";
import { trpc } from "../../../helpers/trpc";
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
  container: {
    paddingBottom: "2rem",
  },
  main: { minHeight: "100vh" },
  description: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[6],
  },
  box: {
    borderRadius: "10px",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    padding: "1rem",
    marginTop: "1rem",
  },

  boxTitle: {
    marginBottom: "1rem",
  },

  trackIcon: {
    textAlign: "center",
    width: "50px",

    // borderColor: theme.colors.cyan,
  },

  tabsList: {
    maxWidth: 1082,
    marginLeft: "auto",
    marginRight: "auto",
    borderBottom: 0,

    [`@media (max-width: ${1080}px)`]: {
      maxWidth: "100%",
      paddingRight: 0,
    },
  },

  tab: {
    fontSize: 16,
    fontWeight: 500,
    height: 46,
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.lg,
    marginBottom: -1,
    borderColor:
      theme.colorScheme === "dark"
        ? `${theme.colors.dark[8]} !important`
        : undefined,
    backgroundColor: "transparent",

    [`@media (max-width: ${1080}px)`]: {
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.lg,
      fontSize: theme.fontSizes.sm,
      height: 38,
    },

    "&[data-active]": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
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
  const trains = trpc.trains.getTrains.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const { data: journey } = trpc.journey.journey.useQuery(
    { id: trainId },
    { initialData: initialJourney }
  );

  const thisTrain = useMemo(
    () => trains.data?.find((t) => t.ritId == journey?.productNumbers[0]),
    [trains, journey]
  );
  const stops = useMemo(
    () => journey?.stops.filter(({ status }) => status !== "PASSING") || [],
    [journey]
  );
  const firstStop = journey?.stops.find((s) => s.departures[0]);
  const product = firstStop?.departures[0]?.product;

  const destination =
    firstStop?.departures[0]?.destination?.name ||
    stops[stops?.length - 1]?.stop?.name;

  const currentStopIndex = useMemo(() => {
    const curStop = stops.find((s) => {
      return s.id.replace("_0", "") == thisTrain?.info?.station;
    });
    if (!curStop) return null;

    return stops.indexOf(curStop) - 1 || null;
  }, [stops, thisTrain]);

  const titleText = useMemo(
    () => `${product?.longCategoryName || "Trein"} naar ${destination} - NS
          Spoorkaart`,
    [product, destination]
  );

  return (
    <>
      <Head>
        <title>{titleText}</title>
      </Head>
      <main className={classes.main}>
        <Navbar />
        <Container className={classes.container}>
          <Title>
            {product?.longCategoryName || "Trein"} naar {destination}
          </Title>

          <Group
            sx={() => ({
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
            })}
          >
            <Badge variant="filled">
              Rit {product?.number || journey?.productNumbers[0] || "?"}
            </Badge>
            <Badge
              variant="gradient"
              gradient={{ from: "#ed6ea0", to: "#ec8c69", deg: 35 }}
            >
              Type {firstStop?.actualStock?.trainType || "?"}
            </Badge>
            <Badge>
              Zitplaatsen: {firstStop?.actualStock?.numberOfSeats || "?"}
            </Badge>
            {firstStop?.actualStock?.trainParts.map((p) => (
              <Badge
                key={p.stockIdentifier}
                variant="gradient"
                gradient={{ from: "teal", to: "lime", deg: 105 }}
              >
                Treinstel {p.stockIdentifier}
              </Badge>
            ))}
            {firstStop?.actualStock?.trainParts.map((p) =>
              p.facilities.map((f) => (
                <Badge
                  key={f}
                  variant="gradient"
                  gradient={{ from: "teal", to: "blue", deg: 60 }}
                >
                  {f}
                </Badge>
              ))
            )}
          </Group>

          <Flex
            style={{
              flexDirection: "row",
              overflow: "auto",
            }}
          >
            {journey?.stops[0]?.actualStock?.trainParts
              .filter((p) => p.image)
              .map((p) => (
                <Flex
                  style={{ height: "6rem", flexDirection: "column" }}
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
                  <Badge
                    style={{
                      marginBottom: "1rem",
                      marginLeft: "1rem",
                      marginRight: "1rem",
                    }}
                  >
                    Treinstel {p.stockIdentifier}
                  </Badge>
                </Flex>
              ))}
          </Flex>

          {!trains.isLoading && !thisTrain && <JourneyNotOnMap />}

          <Tabs defaultValue="kaart">
            <Tabs.List grow>
              <Tabs.Tab value="kaart">Kaart</Tabs.Tab>
              <Tabs.Tab value="route">Route</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="kaart" pt="xs">
              <JourneyMap geojson={geojson} stops={stops} train={thisTrain} />
            </Tabs.Panel>
            <Tabs.Panel value="route" pt="xs">
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
                      <Box className={classes.trackIcon}>
                        <Text>Spoor</Text>
                        <Text weight="bold">
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
            </Tabs.Panel>
          </Tabs>
        </Container>
      </main>
    </>
  );
}

function JourneyNotOnMap() {
  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      color="yellow"
      title="Deze reis is niet (meer) live."
    >
      <Text>Dit kan een van meerdere redenen hebben:</Text>
      <List type="ordered">
        <List.Item>De reis is afgelopen of nog niet begonnen.</List.Item>
        <List.Item>
          De reis is niet live te volgen (bij sommige arriva treinen of
          buitenlandse vervoerders)
        </List.Item>
        <List.Item>De trein staat stil bij een station</List.Item>
      </List>
    </Alert>
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
