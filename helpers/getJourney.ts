import { getJourneyDetailsResponse } from "../types/getJourneyDetailsResponse";
import NS from "./NS";

export default async function getJourney(train: string) {
  const { data } = await NS.get<getJourneyDetailsResponse>(
    "/reisinformatie-api/api/v2/journey",
    {
      params: { train },
    }
  );
  return data.payload;
}
