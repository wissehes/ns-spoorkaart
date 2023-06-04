import { z } from "zod";
import { procedure, router } from "../trpc";
import { journeyRouter } from "./routes/journeyRouter";
import { stationRouter } from "./routes/stationRouter";
import { trainsRouter } from "./routes/trainsRouter";
import { savedRouter } from "./routes/savedRouter";

export const appRouter = router({
  trains: trainsRouter,
  journey: journeyRouter,
  station: stationRouter,
  saved: savedRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
