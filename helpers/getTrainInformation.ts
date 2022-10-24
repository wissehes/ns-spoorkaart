import axios from "axios";
import { getTrainInfoResponse } from "../types/getTrainInfoResponse";
import NS from "./NS";

export default async function getTrainInformation(
  train: string,
  station: string
) {
  const { data } = await NS.get<getTrainInfoResponse>(
    `virtual-train-api/api/v1/trein/${train}/${station}`,
    {
      params: { features: "zitplaats,platformitems,cta,drukte" },
    }
  );

  return data;
}
