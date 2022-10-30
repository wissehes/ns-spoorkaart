import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Icon } from "leaflet";
import { Marker, LayerGroup, Popup } from "react-leaflet";
import { TreinWithInfo } from "../../types/getTrainsWithInfoResponse";
import styles from "../../styles/Map.module.css";
import TrainPopup from "../TrainPopup";
import { useMemo } from "react";

const sprinterIcon = new Icon({
  iconUrl: "/assets/NS/sprinter.png",
  // iconRetinaUrl: "/assets/train.svg",
  iconSize: [78, 30],
});

const ICIcon = new Icon({
  iconUrl: "/assets/train.png",
  iconRetinaUrl: "/assets/train.svg",
  iconSize: [90, 50],
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

export default function TrainMarkers() {
  const trainQuery = useQuery(
    ["trains"],
    async () => {
      const { data } = await axios.get<TreinWithInfo[]>("/api/trains");
      return data;
    },
    { refetchInterval: 4000 }
  );

  return (
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
  );
}
