export type getTrainsResponse = TrainsResponse;

export interface TrainsResponse {
  //   links: Links;
  payload: Payload;
  meta: Meta;
}

// export interface Links {}

export interface Payload {
  treinen: Trein[];
}

export interface Trein {
  treinNummer: number;
  ritId: string;
  lat: number;
  lng: number;
  snelheid: number;
  richting: number;
  horizontaleNauwkeurigheid: number;
  type: string;
  bron: string;
  materieel?: number[];
}

export interface Meta {}
