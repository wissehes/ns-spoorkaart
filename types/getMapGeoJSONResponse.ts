export type getMapGeoJSONResponse = MapGeoJSONResponse;

export interface MapGeoJSONResponse {
  links: Links;
  payload: MapGeoJSON;
  meta: Meta;
}

export interface MapGeoJSON {
  //   type: string;
  type:
    | "Point"
    | "MultiPoint"
    | "LineString"
    | "MultiLineString"
    | "Polygon"
    | "MultiPolygon"
    | "GeometryCollection"
    | "Feature"
    | "FeatureCollection";

  features: Feature[];
}

export interface Feature {
  //   type: string;
  type: "Feature";
  properties: Properties;
  geometry: Geometry;
}

export interface Properties {
  from: string;
  to: string;
}

export interface Geometry {
  type: string;
  coordinates: number[][];
}

export interface Meta {}
export interface Links {}
