// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import getTrains from "../../../helpers/getTrains";
import NS from "../../../helpers/NS";
import { getMultipleTrainsInfoResponse } from "../../../types/getTrainInfoResponse";
import { getTrainsResponse, Trein } from "../../../types/getTrainsResponse";
import { TreinWithInfo } from "../../../types/getTrainsWithInfoResponse";

type Data = TreinWithInfo[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const data = await getTrains();
  const trainsInfo = await getTrainInfo(data.payload.treinen);

  const treinenMetInfo: TreinWithInfo[] = [];

  for (const trein of data.payload.treinen) {
    const foundInfo = trainsInfo.find((a) => a.ritnummer == trein.treinNummer);
    if (foundInfo) {
      treinenMetInfo.push({
        ...trein,
        info: foundInfo,
      });
    } else {
      treinenMetInfo.push({
        ...trein,
      });
    }
  }

  res.status(200).json(treinenMetInfo);
}

async function getTrainInfo(trains: Trein[]) {
  const { data } = await NS.get<getMultipleTrainsInfoResponse>(
    "/virtual-train-api/api/v1/trein",
    {
      params: { ids: trains.map((t) => t.ritId).join(","), all: false },
    }
  );

  return data;
}
