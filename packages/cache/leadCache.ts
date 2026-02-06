import type { ILead } from "@airmeet/models";
import { getLeadKey } from "./keys";
import { getJson, setJson } from "./query";
import { redisConnection } from "../queues/redis";


async function saveUserLeads(userId: string, lead: ILead[]) {
    const key = getLeadKey(userId);
    return setJson(key, { data: lead }, new Date(Date.now() + 3600000)); // 1 hour
}

async function fetchUserLeads(userId: string) {
    const key = getLeadKey(userId);
    return getJson<ILead[]>(key);
}

async function deleteUserLeads(userId: string) {
    const key = getLeadKey(userId);
    return redisConnection.del(key);
}

export default {
    saveUserLeads,
    fetchUserLeads,
    deleteUserLeads
}