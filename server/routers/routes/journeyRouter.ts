import { z } from "zod";
import NS from "../../../helpers/NS";
import { getTripPlannerResponse } from "../../../types/NS/journey/getTripPlannerResponse";
import { procedure, router } from "../../trpc";

export const journeyRouter = router({
  plan: procedure
    .input(
      z.object({
        fromStation: z.string(),
        toStation: z.string(),
        date: z.date().default(new Date()),
      })
    )
    .query(async ({ input }) => {
      const trip = await planTrip(input);
      return trip;
    }),
});

async function planTrip({
  fromStation,
  toStation,
  date,
}: {
  fromStation: string;
  toStation: string;
  date: Date;
}) {
  const { data } = await NS.get<getTripPlannerResponse>(
    "reisinformatie-api/api/v3/trips",
    {
      params: {
        fromStation,
        toStation,
        date: date.toISOString(),
      },
    }
  );

  return data;
}
