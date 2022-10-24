// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import getTrainInformation from "../../../../helpers/getTrainInformation";
import NS from "../../../../helpers/NS";
import { getTrainInfoResponse } from "../../../../types/getTrainInfoResponse";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { train, station },
  } = req;

  const data = await getTrainInformation(train as string, station as string);

  res.status(200).json(data);
}
