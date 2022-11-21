import { Arrival } from "./getArrivalsResponse";
import { JourneyDetails, Stop } from "./getJourneyDetailsResponse";

export interface ArrivalWithJourney {
  arrival: Arrival;
  journey?: JourneyDetails;
  stop?: Stop;
}
