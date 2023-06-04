import { prisma } from "../../../lib/prisma";
import { procedure, router } from "../../trpc";

export const savedRouter = router({
  all: procedure.query(() =>
    prisma.train.findMany({
      select: {
        info: {
          select: {
            afbeelding: true,
            bakkenImg: true,
            type: true,
          },
        },
        positions: { orderBy: { date: "desc" }, take: 1 },
        materialId: true,
      },
      orderBy: { info: { type: "asc" } },
    })
  ),
});
