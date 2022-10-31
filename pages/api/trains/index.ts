// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import getTrains from "../../../helpers/getTrains";
import NS from "../../../helpers/NS";
import Redis from "../../../helpers/Redis";
import { getMultipleTrainsInfoResponse } from "../../../types/getTrainInfoResponse";
import { getTrainsResponse, Trein } from "../../../types/getTrainsResponse";
import { TreinWithInfo } from "../../../types/getTrainsWithInfoResponse";

import Jimp from "jimp";
// @ts-ignore
import replaceColor from "replace-color";

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

  res.status(200).json(treinenMetInfo);
}

/**
 * This mechanism first filters all trains, to make sure the material parts exist,
 * then we check if the images already exist. If they don't, then we're looping over
 * every train and download, resize and remove the background of every image. Lastly,
 * we save the image (usually around 3kb) to Redis.
 */

async function downloadAndSaveImage(trains: TreinWithInfo[]) {
  const filtered = trains.filter((t) => t.info?.materieeldelen[0]);

  const exists = await Redis.exists(
    filtered.map((t) => t.info?.materieeldelen[0].type || "")
  );
  if (exists == filtered.length) {
    return;
  }

  for (const train of trains) {
    if (!train.info) continue;

    const mat = train.info.materieeldelen[0];
    const url = mat.bakken[0]?.afbeelding?.url;
    if (!mat || !url) continue;

    const exists = await Redis.exists(mat.type);
    if (exists) {
      continue;
    }

    // const { data } = await NS.get(url, { responseType: "arraybuffer" });

    const img = (await Jimp.read(url))
      .resize(Jimp.AUTO, 50)
      .crop(0, 0, 100, 50);
    if (img.hasAlpha()) {
      img.rgba(true).background(0x000000ff);
    }

    const imgBuffer = await img.getBufferAsync(Jimp.MIME_PNG);
    const imgReplaced = await replaceColor({
      image: imgBuffer,
      colors: {
        type: "hex",
        targetColor: "#ffffff",
        replaceColor: "#00000000",
      },
    });
    // console.log(imgReplaced);
    const imgReplacedBuffer = await imgReplaced.getBufferAsync(Jimp.MIME_PNG);

    const base64 = Buffer.from(imgReplacedBuffer, "binary").toString("base64");

    await Redis.set(mat.type, base64);
  }
}

async function getTrainInfo(trains: Trein[]) {
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
