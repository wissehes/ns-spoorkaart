import { createClient, RedisClientType } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.error("[REDIS] Redis Client Error", err));
redis.on("connect", () => console.log("[REDIS] Connected!"));
redis.connect();

export default redis;
