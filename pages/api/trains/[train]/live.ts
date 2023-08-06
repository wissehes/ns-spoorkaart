import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import getTrains from "../../../../helpers/getTrains";
import { getTrainInfo } from "../../../../helpers/trains/getTrainInfo";

type Data = any;

const schema = z.object({ train: z.string() });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    res.status(401).json(result.error);
    return;
  }
  const trainNumber = result.data.train;

  const allTrains = await getTrains();
  const thisTrain = allTrains.payload.treinen.find(
    (t) => t.ritId == trainNumber
  );

  if (!thisTrain) {
    res.status(404).json({ message: "Not found." });
    return;
  }

  const infos = await getTrainInfo([thisTrain]);
  const thisInfo = infos.find((i) => i.ritnummer == thisTrain.treinNummer);

  if (thisInfo) {
    res.json({ ...thisTrain, info: thisInfo });
  } else return res.json(thisTrain);
}
