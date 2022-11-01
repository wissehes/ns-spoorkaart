import Image from "next/image";
import { useState } from "react";
import { Marker, Popup, useMap } from "react-map-gl";
import useStations from "../../hooks/useStations";
import { SmallStation } from "../../types/getStationsResponse";
import StationPopup from "../StationPopup";

export default function StationMarkers() {
  const [showStations, setStations] = useState(false);
  const [chosenStation, setStation] = useState<SmallStation | null>(null);

  const stationQuery = useStations();
  const { map } = useMap();

  map?.on("zoomend", () => {
    if (map.getZoom() > 11) {
      setStations(() => true);
    } else setStations(() => false);
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
