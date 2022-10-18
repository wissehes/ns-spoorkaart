export type getArrivalsResponse = ArrivalsResponse;

export interface ArrivalsResponse {
  payload: Payload;
  meta: Meta;
}

export interface Payload {
  source: string;
  arrivals: Arrival[];
}

export interface Arrival {
  origin: string;
  name: string;
  plannedDateTime: string;
  plannedTimeZoneOffset: number;
  actualDateTime: string;
  actualTimeZoneOffset: number;
  plannedTrack: string;
  product: Product;
  trainCategory: string;
  cancelled: boolean;
  messages: any[];
  arrivalStatus: string;
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

export interface Meta {
  numberOfDisruptions: number;
}
