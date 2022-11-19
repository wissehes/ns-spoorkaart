import { procedure, router } from "../../trpc";

import DB from "../../../lib/DB";
import { RedisStations } from "../../../types/RedisStations";

import getStations from "../../../helpers/getStations";
import { SmallStations } from "../../../types/getStationsResponse";
import { RedisJSON } from "@redis/json/dist/commands";
import { z } from "zod";

export const stationRouter = router({
  all: procedure.query(async () => {
    const stations = await getStationsFromDB();

    return stations;
  }),
  search: procedure.input(z.string()).query(async ({ input }) => {
    const stations = await getStationsFromDB();
    const lInput = input.toLowerCase();

    return stations.filter(
      (s) =>
        s.code.toLowerCase().includes(lInput) ||
        s.namen.lang.toLowerCase().includes(lInput)
    );
  }),
});

async function getStationsFromDB() {
  const foundRedisData = (await DB.client.json.get(
    "stations"
  )) as unknown as RedisStations;

  if (foundRedisData) {
    return foundRedisData.stations;
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

  await DB.client.json.set("stations", "$", redisData as unknown as RedisJSON);
  return stations;
}
