export type getStationDisruptionsResponse = StationDisruption[];

export interface StationDisruption {
  id: string;
  type: string;
  registrationTime: string;
  releaseTime: string;
  local: boolean;
  title: string;
  titleSections: TitleSection[][];
  topic?: string;
  isActive: boolean;
  start: string;
  end: string;
  phase?: Phase;
  impact: Impact;
  expectedDuration?: ExpectedDuration;
  publicationSections: PublicationSection[];
  timespans: Timespan[];
  alternativeTransportTimespans: AlternativeTransportTimespan[];
  period?: string;
}

export interface TitleSection {
  type: string;
  value: string;
}

export interface Phase {
  id: string;
  label: string;
}

export interface Impact {
  value: number;
}

export interface ExpectedDuration {
  description: string;
  endTime: string;
}

export interface PublicationSection {
  section: Section;
  consequence: Consequence;
  sectionType: string;
}

export interface Section {
  stations: Station[];
  direction: string;
}

export interface Station {
  uicCode: string;
  stationCode: string;
  name: string;
  coordinate: Coordinate;
  countryCode: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Consequence {
  section: Section;
  description: string;
  level: string;
}

export interface Timespan {
  start: string;
  end: string;
  situation: Situation;
  cause: Cause;
  advices: string[];
  period?: string;
  alternativeTransport?: AlternativeTransport;
  additionalTravelTime?: AlternativeTransport;
}

export interface Situation {
  label: string;
}

export interface Cause {
  label: string;
}

export interface AlternativeTransport {
  label: string;
  shortLabel: string;
}

export interface AlternativeTransportTimespan {
  start: string;
  end: string;
  alternativeTransport: AlternativeTransport2;
}

export interface AlternativeTransport2 {
  location: Location[];
  label: string;
  shortLabel: string;
}

export interface Location {
  station: Station;
  description: string;
}
