import { GetServerSideProps } from "next";
import { formatTime } from "../../../helpers/StationPage";
import DB from "../../../lib/DB";
import { SavedTrain } from "../../../types/SavedTrain";

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

export default function TrainDataPage({ data }: { data?: SavedTrain[] }) {
  // console.log(data);
  return (
    <div>
      <main>
        <div className="box" style={{}}>
          {data && <TrainHistoryMap data={data} />}
        </div>

        {data?.map((d) => (
          <div className="box" key={new Date(d.date).toISOString()}>
            <p>{formatTime(new Date(d.date).toISOString())}</p>
            <p>{d.snelheid} km/u</p>
          </div>
        ))}
      </main>
    </div>
  );
}

function TrainHistoryMap({ data }: { data: SavedTrain[] }) {
  const [geojson] = useState({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: data.map((d) => [d.lng, d.lat]),
        },
      },
    ],
  });
  console.log(data);
  const parsed = useMemo(() => bbox(geojson), [geojson]);
  const map = createRef<MapRef>();

  useEffect(() => {
    console.log("fitting");
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const train = context.params?.train;

  try {
    const data = await DB.getTrain(Number(train));

    return {
      props: { data: data || [] },
    };
  } catch (e) {
    console.error(e);
    return {
      notFound: true,
    };
  }
};
