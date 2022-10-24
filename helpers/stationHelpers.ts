import { getArrivalsResponse } from "../types/getArrivalsResponse";
import { getDeparturesResponse } from "../types/getDeparturesResponse";
import NS from "./NS";

export async function getDepartures(code: String, limit?: number) {
  const { data } = await NS.get<getDeparturesResponse>(
    "/reisinformatie-api/api/v2/departures",
    {
      params: { station: code },
    }
  );

  if (!limit || limit == 0) {
    return data.payload.departures;
  } else if (data.payload.departures.length <= limit) {
    return data.payload.departures;
  } else return data.payload.departures.slice(0, limit);
}

export async function getArrivals(code: String, limit?: number) {
  const { data } = await NS.get<getArrivalsResponse>(
    "/reisinformatie-api/api/v2/arrivals",
    {
      params: { station: code },
    }
  );

  if (!limit || limit == 0) {
    return data.payload.arrivals;
  } else if (data.payload.arrivals.length <= limit) {
    return data.payload.arrivals;
  } else return data.payload.arrivals.slice(0, limit);
}

/**
 * Returns disruptions, arrivals and departures
 * @param code The station code
 */
export async function getStationDetails(code: string) {}
