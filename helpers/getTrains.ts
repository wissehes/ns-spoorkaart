import axios from "axios";
import { getTrainsResponse } from "../types/getTrainsResponse";
import NS from "./NS";

export default async function getTrains() {
  const { data } = await NS.get<getTrainsResponse>(
    "/virtual-train-api/api/vehicle"
  );

  return data;
}
