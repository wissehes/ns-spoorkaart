import { TrainPosition } from "@prisma/client";
import { useMemo } from "react";

/**
 * @description A hook that generates the required GeoJSON for displaying the positions of a train
 * @param positions An array of positions from Prisma
 */
export default function usePositionsGeojson(positions: TrainPosition[]) {
  const geojson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: positions.map((d) => [d.lng, d.lat]),
          },
        },
        ...positions.map((d) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [d.lng, d.lat],
          },
        })),
      ],
    }),
    [positions]
  );
  return geojson;
}
