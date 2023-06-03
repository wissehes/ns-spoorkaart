import { TrainPosition } from "@prisma/client";
import { useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  const twoHoursAgo = Date.now() - 2 * 60 * 1000;

  const data: Series = useMemo<Series>(
    () => ({
      label: "Snelheid",
      data: positions
        .filter((p) => new Date(p.date).getTime() < twoHoursAgo)
        .map((p) => ({ date: new Date(p.date), speed: p.speed })),
    }),
    [positions, twoHoursAgo]
  );

  const primaryAxis = useMemo(
    (): AxisOptions<SpeedItem> => ({
      getValue: (datum) => datum.date,
      scaleType: "localTime",
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
    <ResponsiveContainer height="20rem">
      <LineChart data={data.data} width={400} height={400}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="pv"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
