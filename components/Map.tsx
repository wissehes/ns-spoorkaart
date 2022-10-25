import { Trein } from "../types/getTrainsResponse";
import {
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
  GeoJSON,
  LayersControl,
  LayerGroup,
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
import useStations from "../hooks/useStations";

const ICIcon = new Icon({
  iconUrl: "/assets/train.png",
  iconRetinaUrl: "/assets/train.svg",
  iconSize: [90, 50],
});

const sprinterIcon = new Icon({
  iconUrl: "/assets/NS/sprinter.png",
  // iconRetinaUrl: "/assets/train.svg",
  iconSize: [78, 30],
});

const arrivaIcon = new Icon({
  iconUrl: "/assets/arriva/train.png",
  // iconRetinaUrl: "/assets/train.svg",
  // iconSize: [50, 50],
  iconSize: [78, 30],
});

type TrainTypes = {
  [key: string]: Icon;
};

const types: TrainTypes = {
  ARR: arrivaIcon,
  IC: ICIcon,
  SPR: sprinterIcon,
};

export default function Map() {
  const trainQuery = useQuery(
    ["trains"],
    async () => {
      const { data } = await axios.get<Trein[]>("/api/trains");
      return data;
    },
    { refetchInterval: 4000 }
  );

  const stationQuery = useStations();

  return (
    <MapContainer
      center={[52.1, 4.9]}
      zoom={9}
      style={{ height: "90%", width: "100%", zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LayersControl position="topright">
        <LayersControl.Overlay name="Laat stations zien" checked>
          <LayerGroup>
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
          </LayerGroup>
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Laat treinen zien" checked>
          <LayerGroup>
            {trainQuery.data &&
              trainQuery.data.map((train) => (
                <Marker
                  key={train.ritId}
                  position={[train.lat, train.lng]}
                  icon={types[train.type] || sprinterIcon}
                  zIndexOffset={1000}
                >
                  <Popup className={styles.popup}>
                    <TrainPopup train={train} />
                  </Popup>
                </Marker>
              ))}
          </LayerGroup>
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
}
