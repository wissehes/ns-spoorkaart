import { TreinWithInfo } from "../types/getTrainsWithInfoResponse";
import { SavedTrains, SavedTrain } from "../types/SavedTrain";
import Redis from "./redis";

export class DBClient {
  private TRAINIMG = "trainimages";
  private TRAINDATA = "traindata";
  private LASTTRAINSAVED = "trainsaved";

  public async saveTrainImg({
    type,
    base64data,
  }: {
    type: string;
    base64data: string;
  }) {
    const exists = await Redis.exists(this.TRAINIMG);
    if (!exists) {
      await this.client.json.set(this.TRAINIMG, "$", { images: [] });
    }

    await Redis.json.arrAppend(this.TRAINIMG, "$.images", {
      base64: base64data,
      type,
    });
  }

  public async allImages() {
    const data = (await this.client.json.get(this.TRAINIMG, {
      path: "$",
    })) as GetTrainImagesRedis | null;

    return data?.[0]?.images;
  }

  public async getTrainImg(type: string) {
    const data = await this.allImages();
    if (!data) return null;
    return data?.find((t) => t.type === type) || null;
  }

  public async trainImgExists(type: string) {
    const found = await this.getTrainImg(type);
    return !!found;
  }
  public async imageArrayExists() {
    return await this.client.exists(this.TRAINIMG);
  }

  public async lastSavedDate() {
    const date = await Redis.get(this.LASTTRAINSAVED);
    return date ? Number(date) : null;
  }

  public async setSavedNow() {
    await Redis.set(this.LASTTRAINSAVED, Date.now());
  }

  client = Redis;
}

const DB = new DBClient();

export default DB;

type GetTrainImagesRedis = { images: { base64: string; type: string }[] }[];

type GetTrainData = { data: SavedTrains[] };
