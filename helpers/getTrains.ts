import axios from "axios";
import { getTrainsResponse } from "../types/getTrainsResponse";

export default async function getTrains() {
  const { data } = await axios.get<getTrainsResponse>(
    "https://gateway.apiportal.ns.nl/virtual-train-api/api/vehicle",
    {
      headers: {
        "Ocp-Apim-Subscription-Key": "ebe8f1f1ad584f309cf6eee7f28bf8c9",
      },
    }
  );

  return data;
}
