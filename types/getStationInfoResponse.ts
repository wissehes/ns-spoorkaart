import { Arrival } from "./getArrivalsResponse";
import { Departure } from "./getDeparturesResponse";

export interface StationInfoResponse {
  arrivals: Arrival[];
  departures: Departure[];
}
