import maplibreGl from "maplibre-gl";
import Map, {
  Layer,
  MapProvider,
  MapRef,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
  useMap,
} from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { NSGeoJSON } from "../../types/getGeoJSONResponse";
import { Stop } from "../../types/getJourneyDetailsResponse";
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import bbox from "@turf/bbox";
import { time } from "../../helpers/TrainPage";
import useTrains from "../../hooks/useTrains";
import { TreinWithInfo } from "../../types/getTrainsWithInfoResponse";
import { Button, Flex, SegmentedControl, Text } from "@mantine/core";

export default function JourneyMap({
  geojson,
  stops,
  train,
}: {
  geojson: NSGeoJSON;
  stops: Stop[];
  train?: TreinWithInfo;
}) {
  const map = createRef<MapRef>();
  const [popup, setPopup] = useState<Stop | null>(null);
  const [state, setState] = useState<
    "overview" | "following" | "custom" | string
  >("overview");
  const parsed = useMemo(() => bbox(geojson), [geojson]);
  const speed = useMemo(() => Math.round(train?.snelheid || 0), [train]);

  const fitBounds = useCallback(() => {
    map.current?.fitBounds(
      [
        [parsed[0], parsed[1]],
        [parsed[2], parsed[3]],
      ],
      { padding: { top: 50, left: 40, right: 40, bottom: 20 } }
    );
    setState("overview");
  }, [map, parsed]);

  const followTrain = useCallback(() => {
    if (!train) return;
    map.current?.flyTo({
      zoom: 13,
      animate: true,
      center: { lat: train.lat, lon: train.lng },
    });
    setState("following");
  }, [train, map]);

  useEffect(() => {
    map.current?.on("dragstart", () => setState("custom"));
  }, [map, fitBounds]);

  useEffect(() => {
    if (state !== "following" || !train || map.current?.isEasing()) return;
    map.current?.flyTo({
      center: { lat: train?.lat, lon: train?.lng },
      animate: true,
      duration: 500,
    });
  }, [train, map, state]);

  return (
    <>
      <MapProvider>
        <Map
          id="map"
          ref={map}
          mapLib={maplibreGl}
          style={{ height: "400px", zIndex: 1, borderRadius: "10px" }}
          scrollZoom={false}
          mapStyle="https://api.maptiler.com/maps/ea0be450-77fe-405d-8871-1f29aefe697a/style.json?key=Rs8qUKBURAgmwFrBW6Bj"
          initialViewState={{
            longitude: 4.9,
            latitude: 52.1,
            zoom: 7,
          }}
          mapboxAccessToken=""
        >
          <NavigationControl position="top-left" />
          <ScaleControl />

          <RenderGeo geo={geojson} />

          {stops.map((s) => (
            <Marker
              key={s.id}
              latitude={s.stop.lat}
              longitude={s.stop.lng}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.originalEvent.stopImmediatePropagation();
                setPopup(s);
              }}
            ></Marker>
          ))}

          {train && (
            <Marker
              longitude={train.lng}
              latitude={train.lat}
              anchor="center"
              style={{ cursor: "pointer" }}
            >
              {/*eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/image/${encodeURIComponent(
                  train.info?.materieeldelen[0].type || "default"
                )}`}
                alt={train.ritId}
                // height="20px"
                style={{ height: "30px" }}
              />
            </Marker>
          )}

          {popup && (
            <Popup
              longitude={popup.stop.lng}
              latitude={popup.stop.lat}
              onClose={() => setPopup(null)}
            >
              <StationPopup s={popup} />
            </Popup>
          )}
        </Map>
      </MapProvider>

      <Flex gap="1rem" style={{ marginTop: "1rem" }}>
        <Button
          title="Overzicht"
          onClick={fitBounds}
          variant={state == "overview" ? "filled" : "outline"}
        >
          Overzicht
        </Button>
        <Button
          title="Volg trein"
          disabled={!train}
          onClick={followTrain}
          variant={state == "following" ? "filled" : "outline"}
        >
          Volg trein
        </Button>
        <Text style={{ alignSelf: "center" }}>Snelheid: {speed} km/h</Text>
      </Flex>
    </>
  );
}

function StationPopup({ s }: { s: Stop }) {
  return (
    <div>
      <ul>
        <li>
          <b>Station:</b> {s.stop.name}
        </li>
        {s.arrivals[0] && (
          <li>
            <b>Aankomst:</b> {time(s, "arr")}
          </li>
        )}

        {s.departures[0] && (
          <li>
            <b>Vertrek:</b> {time(s, "dest")}
          </li>
        )}
      </ul>
    </div>
  );
}

function RenderGeo({ geo }: { geo: NSGeoJSON }) {
  const parsed = useMemo(() => bbox(geo), [geo]);
  const { map } = useMap();

  useEffect(() => {
    map?.fitBounds(
      [
        [parsed[0], parsed[1]],
        [parsed[2], parsed[3]],
      ],
      { padding: { top: 50, left: 40, right: 40, bottom: 20 } }
      // { padding: 50 }
    );
  }, [map, parsed]);

  return (
    // @ts-ignore
    <Source type="geojson" data={geo}>
      <Layer
        type="line"
        paint={{ "line-color": "#007cff", "line-width": 5, "line-blur": 2.5 }}
      />
    </Source>
  );
}
