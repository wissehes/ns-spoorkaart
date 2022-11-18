import Image from "next/image";
import { CSSProperties } from "react";
import { Stop } from "../../types/getJourneyDetailsResponse";

import Rush0 from "./RushIcons/rush-0.svg";
import Rush1 from "./RushIcons/rush-1.svg";
import Rush2 from "./RushIcons/rush-2.svg";
import Rush3 from "./RushIcons/rush-3.svg";

type busyness = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN" | string;

const icons: { [key: string]: any } = {
  LOW: Rush1,
  MEDIUM: Rush2,
  HIGH: Rush3,
  UNKNOWN: Rush0,
};

const colors: { [key: string]: string } = {
  LOW: "#008670",
  MEDIUM: "#fd6302",
  HIGH: "#ed0145",
  UNKNOWN: "#008670",
};

export default function RushIcon({
  stop,
  busyness,
  color = true,
  style,
}: {
  stop?: Stop;
  busyness?: busyness;
  color?: boolean;
  style?: CSSProperties;
}) {
  const _busyness = stop?.departures[0]?.crowdForecast || busyness || "UNKNOWN";
  const Icon = icons[_busyness] || icons.UNKNOWN;
  const iconColor = color ? colors[_busyness] : "white";

  return (
    <div style={{ ...style, fill: iconColor }}>
      <Icon />
    </div>
  );
}
