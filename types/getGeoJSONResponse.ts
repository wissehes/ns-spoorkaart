export type getGeoJSONResponse = GeoJSONResponse;

export interface GeoJSONResponse {
  links: Links;
  payload: NSGeoJSON;
  meta: Meta;
}

export interface Links {}

export interface NSGeoJSON {
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
  type: string;
  properties: Properties;
  geometry: Geometry;
}

export interface Properties {
  stations: string[];
}

export interface Geometry {
  type: string;
  coordinates: number[][];
}

export interface Meta {}
