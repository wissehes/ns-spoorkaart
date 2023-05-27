import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { formatTime } from "../../../helpers/StationPage";

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
import { useEffect, useMemo, useState, createRef } from "react";
import { MapRef } from "react-map-gl/dist/esm/mapbox/create-ref";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { TrainPosition } from "@prisma/client";

// Create a getData function
const getData = async (id: number) =>
  await prisma.train.findUnique({
    where: { materialId: id },
    include: { info: true, positions: true },
  });

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
        props: { data: data },
      };
    } else return { notFound: true };
  } else {
    return { notFound: true };
  }
};

export default function TrainDataPage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      <main>
        <div className="box">
          {data && <TrainHistoryMap positions={data.positions} />}
        </div>

        {data.positions.map((d) => (
          <div className="box" key={new Date(d.date).toISOString()}>
            <p>{formatTime(new Date(d.date).toISOString())}</p>
            <p>{d.speed} km/u</p>
          </div>
        ))}
      </main>
    </div>
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
      <Source type="geojson" data={geojson}>
        <Layer
          type="line"
          paint={{ "line-color": "#007cff", "line-width": 5, "line-blur": 2.5 }}
        />
      </Source>
    </Map>
  );
}
