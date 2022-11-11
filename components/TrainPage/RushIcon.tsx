import Image from "next/image";
import { CSSProperties } from "react";
import { Stop } from "../../types/getJourneyDetailsResponse";

import Rush0 from "./RushIcons/rush-0.svg";
import Rush1 from "./RushIcons/rush-1.svg";
import Rush2 from "./RushIcons/rush-2.svg";
import Rush3 from "./RushIcons/rush-3.svg";

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
  color = true,
  style,
}: {
  stop: Stop;
  color?: boolean;
  style?: CSSProperties;
}) {
  const busyness = stop.departures[0]?.crowdForecast || "UNKNOWN";
  const Icon = icons[busyness] || icons.UNKNOWN;
  const iconColor = color ? colors[busyness] : "white";

  return (
    <div style={{ ...style, fill: iconColor }}>
      <Icon />
    </div>
  );
}
