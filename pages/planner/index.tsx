import {
  Alert,
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Center,
  Container,
  Drawer,
  Flex,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowBigRightLine,
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
import JourneyInfoDrawer from "../../components/TravelInfoPage/JourneyInfoDrawer";
import formatTime from "../../helpers/formatTime";
import { formatDuration } from "../../helpers/PlannerPage";
import { trpc } from "../../helpers/trpc";
import { useStyles } from "../../styles/important";
import { Trip } from "../../types/NS/journey/getTripPlannerResponse";
import Link from "next/link";
import { useRouter } from "next/router";

export default function PlannerPage() {
  const { classes } = useStyles();

  return (
    <>
      <Head>
        <title>Reisinformatie | NS Spoorkaart</title>
      </Head>
      <main className={classes.main}>
        <Navbar />

        <Container className={classes.container}>
          <Title>Reisinformatie</Title>

          <Box style={{ marginBottom: "1rem" }}>
            <Title order={3}>Reisplanner</Title>
            <Planner />
          </Box>

          <Box style={{ marginBottom: "1rem", marginTop: "1rem" }}>
            <Title order={3}>Of ritnummer van NS opzoeken</Title>
            <LookupNumber />
          </Box>

          <Box>
            <Title order={3}>Treinstel opzoeken</Title>
            <LookupTrainNumber />
          </Box>
        </Container>
      </main>
    </>
  );
}

function Planner() {
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
      <Group grow style={{ marginBottom: "1rem" }}>
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
      {data.data && (
        <Flex direction="column" gap="md" style={{ marginTop: "1rem" }}>
          <Title order={3}>Reisadviezen</Title>

          {data.data.trips.map((trip) => (
            <TripPaper key={trip.idx} trip={trip} />
          ))}
        </Flex>
      )}
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
                  component={Link}
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

function LookupNumber() {
  const [opened, setOpened] = useState(false);
  const [number, setNumber] = useState("");

  const query = trpc.journey.journey.useQuery(
    { id: number },
    { enabled: false }
  );

  const click = () => {
    if (query.isFetched) {
      setOpened(true);
    } else {
      query.refetch();
      setOpened(true);
    }
  };

  return (
    <Group align="end">
      <TextInput
        label="Ritnummer"
        placeholder="xxxx"
        description="Ritnummer van de reisplanner van NS"
        type="number"
        value={number}
        onChange={(v) => setNumber(v.target.value)}
        onKeyDown={(v) => v.key == "Enter" && click()}
      />

      <Button
        rightIcon={<IconArrowBigRightLine />}
        onClick={click}
        loading={query.isFetching}
      >
        Laat zien
      </Button>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Treininfo"
        padding="xl"
        size="xl"
      >
        {query.isLoading && (
          <Center>
            <Loader />
          </Center>
        )}

        {query.isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Oh nee!"
            color="red"
          >
            {query.error.message}
          </Alert>
        )}
        {query.data && <JourneyInfoDrawer journey={query.data} />}
      </Drawer>
    </Group>
  );
}

function LookupTrainNumber() {
  const [number, setNumber] = useState("");
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  const click = () => {
    setLoading(true);
    router.push(`/train/${number}/data`);
  };

  return (
    <>
      <Box style={{ marginBottom: "1rem" }}>
        <Group align="end">
          <TextInput
            label="Treinstelnummer"
            placeholder="xxxx"
            // description=""
            type="number"
            value={number}
            onChange={(v) => setNumber(v.target.value)}
            onKeyDown={(v) => v.key == "Enter" && click()}
          />

          <Button
            rightIcon={<IconArrowBigRightLine />}
            onClick={click}
            loading={isLoading}
          >
            Laat zien
          </Button>
        </Group>
        <Text fz="xs" c="dimmed">
          Nummer van het treinstel waar je in zit. Deze staat meestal boven de
          deur.
        </Text>
      </Box>
    </>
  );
}
