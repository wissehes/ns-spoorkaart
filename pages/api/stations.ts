import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import getStations from "../../helpers/getStations";
import {
  SmallStation,
  SmallStations,
  Station,
} from "../../types/getStationsResponse";

type Data = SmallStation[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const data = await getStations();

  const { stations } = new SmallStations(data.payload);

  res.status(200).json(stations);
}
