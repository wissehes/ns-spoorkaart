// Important stuff
import { z } from "zod";
import { router, procedure } from "../../trpc";
// Types/methods
import getTrains from "../../../helpers/getTrains";
import { TreinWithInfo } from "../../../types/getTrainsWithInfoResponse";
import { getTrainInfo } from "../../../helpers/trains/getTrainInfo";
// Database
import DB from "../../../lib/DB";
// Other deps
import Jimp from "jimp";
// @ts-ignore - because replace-color doesn't have ts declarations
import replaceColor from "replace-color";

export const trainsRouter = router({
  getTrains: procedure.query(async () => {
    const data = await getTrains();
    const trainsInfo = await getTrainInfo(data.payload.treinen);

    const treinenMetInfo: TreinWithInfo[] = [];

    for (const trein of data.payload.treinen) {
      const foundInfo = trainsInfo.find(
        (a) => a.ritnummer == trein.treinNummer
      );
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
    return {
      trains: treinenMetInfo,
    };
  }),
});

/**
 * This mechanism first filters all trains, to make sure the material parts exist,
 * then we check if the images already exist. If they don't, then we're looping over
 * every train and download, resize and remove the background of every image. Lastly,
 * we save the image (usually around 3kb) to Redis.
 */

async function downloadAndSaveImage(trains: TreinWithInfo[]) {
  const exists = await DB.imageArrayExists();
  if (exists) {
    return;
  }

  for (const train of trains) {
    if (!train.info) continue;

    const mat = train.info.materieeldelen[0];
    const url = mat?.bakken[0]?.afbeelding?.url;
    if (!mat || !url) continue;

    const exists = await DB.trainImgExists(mat.type);
    if (exists) {
      continue;
    }

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

    const imgReplacedBuffer = await imgReplaced.getBufferAsync(Jimp.MIME_PNG);
    const base64 = Buffer.from(imgReplacedBuffer, "binary").toString("base64");

    await DB.saveTrainImg({ type: mat.type, base64data: base64 });
  }
}
