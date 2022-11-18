import { getMultipleTrainsInfoResponse } from "../../types/getTrainInfoResponse";
import { Trein } from "../../types/getTrainsResponse";
import NS from "../NS";

export async function getTrainInfo(trains: Trein[]) {
  const { data } = await NS.get<getMultipleTrainsInfoResponse>(
    "/virtual-train-api/api/v1/trein",
    {
      params: {
        features: "zitplaats",
        ids: trains.map((t) => t.ritId).join(","),
        all: false,
      },
    }
  );

  return data;
}
