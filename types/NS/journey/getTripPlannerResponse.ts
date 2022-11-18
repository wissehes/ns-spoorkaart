export type getTripPlannerResponse = PlannerResponse;

export interface PlannerResponse {
  source: string;
  trips: Trip[];
  scrollRequestBackwardContext: string;
  scrollRequestForwardContext: string;
}

export interface Trip {
  idx: number;
  uid: string;
  ctxRecon: string;
  plannedDurationInMinutes: number;
  actualDurationInMinutes: number;
  transfers: number;
  status: string;
  messages: any[];
  legs: Leg[];
  crowdForecast: string;
  punctuality?: number;
  optimal: boolean;
  fareRoute: FareRoute;
  fares: Fare[];
  fareLegs: FareLeg[];
  productFare: ProductFare;
  fareOptions: FareOptions;
  type: string;
  shareUrl: Link;
  realtime: boolean;
  routeId: string;
  registerJourney: RegisterJourney;
}

export interface Leg {
  idx: string;
  name: string;
  travelType: string;
  direction: string;
  cancelled: boolean;
  changePossible: boolean;
  alternativeTransport: boolean;
  journeyDetailRef: string;
  origin: Origin;
  destination: Destination;
  product: Product;
  messages: Message[];
  stops: Stop[];
  crowdForecast: string;
  shorterStock: boolean;
  journeyDetail: JourneyDetail[];
  reachable: boolean;
  plannedDurationInMinutes: number;
  punctuality?: number;
  crossPlatformTransfer?: boolean;
  notes?: Note[];
}

export interface Origin {
  name: string;
  lng: number;
  lat: number;
  countryCode: string;
  uicCode: string;
  type: string;
  plannedTimeZoneOffset: number;
  plannedDateTime: string;
  actualTimeZoneOffset?: number;
  actualDateTime?: string;
  plannedTrack: string;
  actualTrack: string;
  checkinStatus: string;
  notes: any[];
}

export interface Destination {
  name: string;
  lng: number;
  lat: number;
  countryCode: string;
  uicCode: string;
  type: string;
  plannedTimeZoneOffset: number;
  plannedDateTime: string;
  actualTimeZoneOffset?: number;
  actualDateTime?: string;
  plannedTrack: string;
  actualTrack: string;
  exitSide?: string;
  checkinStatus: string;
  notes: any[];
}

export interface Product {
  number: string;
  categoryCode: string;
  shortCategoryName: string;
  longCategoryName: string;
  operatorCode: string;
  operatorName: string;
  operatorAdministrativeCode: number;
  type: string;
  displayName: string;
}

export interface Message {
  id: string;
  externalId: string;
  head: string;
  text: string;
  lead: string;
  type: string;
}

export interface Stop {
  uicCode: string;
  name: string;
  lat: number;
  lng: number;
  countryCode: string;
  notes: any[];
  routeIdx: number;
  plannedDepartureDateTime?: string;
  plannedDepartureTimeZoneOffset?: number;
  actualDepartureDateTime?: string;
  actualDepartureTimeZoneOffset?: number;
  actualDepartureTrack: string;
  plannedDepartureTrack: string;
  plannedArrivalTrack: string;
  actualArrivalTrack: string;
  departureDelayInSeconds?: number;
  cancelled: boolean;
  borderStop: boolean;
  passing: boolean;
  plannedArrivalDateTime?: string;
  plannedArrivalTimeZoneOffset?: number;
  actualArrivalDateTime?: string;
  actualArrivalTimeZoneOffset?: number;
  arrivalDelayInSeconds?: number;
}

export interface JourneyDetail {
  type: string;
  link: Link;
}

export interface Link {
  uri: string;
}

export interface Note {
  value: string;
  key: string;
  noteType: string;
  isPresentationRequired: boolean;
}

export interface FareRoute {
  routeId: string;
  origin: StopDetails;
  destination: StopDetails;
}

export interface StopDetails {
  varCode: number;
  name: string;
}

export interface Fare {
  priceInCents: number;
  product: string;
  travelClass: string;
  discountType: string;
}

export interface FareLeg {
  origin: FareStop;
  destination: FareStop;
  operator: string;
  productTypes: string[];
  fares: Fare2[];
}

export interface FareStop {
  name: string;
  lng: number;
  lat: number;
  countryCode: string;
  uicCode: string;
  type: string;
}

export interface Fare2 {
  priceInCents: number;
  priceInCentsExcludingSupplement: number;
  supplementInCents: number;
  buyableTicketSupplementPriceInCents: number;
  product: string;
  travelClass: string;
  discountType: string;
}

export interface ProductFare {
  priceInCents: number;
  priceInCentsExcludingSupplement: number;
  buyableTicketPriceInCents: number;
  buyableTicketPriceInCentsExcludingSupplement: number;
  product: string;
  travelClass: string;
  discountType: string;
  supplementInCents?: number;
  buyableTicketSupplementPriceInCents?: number;
}

export interface FareOptions {
  isInternationalBookable: boolean;
  isInternational: boolean;
  isEticketBuyable: boolean;
  isPossibleWithOvChipkaart: boolean;
  isTotalPriceUnknown: boolean;
  supplementsBasedOnSelectedFare?: SupplementsBasedOnSelectedFare[];
}

export interface SupplementsBasedOnSelectedFare {
  supplementPriceInCents: number;
  fromUICCode: string;
  toUICCode: string;
  link: Link;
}

export interface RegisterJourney {
  url: string;
  searchUrl: string;
  status: string;
  bicycleReservationRequired: boolean;
}
