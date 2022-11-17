import { createClient } from "redis";
import { TreinWithInfo } from "../types/getTrainsWithInfoResponse";
import { SavedTrains, SavedTrain } from "../types/SavedTrain";

export class DBClient {
  constructor() {
    this.connectRedis();
  }

  private connectRedis() {
    this.client.on("error", (err) =>
      console.error("[REDIS] Redis Client Error", err)
    );
    this.client.on("connect", () => console.log("[REDIS] Connected!"));
    this.client.connect();
  }

  private TRAINIMG = "trainimages";
  private TRAINDATA = "traindata";

  public async saveTrainImg({
    type,
    base64data,
  }: {
    type: string;
    base64data: string;
  }) {
    if (!(await this.client.exists(this.TRAINIMG))) {
      await this.client.json.set(this.TRAINIMG, "$", { images: [] });
    }

    await this.client.json.arrAppend(this.TRAINIMG, "$.images", {
      base64: base64data,
      type,
    });
  }

  public async getTrainImg(type: string) {
    const data = (await this.client.json.get(this.TRAINIMG, {
      path: "$",
    })) as GetTrainImagesRedis;

    if (!data) return null;
    return data[0]?.images?.find((t) => t.type === type) || null;
  }

  public async trainImgExists(type: string) {
    const found = await this.getTrainImg(type);
    return !!found;
  }
  public async imageArrayExists() {
    return await this.client.exists(this.TRAINIMG);
  }

  public async saveTrains(trains: TreinWithInfo[]) {
    const date = new Date();
    const data: SavedTrains = {
      trains: {},
      date: date,
    };

    for (const train of trains) {
      for (const materieel of train.materieel || []) {
        const trainData: SavedTrain = {
          id: materieel,
          lat: train.lat,
          lng: train.lng,
          ritId: train.ritId,
          snelheid: train.snelheid,
          station: train.info?.station,
          info:
            train.info?.materieeldelen.find(
              (m) => m.materieelnummer == materieel
            ) || null,
          date,
        };
        data.trains[materieel] = trainData;
      }
    }
    if (Object.keys(data.trains).length == 0) return;

    if (!(await this.client.exists(this.TRAINDATA))) {
      await this.client.json.set(this.TRAINDATA, "$", { data: [] });
    } else {
      const date = (await this.client.json.get(this.TRAINDATA, {
        path: `$.data.*.date`,
      })) as string[];
      const lastDate = date?.pop();
      if (lastDate) {
        const dateObj = new Date(lastDate);
        // If the time of the last save plus 5 seconds is not bigger than now, return.
        if (dateObj.getTime() + 5000 > new Date().getTime()) return;
      }
    }

    await this.client.json.arrAppend(this.TRAINDATA, "$.data", data);
  }

  public async getTrain(materieel: number) {
    const found =
      (await this.client.json.get(this.TRAINDATA, {
        path: `$.data.*.trains.${materieel}`,
      })) || [];

    return found as SavedTrain[];
  }

  client = createClient({
    url: process.env.REDIS_URL,
  });
}

const DB = new DBClient();

export default DB;

type GetTrainImagesRedis = { images: { base64: string; type: string }[] }[];

type GetTrainData = { data: SavedTrains[] };
