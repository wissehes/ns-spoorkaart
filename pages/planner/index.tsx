import {
  Anchor,
  Badge,
  Breadcrumbs,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  Group,
  Modal,
  Paper,
  Select,
  Text,
  Timeline,
  Title,
} from "@mantine/core";
import { NextLink } from "@mantine/next";
import {
  IconArrowBounce,
  IconArrowRight,
  IconClock,
  IconExternalLink,
  IconInfoCircle,
  IconSearch,
  IconShare,
} from "@tabler/icons";
import Head from "next/head";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import Navbar from "../../components/NavBar";
import RushIcon from "../../components/TrainPage/RushIcon";
import formatTime from "../../helpers/formatTime";
import { formatDuration } from "../../helpers/PlannerPage";
import { trpc } from "../../helpers/trpc";
import { useStyles } from "../../styles/important";
import { Trip } from "../../types/NS/journey/getTripPlannerResponse";

export default function PlannerPage() {
  const { classes } = useStyles();

  const stations = trpc.station.all.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const [fromCode, setFromCode] = useState<string | null>(null);
  const [toCode, setToCode] = useState<string | null>(null);

  const from = useMemo(
    () => stations.data?.find((a) => a.code == fromCode),
    [stations, fromCode]
  );
  const to = useMemo(
    () => stations.data?.find((a) => a.code == toCode),
    [stations, toCode]
  );

  const data = trpc.journey.plan.useQuery(
    {
      fromStation: from?.code || "",
      toStation: to?.code || "",
    },
    { enabled: false }
  );
  return (
    <>
      <Head>
        <title>Reisplanner | NS Spoorkaart</title>
      </Head>
      <main className={classes.main}>
        <Navbar />

        <Container className={classes.container}>
          <Title>Reisplanner</Title>
          <Group grow>
            <StationSelect value={fromCode} set={setFromCode} type="from" />

            <IconArrowRight size={30} />

            <StationSelect value={toCode} set={setToCode} type="to" />

            <Button
              leftIcon={<IconSearch />}
              disabled={!to || !from}
              loading={data.isFetching}
              onClick={() => data.refetch()}
            >
              Plan
            </Button>
          </Group>

          <Flex direction="column" gap="md" style={{ marginTop: "1rem" }}>
            {data.data?.trips.map((trip) => (
              <TripPaper key={trip.idx} trip={trip} />
            ))}
          </Flex>
        </Container>
      </main>
    </>
  );
}

function TripPaper({ trip }: { trip: Trip }) {
  const [modalOpened, setModelOpened] = useState(false);

  const legs = useMemo(() => trip.legs, [trip]);
  const firstLeg = useMemo(() => legs[0], [legs]);
  const lastLeg = useMemo(() => legs[legs.length - 1], [legs]);

  const firstStopName = useMemo(() => firstLeg.stops[0].name, [firstLeg]);
  const lastStopName = useMemo(
    () => lastLeg.stops[lastLeg.stops.length - 1].name,
    [lastLeg]
  );

  const startTime = useMemo(
    () => legs[0]?.stops[0]?.plannedDepartureDateTime,
    [legs]
  );
  const endTime = useMemo(
    () => lastLeg.stops[lastLeg.stops.length - 1]?.plannedArrivalDateTime,
    [lastLeg]
  );

  const canShare = !!navigator.share;

  const shareFn = useCallback(() => {
    if (navigator.share) {
      navigator
        ?.share({
          text: `Reis van ${firstStopName} naar ${lastStopName}`,
          url: trip.shareUrl.uri,
        })
        .then(console.log)
        .catch(console.error);
    }
  }, [firstStopName, lastStopName, trip]);

  return (
    <>
      <Paper shadow="lg" p="md" radius="md" withBorder>
        <Grid justify="space-between">
          <Grid.Col span={3}>
            <Group>
              <Title order={5}>{formatTime(startTime)} </Title>
              <IconArrowRight size={10} />{" "}
              <Title order={5}>{formatTime(endTime)} </Title>
            </Group>
          </Grid.Col>

          <Grid.Col span={3}>
            <Group>
              <Flex align="center" gap="0.5rem">
                <IconArrowBounce size={10} />

                <Text>{trip.transfers}x</Text>
              </Flex>
              <Flex align="center" gap="0.5rem">
                <IconClock size={5} />

                <Text>{formatDuration(trip.plannedDurationInMinutes)}</Text>
              </Flex>
              <RushIcon
                busyness={trip.crowdForecast}
                style={{ display: "flex", alignItems: "center" }}
              />
            </Group>
          </Grid.Col>

          <Grid.Col span={7} style={{ overflowX: "auto" }}>
            <Breadcrumbs separator="→">
              {trip.legs.map((l) => (
                <Anchor
                  key={l.idx}
                  component={NextLink}
                  href={`/journey/${l.product.number}`}
                  target="_blank"
                >
                  {l.product.displayName}
                </Anchor>
              ))}
            </Breadcrumbs>
          </Grid.Col>
          <Grid.Col span={4} style={{ display: "flex", alignContent: "right" }}>
            <Button.Group>
              <Button
                variant="default"
                onClick={() => setModelOpened(true)}
                leftIcon={<IconInfoCircle />}
              >
                Info
              </Button>
              <Button
                variant="default"
                leftIcon={<IconExternalLink />}
                component="a"
                href={trip.shareUrl.uri}
                target="_blank"
              >
                NS
              </Button>
              <Button
                variant="default"
                onClick={() => shareFn()}
                leftIcon={<IconShare />}
                disabled={!canShare}
              >
                Deel
              </Button>
            </Button.Group>
          </Grid.Col>
        </Grid>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => setModelOpened(false)}
        title={
          <Group>
            <Title order={3}>{firstStopName}</Title>
            <IconArrowRight />
            <Title order={3}>{lastStopName}</Title>
          </Group>
        }
      >
        <Text>Komt later nog</Text>
      </Modal>
    </>
  );
}

function StationSelect({
  value,
  set,
  type,
}: {
  value: string | null;
  set: Dispatch<SetStateAction<string | null>>;
  type: "to" | "from";
}) {
  const items = trpc.station.all.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const mappedItems: { value: string; label: string }[] =
    items.data?.map((s) => ({ value: s.code, label: s.namen.lang })) || [];

  return (
    <Select
      //   label="Van station..."
      placeholder={type == "to" ? "Naar station..." : "Van station..."}
      searchable
      nothingFound="No options"
      clearable
      data={mappedItems}
      value={value}
      onChange={set}
    />
  );
}
