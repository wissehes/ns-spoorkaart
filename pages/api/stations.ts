import { RedisJSON } from "@redis/json/dist/commands";
import type { NextApiRequest, NextApiResponse } from "next";

import getStations from "../../helpers/getStations";
import Redis from "../../lib/redis";
import { SmallStation, SmallStations } from "../../types/getStationsResponse";
import { RedisStations } from "../../types/RedisStations";

type Data = SmallStation[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const foundRedisData = (await Redis.json.get(
    "stations"
  )) as unknown as RedisStations;

  if (foundRedisData) {
    return res.json(foundRedisData.stations);
  }

  const data = await getStations();
  const { stations } = new SmallStations(
    data.payload
    //.filter((s) => s.land == "NL")
  );

  const redisData: RedisStations = {
    stations,
    saveDate: new Date(),
  };

  await Redis.json.set("stations", "$", redisData as unknown as RedisJSON);

  res.status(200).json(stations);
}
