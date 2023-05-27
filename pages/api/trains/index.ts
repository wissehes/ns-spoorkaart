// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import getTrains from "../../../helpers/getTrains";
import { TreinWithInfo } from "../../../types/getTrainsWithInfoResponse";

import DB from "../../../lib/DB";
import { getTrainInfo } from "../../../helpers/trains/getTrainInfo";
import { downloadAndSaveImage } from "../../../helpers/trains/downloadAndSaveImage";
import { saveTrains } from "../../../helpers/trains/saveTrains";

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

  await downloadAndSaveImage(treinenMetInfo);
  await saveTrains(treinenMetInfo);

  res.status(200).json(treinenMetInfo);
}
