import { createClient } from "redis";

const Redis = createClient({
  url: process.env.REDIS_URL,
});

Redis.on("error", (err) => console.error("[REDIS] Redis Client Error", err));
Redis.on("connect", () => console.log("[REDIS] Connected!"));
Redis.connect();

export default Redis;
