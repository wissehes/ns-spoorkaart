import { TrainInfo, TrainPosition } from "@prisma/client";
import { SavedTrain, SavedTrains } from "../../types/SavedTrain";
import { TreinWithInfo } from "../../types/getTrainsWithInfoResponse";
import { prisma } from "../../lib/prisma";

export async function saveTrains(data: TreinWithInfo[]) {
  const trains: {
    materialId: number;
    info?: Omit<Omit<TrainInfo, "trainMaterialId">, "id">;
    position: {
      journeyId: string;
      lat: number;
      lng: number;
      speed: number;
      station: string | null;
    };
  }[] = [];

  /**
   * Format all trains in a way that is easier to store in
   * the database
   */

  for (const train of data) {
    for (const materieel of train.info?.materieeldelen || []) {
      if (materieel.materieelnummer == undefined) continue;
      if (trains.find((a) => a.materialId == materieel.materieelnummer)) {
        console.log(`Duplicate: [${materieel.materieelnummer}]`);
        continue;
      }

      const zitplaatsen = {
        zitplaatsEersteKlas: materieel.zitplaatsen?.zitplaatsEersteKlas || null,
        zitplaatsTweedeKlas: materieel.zitplaatsen?.zitplaatsTweedeKlas || null,
        klapstoelEersteKlas: materieel.zitplaatsen?.klapstoelEersteKlas || null,
        klapstoelTweedeKlas: materieel.zitplaatsen?.klapstoelTweedeKlas || null,
      };

      trains.push({
        materialId: materieel.materieelnummer,
        info: {
          type: materieel.type,
          facilities: materieel.faciliteiten,
          afbeelding: materieel.afbeelding,
          breedte: materieel.breedte,
          hoogte: materieel.hoogte,
          bakkenImg: materieel.bakken.map((b) => b.afbeelding.url),
          ...zitplaatsen,
        },
        position: {
          journeyId: train.ritId,
          lat: train.lat,
          lng: train.lng,
          speed: train.snelheid,
          station: train.info?.station || null,
        },
      });
    }
  }

  // Get all saved train id's
  const savedTrains = await prisma.train.findMany();

  // Filter all trains that don't exist in the db yet
  const newTrains = trains.filter(
    (t) => !savedTrains.find((s) => s.materialId == t.materialId)
  );

  if (newTrains.length) {
    console.log(`Found ${newTrains.length} new train(s)!`);
    await prisma.$transaction(
      newTrains.map((t) =>
        prisma.train.create({
          data: {
            materialId: t.materialId,
            info: { create: t.info },
          },
        })
      )
    );
  }

  await prisma.trainPosition.createMany({
    data: trains.map((a) => ({
      trainId: a.materialId,
      journeyId: a.position.journeyId,
      lat: a.position.lat,
      lng: a.position.lng,
      speed: a.position.speed,
      station: a.position.station,
    })),
  });
}
