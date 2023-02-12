// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import getDistanceFromGPS from "../../../helpers/getDistanceFromGPS";
import NS from "../../../helpers/NS";
import { getTrainsResponse, Trein } from "../../../types/getTrainsResponse";
import { getTrainInfo } from "../../../helpers/trains/getTrainInfo";
import { TreinWithInfo } from "../../../types/getTrainsWithInfoResponse";
import { downloadAndSaveImage } from "../../../helpers/trains/downloadAndSaveImage";
import DB from "../../../lib/DB";
import getTrains from "../../../helpers/getTrains";

type Data = any;

const schema = z.object({
  latitude: z.string().transform(Number),
  longitude: z.string().transform(Number),
  radius: z.string().regex(/^\d+$/).transform(Number),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const data = schema.parse(req.query);

    if (Number.isNaN(data.latitude) || Number.isNaN(data.longitude)) {
      res.status(400).send("Invalid latitude or longitude");
    }

    const trainsRes = await getTrains();

    // const infos = await getTrainInfo(trainsRes.payload.treinen);
    const withInfo = await getTrainData(trainsRes.payload.treinen);

    const mapped = withInfo
      .map((t) => {
        const distance = getDistanceFromGPS({
          location1: { lat: data.latitude, lon: data.longitude },
          location2: { lat: t.lat, lon: t.lng },
        });
        // const info = infos.find((i) => i.ritnummer == t.treinNummer);
        return { ...t, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    const filtered = mapped.slice(0, 20);

    // const withInfo = await getTrainData()

    res.send(filtered);
  } catch (e) {
    res.status(400).send(e);
  }
}

async function getTrainData(treinen: Trein[]) {
  if (!treinen[0]) return [];
  const trainsInfo = await getTrainInfo(treinen);

  const treinenMetInfo: TreinWithInfo[] = [];

  for (const trein of treinen) {
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
  await DB.saveTrains(treinenMetInfo);
  return treinenMetInfo;
}
