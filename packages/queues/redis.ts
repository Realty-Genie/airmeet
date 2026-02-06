import IORedis from "ioredis";

export const redisConnection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy(times) {
    return Math.min(times * 200, 5000);
  },
});

redisConnection.on("connect", () => console.log("Redis connected"));
redisConnection.on("ready", () => console.log("Redis ready"));
redisConnection.on("reconnecting", () => console.log("Redis reconnecting"));
redisConnection.on("end", () => console.log("Redis disconnected"));
redisConnection.on("error", (err) =>
  console.log("Redis connection error", err)
);

export async function connectRedis() {
  if (redisConnection.status === "wait") {
    await redisConnection.connect();
  }
}

export async function disconnectRedis() {
  await redisConnection.quit();
}
