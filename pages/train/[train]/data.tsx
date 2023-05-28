import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import maplibreGl from "maplibre-gl";
import Map, {
  FullscreenControl,
  GeolocateControl,
  Layer,
  MapProvider,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
  useMap,
} from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import bbox from "@turf/bbox";
import { useEffect, useMemo, createRef } from "react";
import { MapRef } from "react-map-gl/dist/esm/mapbox/create-ref";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { TrainPosition } from "@prisma/client";
import StandardLayout from "../../../layouts/StandardLayout";
import { Header } from "../../../components/Layout/Header";
import TrainDisplay from "../../../components/Train/TrainDisplay";
import { Badge, Group } from "@mantine/core";
import { timeUntil } from "../../../helpers/StationPage";

// Create a getData function
const getData = async (id: number) => {
  const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return await prisma.train.findFirst({
    where: { materialId: id },
    include: { info: true, positions: { where: { date: { gte: date } } } },
  });
};

type SSRData = NonNullable<Awaited<ReturnType<typeof getData>>>;

const validate = z.preprocess(
  (a) => parseInt(z.string().parse(a), 10),
  z.number().positive()
);

export const getServerSideProps: GetServerSideProps<{ data: SSRData }> = async (
  context
) => {
  const train = context.params?.train;
  const matNum = validate.safeParse(train);

  if (matNum.success) {
    const data = await getData(matNum.data);

    if (data) {
      return {
        props: { data: JSON.parse(JSON.stringify(data)) as SSRData },
      };
    } else return { notFound: true };
  } else {
    return { notFound: true };
  }
};

export default function TrainDataPage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const parts = data.info?.afbeelding
    ? [{ image: data.info.afbeelding, identifier: data.materialId.toString() }]
    : undefined;

  const sortedPos = useMemo(
    () =>
      data.positions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [data.positions]
  );

  return (
    <StandardLayout title="Trein info">
      <Header title={`${data.info?.type} - ${data.materialId}`} />

      <Group>
        {data.info?.facilities.map((f) => (
          <Badge
            key={f}
            variant="gradient"
            gradient={{ from: "teal", to: "blue", deg: 60 }}
          >
            {f}
          </Badge>
        ))}
      </Group>

      <TrainDisplay parts={parts} />

      <div className="box">
        {data && <TrainHistoryMap positions={sortedPos} />}
      </div>

      {sortedPos.map((d) => (
        <div className="box" key={new Date(d.date).toISOString()}>
          <p>{timeUntil(new Date(d.date).toISOString())}</p>
          <p>{d.speed} km/u</p>
          <p>{d.station}</p>
        </div>
      ))}
    </StandardLayout>
  );
}

function TrainHistoryMap({ positions }: { positions: TrainPosition[] }) {
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

  const parsed = useMemo(() => bbox(geojson), [geojson]);
  const map = createRef<MapRef>();

  useEffect(() => {
    map.current?.fitBounds(
      [
        [parsed[0], parsed[1]],
        [parsed[2], parsed[3]],
      ],
      { padding: { top: 50, left: 40, right: 40, bottom: 20 } }
      // { padding: 50 }
    );
  }, [map, parsed]);

  return (
    <Map
      id="savetrainmap"
      mapLib={maplibreGl}
      style={{ height: "500px", zIndex: 1, borderRadius: "10px" }}
      mapStyle="https://api.maptiler.com/maps/ea0be450-77fe-405d-8871-1f29aefe697a/style.json?key=Rs8qUKBURAgmwFrBW6Bj"
      initialViewState={{
        longitude: 4.9,
        latitude: 52.1,
        zoom: 7,
      }}
      minZoom={5}
      ref={map}
    >
      {/* @ts-ignore */}
      <Source type="geojson" data={geojson} lineMetrics={true}>
        <Layer
          type="line"
          paint={{
            "line-color": "#007cff",
            "line-width": 10,
            "line-blur": 2.5,
            "line-gradient": [
              "interpolate",
              ["linear"],
              ["line-progress"],
              0,
              "cyan",
              0.5,
              "royalblue",
              1,
              "blue",
            ],
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />

        <Layer
          type="circle"
          paint={{
            "circle-radius": 4,
            "circle-color": "#db272d",
          }}
        />
      </Source>
    </Map>
  );
}
