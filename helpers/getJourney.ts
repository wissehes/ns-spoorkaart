import {
  JourneyDetails,
  getJourneyDetailsResponse,
} from "../types/getJourneyDetailsResponse";
import NS from "./NS";
import getJourneyCode from "./NS/getJourneyCode";

/**
 * Fetch the journey for a given journey code.
 * @param journeyCode The code
 */
export default async function getJourney(journeyCode: string | number) {
  const { data } = await NS.get<getJourneyDetailsResponse>(
    "/reisinformatie-api/api/v2/journey",
    {
      params: { train: journeyCode },
    }
  );
  return data.payload;
}

/**
 * Fetch the journey for a given material number
 * @param materialNo The material number
 */
export async function getJourneyFromMaterial(materialNo: string | number) {
  try {
    const journeyCode = await getJourneyCode(materialNo);
    const journey = await getJourney(journeyCode);
    return journey;
  } catch {
    return null;
  }
}
