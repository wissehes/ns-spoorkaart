import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayerGroup,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { NSGeoJSON } from "../../types/getGeoJSONResponse";
import { Stop } from "../../types/getJourneyDetailsResponse";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useRef } from "react";
import bbox from "@turf/bbox";
import { time } from "../../helpers/TrainPage";

export default function JourneyMap({
  geojson,
  stops,
}: {
  geojson: NSGeoJSON;
  stops: Stop[];
}) {
  return (
    <MapContainer
      center={[52.1, 4.9]}
      zoom={13}
      style={{ height: "100%", zIndex: 1, borderRadius: "10px" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RenderGeo geo={geojson} />

      <LayerGroup>
        {stops.map((s) => (
          <Marker
            key={s.id}
            position={[s.stop.lat, s.stop.lng]}
            // zIndexOffset={1}
            // icon={NSIcon}
          >
            <Popup>
              <StationPopup s={s} />
            </Popup>
          </Marker>
        ))}
      </LayerGroup>
    </MapContainer>
  );
}

function StationPopup({ s }: { s: Stop }) {
  return (
    <div style={{ lineHeight: "0px" }}>
      <p>
        <b>Station:</b> {s.stop.name}
      </p>
      {s.arrivals[0] && (
        <p>
          <b>Aankomst:</b> {time(s, "arr")}
        </p>
      )}

      {s.departures[0] && (
        <p>
          <b>Vertrek:</b> {time(s, "dest")}
        </p>
      )}
    </div>
  );
}

function RenderGeo({ geo }: { geo: NSGeoJSON }) {
  const map = useMap();
  const parsed = bbox(geo);

  map.flyToBounds([
    [parsed[1], parsed[0]],
    [parsed[3], parsed[2]],
  ]);

  return <GeoJSON data={geo} />;
}
