// Important stuff
import { z } from "zod";
import { router, procedure } from "../../trpc";
// Types/methods
import getTrains from "../../../helpers/getTrains";
import { TreinWithInfo } from "../../../types/getTrainsWithInfoResponse";
import { getTrainInfo } from "../../../helpers/trains/getTrainInfo";
import getDistanceFromGPS from "../../../helpers/getDistanceFromGPS";
// Database
import DB from "../../../lib/DB";
// Other deps
import Jimp from "jimp";
// @ts-ignore - because replace-color doesn't have ts declarations
import replaceColor from "replace-color";
import { Trein } from "../../../types/getTrainsResponse";

export const trainsRouter = router({
  getTrains: procedure.query(async () => {
    const data = await getTrains();
    const treinenMetInfo = await getTrainData(data.payload.treinen);
    return treinenMetInfo;
  }),
  nearbyTrains: procedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number().min(50).max(1000),
      })
    )
    .query(async ({ input }) => {
      const trains = await getTrains();

      const filtered = trains.payload.treinen.map((t) => {
        const distance = getDistanceFromGPS({
          location1: { lat: input.latitude, lon: input.longitude },
          location2: { lat: t.lat, lon: t.lng },
        });
        return { ...t, distance };
      });

      filtered.sort((a, b) => a.distance - b.distance);

      const withInfo = await getTrainData(filtered);

      return withInfo.map((t) => {
        const distance = filtered.find((a) => a.ritId == t.ritId)?.distance;
        return { ...t, distance };
      });
    }),
  paginated: procedure
    .input(
      z.object({
        page: z.number(),
        itemsPerPage: z.number(),
        search: z.string().nullish(),
      })
    )
    .query(async ({ input: { page, itemsPerPage, search } }) => {
      const {
        payload: { treinen },
      } = await getTrains();
      const trains = await getTrainData(treinen);

      const filtered = search
        ? trains.filter((t) => filterFunction(t, search || ""))
        : trains;

      const paginated: TreinWithInfo[][] = [];

      for (let i = 0; i < filtered.length; i += itemsPerPage) {
        paginated.push(filtered.slice(i, i + itemsPerPage));
      }

      const thisPage = paginated[page - 1] || [];

      return {
        items: thisPage,
        pages: paginated.length,
      };
    }),
});

const filterFunction = (t: TreinWithInfo, searchValue: string) => {
  return (
    t.type.toLowerCase().includes(searchValue) ||
    t.treinNummer.toString().includes(searchValue) ||
    t.info?.vervoerder.toLowerCase().includes(searchValue) ||
    t.info?.materieeldelen.find(
      (s) =>
        s.materieelnummer?.toString().includes(searchValue) ||
        s.type.toLowerCase().includes(searchValue)
    ) ||
    t.info?.station.includes(searchValue)
  );
};

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
