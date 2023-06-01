/**
 * This mechanism first filters all trains, to make sure the material parts exist,
 * then we check if the images already exist. If they don't, then we're looping over
 * every train and download, resize and remove the background of every image. Lastly,
 * we save the image (usually around 3kb) to Redis.
 */

import Jimp from "jimp";
import DB from "../../lib/DB";
import { TreinWithInfo } from "../../types/getTrainsWithInfoResponse";
// @ts-ignore - because replace-color doesn't have ts declarations
import replaceColor from "replace-color";

export async function downloadAndSaveImage(trains: TreinWithInfo[]) {
  // Get all images
  const allImages = await DB.allImages();

  // Create an array for the trains that have
  // been saved by this script, so that we don't
  // have to call `DB.allImages()` every iteration.
  let savedTrains: string[] = [];

  //Loop through all trains passed to this function
  for (const train of trains) {
    // Filter out all objects without the necessary data
    if (!train.info) continue;

    // Loop through every material part to also
    // fetch icons if different types of trains are
    // grouped together.
    for (const mat of train.info.materieeldelen) {
      // const mat = train.info.materieeldelen[0];
      const url = mat?.bakken[0]?.afbeelding?.url ?? mat?.afbeelding;

      if (!mat || !url) continue;

      // Filter out all objects that are already downloaded
      if (
        allImages?.find((i) => i.type == mat.type) ||
        savedTrains.includes(mat.type)
      )
        continue;

      // Download the image and resize it
      // to a smaller image
      const img = (await Jimp.read(url))
        .resize(Jimp.AUTO, 50)
        .crop(0, 0, 100, 50);
      if (img.hasAlpha()) {
        img.rgba(true).background(0x000000ff);
      }

      // Replace the white background with a transparent background
      const imgBuffer = await img.getBufferAsync(Jimp.MIME_PNG);
      const imgReplaced = await replaceColor({
        image: imgBuffer,
        colors: {
          type: "hex",
          targetColor: "#ffffff",
          replaceColor: "#00000000",
        },
      });

      // Get the buffer and convert it to base64
      const imgReplacedBuffer = await imgReplaced.getBufferAsync(Jimp.MIME_PNG);
      const base64 = Buffer.from(imgReplacedBuffer, "binary").toString(
        "base64"
      );

      // Save it
      await DB.saveTrainImg({ type: mat.type, base64data: base64 });
      savedTrains.push(mat.type);
    }
  }
}
