import type { NextApiRequest, NextApiResponse } from "next";
import NS from "../../../helpers/NS";
import { getArrivalsResponse } from "../../../types/getArrivalsResponse";
import { getDeparturesResponse } from "../../../types/getDeparturesResponse";
import { StationInfoResponse } from "../../../types/getStationInfoResponse";

// type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StationInfoResponse>
) {
  const {
    query: { code },
  } = req;

  const departures = await getDepartures(code as string);
  const arrivals = await getArrivals(code as string);

  res.json({
    departures,
    arrivals,
  });
}

async function getDepartures(code: String) {
  const { data } = await NS.get<getDeparturesResponse>(
    "/reisinformatie-api/api/v2/departures",
    {
      params: { station: code },
    }
  );
  return data.payload.departures;
}

async function getArrivals(code: String) {
  const { data } = await NS.get<getArrivalsResponse>(
    "/reisinformatie-api/api/v2/arrivals",
    {
      params: { station: code },
    }
  );
  return data.payload.arrivals;
}
