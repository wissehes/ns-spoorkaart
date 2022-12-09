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
import { NextLink } from "@mantine/next";
import { IconInfoCircle } from "@tabler/icons";
import formatTime from "../../helpers/formatTime";
import {
  departureStatus,
  formatDelay,
  timeUntil,
} from "../../helpers/StationPage";
import { DepartureWithJourney } from "../../types/DepartureWithJourney";
import SpoorIcon from "./SpoorIcon";

export default function DepartureCard({ d }: { d: DepartureWithJourney }) {
  const delay = d.stop?.departures[0]?.delayInSeconds || 0;
  const product = d.departure.product;
  const notes = d.journey?.notes.map((d) => d.text);

  return (
    <Paper shadow="lg" p="md" radius="md" withBorder>
      <Grid grow>
        <Grid.Col span={2}>
          <Box>
            <Flex gap="0.25rem" align="center">
              <Title order={2}>{formatTime(d.departure.plannedDateTime)}</Title>
              {delay > 30 && <Text c="red">+{formatDelay(delay || 0)}</Text>}

              <ActionIcon
                component={NextLink}
                href={`/journey/${product.number}`}
              >
                <IconInfoCircle size={20} />
              </ActionIcon>
            </Flex>
            <Text c="gray">{timeUntil(d.departure.actualDateTime)}</Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={8}>
          <Box>
            <Title order={3} weight="normal">
              {d.departure.product.longCategoryName} naar{" "}
              <b>{d.departure.direction}</b>
            </Title>
            <Text fz={"lg"}>Van {d.stop?.departures[0]?.origin.name}</Text>
            {d.departure.routeStations.length > 0 && (
              <Text fz="md">
                Via{" "}
                <b>
                  {d.departure.routeStations
                    .map((r) => r.mediumName)
                    .join(", ")}
                </b>
              </Text>
            )}
          </Box>
        </Grid.Col>

        <Grid.Col span={"auto"}>
          <Box>
            <SpoorIcon spoorNr={d.departure.plannedTrack} />
          </Box>
        </Grid.Col>
      </Grid>

      {(d.stop?.actualStock?.trainParts.filter((p) => p.image)?.length || 0) >
        0 && (
        <Flex style={{ overflow: "scroll", height: "3.5rem" }}>
          {d.stop?.actualStock?.trainParts
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
        <Text weight="bolder">
          {departureStatus(d.departure.departureStatus)}
        </Text>

        <Badge>{d.stop?.actualStock?.numberOfSeats || "?"} Zitplaatsen</Badge>

        <Badge color="cyan">
          {product.operatorName} {product.longCategoryName} {product.number}
        </Badge>

        <Badge color="teal">{d.stop?.actualStock?.trainType}</Badge>
      </Group>
      {notes && (
        <Group>
          {notes?.map((n) => (
            <Text key={n}>{n}</Text>
          ))}
        </Group>
      )}
    </Paper>
  );
}
