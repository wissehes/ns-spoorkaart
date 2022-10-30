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

import useStations from "../hooks/useStations";
import { useMemo, useState } from "react";
import Image from "next/image";
import useTrains from "../hooks/useTrains";
import { TreinWithInfo } from "../types/getTrainsWithInfoResponse";
import TrainPopup from "./TrainPopup";
import { SmallStation } from "../types/getStationsResponse";
import StationPopup from "./StationPopup";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getMapGeoJSONResponse } from "../types/getMapGeoJSONResponse";

type TrainIcon = {
  url: string;
  width: number;
  height: number;
};

type TrainTypes = {
  [key: string]: TrainIcon;
};

const types: TrainTypes = {
  ARR: {
    url: "/assets/arriva/train.png",
    height: 30,
    width: 78,
  },
  IC: {
    url: "/assets/train.png",
    height: 20,
    width: 80,
  },
  SPR: {
    url: "/assets/NS/sprinter.png",
    height: 30,
    width: 78,
  },
};

const layerStyle = {
  id: "point",
  type: "circle",
  paint: {
    "circle-radius": 10,
    "circle-color": "#007cbf",
  },
};

export default function NewMap() {
  const trackQuery = useQuery(["spoorkaart"], async () => {
    const { data } = await axios.get<getMapGeoJSONResponse>("/api/spoorkaart");
    return data;
  });

  return (
    <MapProvider>
      <Map
        id="map"
        mapLib={maplibreGl}
        style={{ width: "100%", height: "90%", zIndex: 10 }}
        //   mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=Rs8qUKBURAgmwFrBW6Bj"
        mapStyle="https://api.maptiler.com/maps/ea0be450-77fe-405d-8871-1f29aefe697a/style.json?key=Rs8qUKBURAgmwFrBW6Bj"
        initialViewState={{
          longitude: 4.9,
          latitude: 52.1,
          zoom: 7,
        }}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        {trackQuery.data && (
          // @ts-ignore
          <Source type="geojson" data={trackQuery.data.payload}>
            <Layer
              type="line"
              paint={{ "line-color": "#979797", "line-width": 1.5 }}
            />
          </Source>
        )}

        <StationMarkers />

        <TrainMarkers />
      </Map>
    </MapProvider>
  );
}

function TrainMarkers() {
  const trainQuery = useTrains();
  const [chosenTrain, setTrain] = useState<TreinWithInfo | null>(null);
  const actualChosenTrain = useMemo(() => {
    const found = trainQuery.data?.find(
      (t) => t.treinNummer == chosenTrain?.treinNummer
    );
    if (found && found.lat == chosenTrain?.lat) {
      return chosenTrain;
    } else {
      return found;
    }
  }, [trainQuery, chosenTrain]);

  return (
    <>
      {trainQuery.data?.map((t) => (
        <Marker
          key={t.ritId}
          longitude={t.lng}
          latitude={t.lat}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setTrain(t);
          }}
          style={{ cursor: "pointer" }}
        >
          {t.info?.materieeldelen[0].type ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/image/${encodeURIComponent(
                t.info?.materieeldelen[0].type
              )}`}
              alt={t.ritId}
              // height="20px"
              style={{ height: "30px" }}
            />
          ) : (
            <Image
              src={types[t.type].url}
              alt={t.ritId}
              width={types[t.type].width}
              height={types[t.type].height}
            />
          )}
        </Marker>
      ))}

      {actualChosenTrain && (
        <Popup
          longitude={actualChosenTrain.lng}
          latitude={actualChosenTrain.lat}
          onClose={() => setTrain(null)}
          anchor="bottom"
          maxWidth="350"
          //   style={{ width: "50px", height: "50px" }}
          style={{ color: "black" }}
        >
          <TrainPopup train={actualChosenTrain} />
        </Popup>
      )}
    </>
  );
}

function StationMarkers() {
  const [showStations, setStations] = useState(false);
  const [chosenStation, setStation] = useState<SmallStation | null>(null);

  const stationQuery = useStations();
  const { map } = useMap();

  map?.on("zoomend", () => {
    if (map.getZoom() > 11) {
      setStations(true);
    } else setStations(false);
  });

  return (
    <>
      {showStations &&
        stationQuery.data?.map((s) => (
          <Marker
            key={s.code}
            longitude={s.lng}
            latitude={s.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setStation(s);
            }}
            style={{ cursor: "pointer" }}
          >
            <Image
              src="/assets/NS/logo.png"
              alt={s.code}
              width="40"
              height="15.9"
            />
          </Marker>
        ))}

      {chosenStation && (
        <Popup
          longitude={chosenStation.lng}
          latitude={chosenStation.lat}
          onClose={() => setStation(null)}
          anchor="bottom"
          maxWidth="350"
          //   style={{ width: "50px", height: "50px" }}
          style={{ color: "black" }}
        >
          <StationPopup station={chosenStation} />
        </Popup>
      )}
    </>
  );
}
