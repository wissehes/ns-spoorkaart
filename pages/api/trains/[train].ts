// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import NS from "../../../helpers/NS";
import { getJourneyDetailsResponse } from "../../../types/getJourneyDetailsResponse";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { train },
  } = req;
  try {
    const { data } = await NS.get<getJourneyDetailsResponse>(
      "/reisinformatie-api/api/v2/journey",
      {
        params: { train },
      }
    );

    res.status(200).json(data.payload);
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: "not found" });
  }
}
