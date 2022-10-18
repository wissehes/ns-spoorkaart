import { Trein } from "../types/getTrainsResponse";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { SmallStation } from "../types/getStationsResponse";

import styles from "../styles/Map.module.css";
import StationPopup from "./StationPopup";

export default function Map({
  trains,
  stations,
}: {
  trains: Trein[];
  stations: SmallStation[];
}) {
  console.log(stations);
  return (
    <MapContainer
      center={[52.1, 4.9]}
      zoom={9}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {trains.map((train) => (
        <Marker key={train.ritId} position={[train.lat, train.lng]}>
          <Popup>
            <h1>
              {train.type} - {train.treinNummer} - {train.richting}
            </h1>
            <p>{train.snelheid} km/u</p>
            <p>type {train.type}</p>
          </Popup>
        </Marker>
      ))}

      {stations.map((station) => (
        <Marker key={station.code} position={[station.lat, station.lng]}>
          <Popup>
            <StationPopup station={station} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
