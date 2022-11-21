import { Box, Flex, Grid, Group, Paper, Text, Title } from "@mantine/core";
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
  return (
    <Paper shadow="lg" p="md" radius="md" withBorder>
      <Grid grow>
        <Grid.Col span={2}>
          <Box>
            <Flex gap="0.5rem">
              <Title order={2}>{formatTime(d.departure.plannedDateTime)}</Title>
              {delay > 30 && <Text c="red">+{formatDelay(delay || 0)}</Text>}
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

        <Text>{d.stop?.actualStock?.numberOfSeats || "?"} Zitplaatsen</Text>

        <Text>
          {product.operatorName} {product.longCategoryName} {product.number}
        </Text>
      </Group>
    </Paper>
  );
}
