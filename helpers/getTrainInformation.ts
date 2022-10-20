import { getTrainInfoResponse } from "../types/getTrainInfoResponse";
import NS from "./NS";

export default async function getTrainInformation(train: string) {
  const { data } = await NS.get<getTrainInfoResponse>(
    `/virtual-train-api/api/v1/trein/${train}`
  );

  return data;
}
