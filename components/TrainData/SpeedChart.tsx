import { TrainPosition } from "@prisma/client";
import { useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";
// import dynamic from "next/dynamic";

// const Chart = dynamic(() => import("react-charts").then((mod) => mod.Chart), {
//   ssr: false,
// });

interface SpeedChartProps {
  positions: TrainPosition[];
}

type SpeedItem = {
  date: Date;
  speed: number;
};

type Series = {
  label: string;
  data: SpeedItem[];
};

export default function SpeedChart({ positions }: SpeedChartProps) {
  const data: Series = useMemo<Series>(
    () => ({
      label: "Snelheid",
      data: positions.map((p) => ({ date: new Date(p.date), speed: p.speed })),
    }),
    [positions]
  );

  const primaryAxis = useMemo(
    (): AxisOptions<SpeedItem> => ({
      getValue: (datum) => datum.date,
    }),
    []
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<SpeedItem>[] => [
      {
        getValue: (datum) => datum.speed,
      },
    ],
    []
  );

  return (
    <Chart
      options={{
        data: [data],
        primaryAxis,
        secondaryAxes,
      }}
    />
  );
}
