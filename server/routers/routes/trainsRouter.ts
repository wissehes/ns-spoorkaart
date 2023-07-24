// Important stuff
import { z } from "zod";
import { router, procedure } from "../../trpc";
// Types
import { TreinWithInfo } from "../../../types/getTrainsWithInfoResponse";
import { getTrainInfo } from "../../../helpers/trains/getTrainInfo";
import { JourneyDetails } from "../../../types/getJourneyDetailsResponse";
import { Trein } from "../../../types/getTrainsResponse";

// Methods
import getTrains from "../../../helpers/getTrains";
import getDistanceFromGPS from "../../../helpers/getDistanceFromGPS";
import { saveTrains } from "../../../helpers/trains/saveTrains";
import { downloadAndSaveImage } from "../../../helpers/trains/downloadAndSaveImage";
import { TRPCError } from "@trpc/server";

type TrainWithInfoAndDistance = TreinWithInfo & { distance: number };
type TrainAndJourney = {
  train: TrainWithInfoAndDistance;
  journey?: JourneyDetails;
};

export const trainsRouter = router({
  /**
   * Get all live trains and their info (material info, etc...)
   */
  getTrains: procedure.query(async () => {
    const data = await getTrains();
    const treinenMetInfo = await getTrainData(data.payload.treinen);
    return treinenMetInfo;
  }),

  /**
   * Get a single train by material ID and its info (material info, etc...)
   */
  getTrain: procedure
    .input(z.object({ materialId: z.number() }))
    .query(async ({ input }) => {
      const _trains = await getTrains();
      const _thisTrain = _trains.payload.treinen.find((t) =>
        t.materieel?.includes(input.materialId)
      );
      const trains = await getTrainData(
        _thisTrain ? [_thisTrain] : _trains.payload.treinen
      );

      const thisTrain = trains.find((t) =>
        t.materieel?.find((m) => m == input.materialId)
      );

      if (!thisTrain) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Train not found" });
      }

      return thisTrain;
    }),

  /**
   * Get nearby trains based on coordinates and radius
   */
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

      const withInfo = (await getTrainData(filtered.slice(0, 5))).map((t) => {
        const distance = filtered.find((a) => a.ritId == t.ritId)?.distance;
        return { ...t, distance };
      });

      // const trainsWithJourney = await getJourneys(withInfo);

      return withInfo;
    }),

  paginated: procedure
    .input(
      z.object({
        page: z.number().optional(),
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

      const thisPage = page ? paginated[page - 1] || [] : filtered;

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
  await saveTrains(treinenMetInfo);
  return treinenMetInfo;
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
