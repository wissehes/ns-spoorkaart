import { Stop } from "../../types/getJourneyDetailsResponse";
import formatTime from "../formatTime";

const time = (stop: Stop, type: "dest" | "arr") => {
  switch (type) {
    case "arr":
      return stop.arrivals[0]
        ? formatTime(stop.arrivals[0]?.actualTime)
        : "--:--";
    case "dest":
      return stop.departures[0]
        ? formatTime(stop.departures[0]?.actualTime)
        : "--:--";
  }
};

export { time };
