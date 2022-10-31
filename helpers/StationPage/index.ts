import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/nl";
dayjs.extend(relativeTime);

const stationTypes: { [key: string]: string } = {
  MEGA_STATION: "Megastation",
  KNOOPPUNT_STOPTREIN_STATION: "Stoptreinnenknooppunt",
  KNOOPPUNT_INTERCITY_STATION: "Intercityknooppunt",
  KNOOPPUNT_SNELTREIN_STATION: "Sneltreinenknooppunt",
  STOPTREIN_STATION: "Stoptrein station",
  SNELTREIN_STATION: "Sneltrein station",
  INTERCITY_STATION: "Intercitystation",
};

export const formatStationType = (type: string) => {
  return stationTypes[type] || type;
};

export const countries: { [key: string]: { name: string; emoji: string } } = {
  D: { name: "Duitsland", emoji: "🇩🇪" },
  B: { name: "België", emoji: "🇧🇪" },
  A: { name: "Oostenrijk", emoji: "🇦🇹" },
  I: { name: "Italië", emoji: "🇮🇹" },
  NL: { name: "Nederland", emoji: "🇳🇱" },
  GB: { name: "Verenigd Koninkrijk", emoji: "🇬🇧" },
  CH: { name: "Zwitserland", emoji: "🇨🇭" },
  DK: { name: "Denemarken", emoji: "🇩🇰" },
  F: { name: "Frankrijk", emoji: "🇫🇷" },
  S: { name: "Zweden", emoji: "🇸🇪" },
};

export const formatCountry = (country: string) =>
  countries[country] || { name: country, emoji: country };

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
