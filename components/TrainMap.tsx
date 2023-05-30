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

import { useEffect, useMemo, useState } from "react";
import useTrains from "../hooks/useTrains";
import { TreinWithInfo } from "../types/getTrainsWithInfoResponse";
import TrainPopup from "./TrainPopup";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getMapGeoJSONResponse } from "../types/getMapGeoJSONResponse";
import { useRouter } from "next/router";
import StationMarkers from "./Map/StationMarkers";
import TrainMarker from "./Map/TrainMarker";

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

export default function TrainMap() {
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
        minZoom={5}
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
  const { map } = useMap();
  const [chosenTrain, setTrain] = useState<TreinWithInfo | null>(null);

  const router = useRouter();

  const actualChosenTrain = useMemo(() => {
    const found = trainQuery.data?.find(
      (t) => t.treinNummer == chosenTrain?.treinNummer
    );
    if (found && found.lat == chosenTrain?.lat) {
      return chosenTrain;
    } else if (found) {
      map?.flyTo({
        center: [found?.lng, found?.lat],
        zoom: map.getZoom(),
        animate: true,
        duration: 500,
      });
      return found;
    }
  }, [trainQuery, chosenTrain, map]);

  useEffect(() => {
    const query = router.query?.train;
    const stationQuery = router.query?.station;

    if (stationQuery) setTrain(null);

    if (!query || typeof query !== "string" || !trainQuery.data) return;

    const foundTrain = trainQuery.data?.find(({ ritId }) => ritId == query);

    if (foundTrain) {
      router.push("/trains", undefined, { shallow: true });
      setTrain(foundTrain);
      map?.flyTo({
        animate: true,
        duration: 1000,
        zoom: 15,
        center: { lat: foundTrain.lat, lon: foundTrain.lng },
      });
    }
  }, [router, map, trainQuery]);

  return (
    <>
      {trainQuery.data?.map((t) => (
        <TrainMarker key={t.ritId} train={t} onClick={() => setTrain(t)} />
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
