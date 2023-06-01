import { TrainPosition } from "@prisma/client";
import { useMemo } from "react";

/**
 * @description A hook that generates the required GeoJSON for displaying the positions of a train
 * @param positions An array of positions from Prisma
 */
export default function usePositionsGeojson(positions: TrainPosition[]) {
  /**
   * Splits all positions up into their journey's.
   * This avoids the random straight lines across the map.
   */
  const journeys = useMemo(() => {
    const journeys: Map<string, { lat: number; lng: number }[]> = new Map();

    for (const position of positions) {
      const id = position.journeyId;
      const newLoc = { lat: position.lat, lng: position.lng };
      const exists = journeys.get(id);

      if (exists) {
        journeys.set(id, [...exists, newLoc]);
      } else {
        journeys.set(id, [newLoc]);
      }
    }

    return Array.from(journeys, ([key, value]) => ({
      id: key,
      locations: value,
    }));
  }, [positions]);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: [
        ...journeys.map((loc) => ({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            id: loc.id,
            coordinates: loc.locations.map((d) => [d.lng, d.lat]),
          },
        })),

        ...positions.map((d) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [d.lng, d.lat],
          },
        })),
      ],
    }),
    [positions, journeys]
  );
  return geojson;
}
