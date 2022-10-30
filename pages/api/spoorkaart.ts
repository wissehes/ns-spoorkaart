import type { NextApiRequest, NextApiResponse } from "next";
import NS from "../../helpers/NS";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { data } = await NS.get("/Spoorkaart-API/api/v1/spoorkaart");

  res.status(200).json(data);
}
