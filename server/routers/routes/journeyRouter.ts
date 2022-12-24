import { TRPCError } from "@trpc/server";
import { AxiosError } from "axios";
import { z } from "zod";
import NS from "../../../helpers/NS";
import { getJourneyDetailsResponse } from "../../../types/getJourneyDetailsResponse";
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
  journey: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data } = await NS.get<getJourneyDetailsResponse>(
        "/reisinformatie-api/api/v2/journey",
        {
          params: { train: input.id },
        }
      );
      return data.payload;
    }),
  trainNumber: procedure.input(z.string()).query(async ({ input }) => {
    try {
      const { data } = await NS.get<number>(
        `/virtual-train-api/api/v1/ritnummer/${input}`
      );

      const { data: journey } = await NS.get<getJourneyDetailsResponse>(
        "/reisinformatie-api/api/v2/journey",
        {
          params: { train: data },
        }
      );

      return journey.payload;
    } catch (e) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Geen trein gevonden met dat nummer.",
        cause: e,
      });
    }
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
