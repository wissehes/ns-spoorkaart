import { procedure, router } from "../../trpc";

import DB from "../../../lib/DB";
import { RedisStations } from "../../../types/RedisStations";

import getStations from "../../../helpers/getStations";
import { SmallStations } from "../../../types/getStationsResponse";
import { RedisJSON } from "@redis/json/dist/commands";
import { z } from "zod";
import { getDepartures } from "../../../helpers/stationHelpers";
import { DepartureWithJourney } from "../../../types/DepartureWithJourney";
import getJourney from "../../../helpers/getJourney";
import { TRPCError } from "@trpc/server";

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

  departures: procedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const stations = await getStations();
      const foundStation = stations.payload.find(
        (s) => s.code == input.code.toUpperCase() || s.UICCode == input.code
      );

      if (!foundStation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Station not found.",
        });
      }

      const departures = await getDepartures(input.code, 10);

      const departuresWithTripInfo: DepartureWithJourney[] = [];

      for (const d of departures) {
        try {
          const journey = await getJourney(d.product.number);

          const foundStop = journey.stops.find(
            (s) => s.stop.uicCode == foundStation.UICCode
          );

          departuresWithTripInfo.push({
            departure: d,
            stop: foundStop,
          });
        } catch (e) {
          console.log(`[TRAINS] Fetching journey ${d.product.number} failed.`);
          departuresWithTripInfo.push({
            departure: d,
          });
        }
      }

      return departuresWithTripInfo;
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
