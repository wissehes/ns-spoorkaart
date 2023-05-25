import {
  ActionIcon,
  Badge,
  Box,
  Flex,
  Grid,
  Group,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import formatTime from "../../helpers/formatTime";
import {
  departureStatus,
  formatDelay,
  timeUntil,
} from "../../helpers/StationPage";
import { ArrivalWithJourney } from "../../types/ArrivalWithJourney";
import SpoorIcon from "./SpoorIcon";
import Link from "next/link";

export default function ArrivalCard({ a }: { a: ArrivalWithJourney }) {
  const delay = a.stop?.arrivals[0]?.delayInSeconds || 0;
  const product = a.arrival.product;
  const destination = a.stop?.destination;
  const notes = a.journey?.notes.map((a) => a.text);

  return (
    <Paper shadow="lg" p="md" radius="md" withBorder>
      <Grid grow>
        <Grid.Col span={2}>
          <Box>
            <Flex gap="0.25rem" align="center">
              <Title order={2}>{formatTime(a.arrival.plannedDateTime)}</Title>
              {delay > 30 && <Text c="red">+{formatDelay(delay || 0)}</Text>}

              <ActionIcon component={Link} href={`/journey/${product.number}`}>
                <IconInfoCircle size={20} />
              </ActionIcon>
            </Flex>
            <Text c="gray">{timeUntil(a.arrival.actualDateTime)}</Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={8}>
          <Box>
            <Title order={3} weight="normal">
              {product.longCategoryName} naar <b>{destination}</b>
            </Title>
            <Text fz={"lg"}>
              Van {a.stop?.departures[0]?.origin.name || "?"}
            </Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={"auto"}>
          <Box>
            <SpoorIcon spoorNr={a.arrival.plannedTrack} />
          </Box>
        </Grid.Col>
      </Grid>
      {(a.stop?.actualStock?.trainParts.filter((p) => p.image)?.length || 0) >
        0 && (
        <Flex style={{ overflow: "scroll", height: "3.5rem" }}>
          {a.stop?.actualStock?.trainParts
            .filter((p) => p.image)
            .map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image?.uri || ""}
                alt={p.stockIdentifier}
                key={p.stockIdentifier + i.toString()}
                style={{
                  height: "auto",
                  width: "auto",
                  maxHeight: "3rem",
                  maxWidth: "fit-content",
                }}
              />
            ))}
        </Flex>
      )}
      <Group>
        <Text weight="bolder">{departureStatus(a.arrival.arrivalStatus)}</Text>

        <Badge>{a.stop?.actualStock?.numberOfSeats || "?"} Zitplaatsen</Badge>

        <Badge color="cyan">
          {product.operatorName} {product.longCategoryName} {product.number}
        </Badge>

        <Badge color="teal">{a.stop?.actualStock?.trainType}</Badge>
      </Group>
      {notes && (
        <Group>
          {notes.map((n) => (
            <Text key={n}>{n}</Text>
          ))}
        </Group>
      )}
    </Paper>
  );
}
