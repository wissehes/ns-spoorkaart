import { GetServerSideProps, InferGetServerSidePropsType } from "next";

import maplibreGl from "maplibre-gl";
import Map, { Layer, MapProvider, Source, useMap } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import bbox from "@turf/bbox";
import { useEffect, useMemo, createRef } from "react";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { TrainPosition } from "@prisma/client";
import StandardLayout from "../../../layouts/StandardLayout";
import { Header } from "../../../components/Layout/Header";
import TrainDisplay from "../../../components/Train/TrainDisplay";
import { Badge, Group, Paper, Text } from "@mantine/core";
import usePositionsGeojson from "../../../hooks/usePositonsGeojson";
import { JourneyDetails } from "../../../types/getJourneyDetailsResponse";
import { getJourneyFromMaterial } from "../../../helpers/getJourney";
import CurrentJourney from "../../../components/TrainData/CurrentJourney";
import { trpc } from "../../../helpers/trpc";
import { TreinWithInfo } from "../../../types/getTrainsWithInfoResponse";
import TrainMarker from "../../../components/Map/TrainMarker";
import TrainStats from "../../../components/TrainData/TrainStats";
import NearbyStations from "../../../components/TrainData/NearbyStations";

// Create a getData function
const getData = async (id: number) => {
  const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return await prisma.train.findFirst({
    where: { materialId: id },
    include: { info: true, positions: { where: { date: { gte: date } } } },
    // include: { info: true, positions: true },
  });
};

type PrismaData = NonNullable<Awaited<ReturnType<typeof getData>>>;
type SSRProps = { data: PrismaData; currentJourney: JourneyDetails | null };

const validate = z.preprocess(
  (a) => parseInt(z.string().parse(a), 10),
  z.number().positive()
);

export const getServerSideProps: GetServerSideProps<SSRProps> = async (
  context
) => {
  const train = context.params?.train;
  const matNum = validate.safeParse(train);

  const data = matNum.success ? await getData(matNum.data) : null;
  const journey = matNum.success
    ? await getJourneyFromMaterial(matNum.data)
    : null;
  if (!matNum.success || !data) return { notFound: true };

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)) as PrismaData,
      currentJourney: journey,
    },
  };
};

export default function TrainDataPage({
  data,
  currentJourney,
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

  const trains = trpc.trains.getTrains.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const thisTrain = useMemo(
    () =>
      trains.data?.find((t) => t.materieel?.find((m) => m == data.materialId)),
    [trains.data, data.materialId]
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

      {currentJourney && <CurrentJourney journey={currentJourney} />}
      {thisTrain && data.info && (
        <TrainStats
          train={thisTrain}
          info={data.info}
          positions={data.positions}
        />
      )}

      <div className="box">
        {data && <TrainHistoryMap positions={sortedPos} train={thisTrain} />}
      </div>

      {thisTrain && <NearbyStations lat={thisTrain.lat} lon={thisTrain.lng} />}
    </StandardLayout>
  );
}

interface TrainHistoryMapProps {
  positions: TrainPosition[];
  train: TreinWithInfo | undefined;
}

function TrainHistoryMap({ positions, train }: TrainHistoryMapProps) {
  return (
    <MapProvider>
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
      >
        <Markers positions={positions} />
        {train && <TrainMarker train={train} />}
      </Map>
    </MapProvider>
  );
}

function Markers({ positions }: { positions: TrainPosition[] }) {
  const geojson = usePositionsGeojson(positions);
  const parsed = useMemo(() => bbox(geojson), [geojson]);
  const map = useMap();

  useEffect(() => {
    if (parsed.includes(Infinity)) return;

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
    <>
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
    </>
  );
}
