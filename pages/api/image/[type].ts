// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import DB from "../../../lib/DB";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { type },
  } = req;

  if (typeof type !== "string") return res.status(400);

  const image = await DB.getTrainImg(type);
  if (!image) {
    return res.redirect("/assets/train.png");
    // return res.status(404).send("404 not found");
  }

  const imageBuff = Buffer.from(image.base64, "base64");

  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": imageBuff.length,
  });

  res.end(imageBuff);
}
