export type getTrainInfoResponse = TrainInformation;
export type getMultipleTrainsInfoResponse = TrainInformation[];

export interface TrainInformation {
  bron: string;
  ritnummer: number;
  station: string;
  type: string;
  vervoerder: string;
  spoor: string;
  materieeldelen: Materieeldelen[];
  ingekort: boolean;
  lengte: number;
  lengteInMeters: number;
  lengteInPixels: number;
  debug?: string[];
  perronVoorzieningen?: PerronVoorzieningen[];
  bakbord?: number;
  rijrichting?: string;
}

export interface Materieeldelen {
  materieelnummer: number;
  type: string;
  faciliteiten: string[];
  afbeelding: string;
  breedte: number;
  hoogte: number;
  bakken: Bakken[];
  zitplaatsen?: Zitplaatsen;
}

export interface Zitplaatsen {
  staanplaatsEersteKlas: number;
  staanplaatsTweedeKlas: number;
  zitplaatsEersteKlas: number;
  zitplaatsTweedeKlas: number;
  klapstoelEersteKlas: number;
  klapstoelTweedeKlas: number;
}

export interface Bakken {
  afbeelding: Afbeelding;
}

export interface Afbeelding {
  url: string;
  breedte: number;
  hoogte: number;
}

export interface PerronVoorzieningen {
  paddingLeft: number;
  width: number;
  type: string;
  description: string;
}
