// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import getTrains from "../../helpers/getTrains";
import { getTrainsResponse, Trein } from "../../types/getTrainsResponse";

type Data = Trein[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const data = await getTrains();

  res.status(200).json(data.payload.treinen);
}
