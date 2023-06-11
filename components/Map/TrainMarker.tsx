import { Marker } from "react-map-gl";
import { TreinWithInfo } from "../../types/getTrainsWithInfoResponse";
import { useMemo } from "react";
import { useMapStore } from "../../stores/MapStore";

interface TrainMarkerProps {
  train: TreinWithInfo;
  onClick?: () => void;
}

/**
 * A train marker
 */
export default function TrainMarker({ train: t, onClick }: TrainMarkerProps) {
  const shouldRotate = useMapStore((s) => s.shouldRotate);
  const shouldMirror = useMemo(
    () => t.richting > 0 && t.richting < 180,
    [t.richting]
  );

  const transform = useMemo(() => {
    if (shouldRotate) {
      return `rotate(${t.richting + 90}deg) scaleY(${shouldMirror ? -1 : 1})`;
    } else return undefined;
  }, [shouldRotate, shouldMirror, t.richting]);

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
        style={{
          height: "30px",
          transform: transform,
        }}
      />
    </Marker>
  );
}
