export type getStationsResponse = StationsResponse;

export interface StationsResponse {
  payload: Station[];
}

// This interface only has the bare minimum
// of data.
export class SmallStations {
  constructor(st: Station[]) {
    this.stations = st.map((s) => {
      const smallStation: SmallStation = {
        stationType: s.stationType,
        code: s.code,
        sporen: s.sporen,
        heeftVertrektijden: s.heeftVertrektijden,
        namen: s.namen,
        land: s.land,
        lat: s.lat,
        lng: s.lng,
      };

      return smallStation;
    });
  }

  stations: SmallStation[];
}

export interface SmallStation {
  stationType: string;
  code: string;
  sporen: Spoor[];
  heeftVertrektijden: boolean;
  namen: Namen;
  land: string;
  lat: number;
  lng: number;
}

export interface Station {
  UICCode: string;
  stationType: string;
  EVACode: string;
  code: string;
  sporen: Spoor[];
  synoniemen: string[];
  heeftFaciliteiten: boolean;
  heeftVertrektijden: boolean;
  heeftReisassistentie: boolean;
  namen: Namen;
  land: string;
  lat: number;
  lng: number;
  radius: number;
  naderenRadius: number;
  ingangsDatum: string;

  // [key: string]: string | string[] | Spoor[] | boolean | Namen | number;
}

export interface Spoor {
  spoorNummer: string;
}

export interface Namen {
  lang: string;
  middel: string;
  kort: string;
}
