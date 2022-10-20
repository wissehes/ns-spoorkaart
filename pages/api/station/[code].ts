import type { NextApiRequest, NextApiResponse } from "next";
import NS from "../../../helpers/NS";
import { getArrivalsResponse } from "../../../types/getArrivalsResponse";
import { getDeparturesResponse } from "../../../types/getDeparturesResponse";
import { StationInfoResponse } from "../../../types/getStationInfoResponse";

import { getDepartures, getArrivals } from "../../../helpers/stationHelpers";

// type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StationInfoResponse>
) {
  const {
    query: { code },
  } = req;

  const departures = await getDepartures(code as string, 3);
  const arrivals = await getArrivals(code as string);

  res.json({
    departures,
    arrivals,
  });
}
