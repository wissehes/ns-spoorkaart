import { z } from "zod";
import { procedure, router } from "../trpc";
import { journeyRouter } from "./routes/journeyRouter";
import { stationRouter } from "./routes/stationRouter";
import { trainsRouter } from "./routes/trainsRouter";

export const appRouter = router({
  trains: trainsRouter,
  journey: journeyRouter,
  station: stationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
