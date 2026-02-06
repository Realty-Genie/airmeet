import { redisConnection } from "@airmeet/queues";

export const setJson = async (key:string, value:object, expiresAt: Date | null = null) => {
    const json = JSON.stringify(value);
    if(expiresAt) {
        const ttlMs = expiresAt?.getTime() - Date.now();
        if (ttlMs > 0) {
            await redisConnection.set(key, json, "PX", ttlMs);
        }
    } else {
        await redisConnection.set(key, json);
    }
}

export const getJson = async<T>(key:string) => {
    const typeOfKey = await redisConnection.type(key);
    if(typeOfKey !== "string") return null;

    const json = await redisConnection.get(key);
    if(!json) return null;
    return JSON.parse(json) as T;
}