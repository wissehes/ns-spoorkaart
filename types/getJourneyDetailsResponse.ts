export type getJourneyDetailsResponse = JourneyDetailsResponse;

export interface JourneyDetailsResponse {
  payload: JourneyDetails;
}

export interface JourneyDetails {
  notes: Note[];
  productNumbers: string[];
  stops: Stop[];
  allowCrowdReporting: boolean;
  source: string;
}

export interface Note {
  text: string;
  noteType: string;
  type: string;
}

export interface Stop {
  id: string;
  stop: StopStation;
  previousStopId: string[];
  nextStopId: string[];
  destination?: string;
  status: Status;
  arrivals: Arrival[];
  departures: Departure[];
  actualStock?: ActualStock;
  plannedStock?: PlannedStock;
  platformFeatures?: any[];
  coachCrowdForecast?: any[];
}

export interface StopStation {
  name: string;
  lng: number;
  lat: number;
  countryCode: string;
  uicCode: string;
}

export type Status = "ORIGIN" | "STOP" | "PASSING" | "DESTINATION";

export interface Arrival {
  product: Product;
  origin: Origin;
  destination: Destination;
  plannedTime: string;
  actualTime: string;
  delayInSeconds: number;
  plannedTrack: string;
  actualTrack: string;
  cancelled: boolean;
  crowdForecast: string;
  stockIdentifiers: string[];
  punctuality?: number;
}

export interface Product {
  number: string;
  categoryCode: string;
  shortCategoryName: string;
  longCategoryName: string;
  operatorCode: string;
  operatorName: string;
  type: string;
}

export interface Departure {
  product: Product;
  origin: Origin;
  destination: Destination;
  plannedTime: string;
  actualTime: string;
  delayInSeconds: number;
  plannedTrack: string;
  actualTrack: string;
  cancelled: boolean;
  crowdForecast: string;
  stockIdentifiers: string[];
}

export interface Origin {
  name: string;
  lng: number;
  lat: number;
  countryCode: string;
  uicCode: string;
}

export interface Destination {
  name: string;
  lng: number;
  lat: number;
  countryCode: string;
  uicCode: string;
}

export interface ActualStock {
  trainType: string;
  numberOfSeats: number;
  numberOfParts: number;
  trainParts: TrainPart[];
  hasSignificantChange: boolean;
}

export interface TrainPart {
  stockIdentifier: string;
  facilities: string[];
  image: Image;
}

export interface Image {
  uri: string;
}

export interface PlannedStock {
  trainType: string;
  numberOfSeats: number;
  numberOfParts: number;
  trainParts: TrainPart[];
  hasSignificantChange: boolean;
}
