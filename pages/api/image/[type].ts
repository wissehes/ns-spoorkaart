// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { readFileSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import getTrains from "../../../helpers/getTrains";
import Redis from "../../../helpers/Redis";
import { TreinWithInfo } from "../../../types/getTrainsWithInfoResponse";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { type },
  } = req;

  if (typeof type !== "string") return res.status(400);

  const imageB64 = await Redis.get(type);
  if (!imageB64) {
    return res.redirect("/assets/train.png");
    // return res.status(404).send("404 not found");
  }

  const imageBuff = Buffer.from(imageB64, "base64");

  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": imageBuff.length,
  });

  res.end(imageBuff);
}
