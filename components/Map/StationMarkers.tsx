import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-map-gl";
import useStations from "../../hooks/useStations";
import { SmallStation } from "../../types/getStationsResponse";
import StationPopup from "../StationPopup";

export default function StationMarkers() {
  const [showStations, setStations] = useState(false);
  const [chosenStation, setStation] = useState<SmallStation | null>(null);

  const stationQuery = useStations();
  const { map } = useMap();
  const router = useRouter();

  useEffect(() => {
    const query = router.query?.station;
    if (!query || typeof query !== "string" || !stationQuery.data) return;

    const foundStation = stationQuery.data.find(({ code }) => code == query);

    if (foundStation) {
      router.push("/trains", undefined, { shallow: true });
      setStation(foundStation);
      map?.flyTo({
        animate: true,
        duration: 1000,
        zoom: 15,
        center: { lat: foundStation.lat, lon: foundStation.lng },
      });
    } else router.push("/trains", undefined, { shallow: true });
  }, [router, stationQuery, map]);

  map?.on("zoomend", () => {
    if (map.getZoom() > 11) {
      setStations(() => true);
    } else setStations(() => false);
  });

  return (
    <>
      {stationQuery.data?.map((s) => (
        <Marker
          key={s.code}
          longitude={s.lng}
          latitude={s.lat}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setStation(s);
          }}
          style={{ cursor: "pointer", opacity: showStations ? 1 : 0 }}
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
