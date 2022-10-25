import { SmallStation } from "./getStationsResponse";

export type RedisStations = {
  stations: SmallStation[];
  saveDate: Date;
};
