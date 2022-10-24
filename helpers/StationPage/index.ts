import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/nl";
dayjs.extend(relativeTime);

export const formatStationType = (type: string) => {
  switch (type) {
    case "MEGA_STATION":
      return "Megastation";
    case "KNOOPPUNT_STOPTREIN_STATION":
      return "Stoptrijn knooppunt";
    case "KNOOPPUNT_INTERCITY_STATION":
      return "Intercity knooppunt";
    case "STOPTREIN_STATION":
      return "Stoptrein station";
    default:
      return type;
  }
};

export const departureStatus = (status: string) => {
  switch (status) {
    case "ON_STATION":
      return "Aan perron";
    case "INCOMING":
      return "Nog niet op station";
  }
};

export const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDelay = (delay: number) => {
  const d = delay / 60;
  return Math.round(d);
};

export const timeUntil = (date: string) => {
  const day = dayjs();
  return day.locale("nl").to(date);
};
