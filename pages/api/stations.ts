import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import getStations from "../../helpers/getStations";
import { Station } from "../../types/getStationsResponse";

type Data = Station[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const data = await getStations();

  res.status(200).json(data.payload);
}
