import { Departure } from "./getDeparturesResponse";
import { JourneyDetails, Stop } from "./getJourneyDetailsResponse";

export interface DepartureWithJourney {
  departure: Departure;
  journey?: JourneyDetails;
  stop?: Stop;
}
