import { getStationDisruptionsResponse } from "../types/getStationDisruptionsResponse";
import NS from "./NS";

export default async function getStationDisruptions(station: string) {
  const { data } = await NS.get<getStationDisruptionsResponse>(
    `/reisinformatie-api/api/v3/disruptions/station/${station}`
  );
  return data;
}
