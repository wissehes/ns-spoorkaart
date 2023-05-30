import { useMemo } from "react";
import { trpc } from "../../helpers/trpc";
import { SmallStation } from "../../types/getStationsResponse";
import getDistanceFromGPS from "../../helpers/getDistanceFromGPS";
import { Group, Paper, SimpleGrid, Text, rem } from "@mantine/core";
import Link from "next/link";

interface Location {
  /**
   * Latitude
   */
  lat: number;
  /**
   * Longitude
   */
  lon: number;
}

interface StationWithDistance {
  station: SmallStation;
  distance: number;
}

/**
 * Shows a list of nearby stations for a given coordinate
 */
export default function NearbyStations(location: Location) {
  const stations = trpc.station.all.useQuery();

  /**
   * Sorts all stations by distance and then returns the first three
   */
  const nearby = useMemo(() => {
    if (!stations.data) return null;

    const mapped: StationWithDistance[] = stations.data.map((s) => ({
      station: s,
      distance: getDistanceFromGPS({
        location1: { lat: s.lat, lon: s.lng },
        location2: location,
      }),
    }));

    const sorted = mapped.sort((a, b) => a.distance - b.distance);
    return sorted.slice(0, 3);
  }, [stations.data, location]);

  return (
    <SimpleGrid
      my="md"
      cols={3}
      breakpoints={[
        { maxWidth: "md", cols: 2 },
        { maxWidth: "xs", cols: 1 },
      ]}
    >
      {nearby?.map((s, i) => (
        <StationCard key={s.station.code} s={s} i={i + 1} />
      ))}
    </SimpleGrid>
  );
}

function StationCard({ s, i }: { s: StationWithDistance; i: number }) {
  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      component={Link}
      href={`/stations/${s.station.code}`}
    >
      <Group position="apart">
        <Text
          size="xs"
          color="dimmed"
          style={{ fontWeight: 700, textTransform: "uppercase" }}
        >
          {i}
        </Text>
      </Group>

      <Group align="flex-end" spacing="xs" mt="xs">
        <Text style={{ fontSize: rem(24), fontWeight: 700, lineHeight: 1 }}>
          {s.station.namen.middel}
        </Text>
      </Group>
      <Text fz="xs" c="dimmed" mt={7}>
        {s.distance} km
      </Text>
    </Paper>
  );
}
