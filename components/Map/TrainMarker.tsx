import { Marker } from "react-map-gl";
import { TreinWithInfo } from "../../types/getTrainsWithInfoResponse";

interface TrainMarkerProps {
  train: TreinWithInfo;
  onClick?: () => void;
}

/**
 * A train marker
 */
export default function TrainMarker({ train: t, onClick }: TrainMarkerProps) {
  return (
    <Marker
      key={t.ritId}
      longitude={t.lng}
      latitude={t.lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.();
      }}
      style={{ cursor: "pointer" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/image/${encodeURIComponent(
          t.info?.materieeldelen[0]?.type || "default"
        )}`}
        alt={t.ritId}
        style={{ height: "30px" }}
      />
    </Marker>
  );
}
