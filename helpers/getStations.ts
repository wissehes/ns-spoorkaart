import axios from "axios";
import { getStationsResponse } from "../types/getStationsResponse";
import NS from "./NS";

export default async function getStations() {
  const { data } = await NS.get<getStationsResponse>(
    "/reisinformatie-api/api/v2/stations"
  );
  return data;
}
