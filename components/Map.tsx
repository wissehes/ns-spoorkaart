import { Trein } from "../types/getTrainsResponse";
import {
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
  GeoJSON,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { SmallStation } from "../types/getStationsResponse";

import styles from "../styles/Map.module.css";
import StationPopup from "./StationPopup";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Icon, Point } from "leaflet";
import TrainPopup from "./TrainPopup";
import { GeoJsonObject } from "geojson";

const trainIcon = new Icon({
  iconUrl: "/assets/train.png",
  iconRetinaUrl: "/assets/train.svg",
  iconSize: [90, 50],
});

export default function Map() {
  const trainQuery = useQuery(
    ["trains"],
    async () => {
      const { data } = await axios.get<Trein[]>("/api/trains");
      return data;
    },
    { refetchInterval: 4000 }
  );

  const stationQuery = useQuery(["stations"], async () => {
    const { data } = await axios.get<SmallStation[]>("/api/stations");
    return data;
  });
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

      {trainQuery.data &&
        trainQuery.data.map((train) => (
          <Marker
            key={train.ritId}
            position={[train.lat, train.lng]}
            icon={trainIcon}
            zIndexOffset={1000}
          >
            <Popup className={styles.popup}>
              <TrainPopup train={train} />
            </Popup>
          </Marker>
        ))}

      {stationQuery.data &&
        stationQuery.data.map((station) => (
          <Marker
            key={station.code}
            position={[station.lat, station.lng]}
            zIndexOffset={1}
          >
            <Popup className={styles.popup}>
              <StationPopup station={station} />
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
