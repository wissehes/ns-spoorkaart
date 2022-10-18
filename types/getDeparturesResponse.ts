export type getDeparturesResponse = DeparturesResponse;

export interface DeparturesResponse {
  payload: Payload;
  meta: Meta;
}

export interface Payload {
  source: string;
  departures: Departure[];
}

export interface Departure {
  direction: string;
  name: string;
  plannedDateTime: string;
  plannedTimeZoneOffset: number;
  actualDateTime: string;
  actualTimeZoneOffset: number;
  plannedTrack: string;
  product: Product;
  trainCategory: string;
  cancelled: boolean;
  routeStations: RouteStation[];
  messages: any[];
  departureStatus: string;
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

export interface RouteStation {
  uicCode: string;
  mediumName: string;
}

export interface Meta {
  numberOfDisruptions: number;
}
