import type { ICallDetails } from "@airmeet/models";
import { getLeadCallKey } from "./keys";
import { getJson, setJson } from "./query";
import { redisConnection } from "../queues/redis";

async function saveLeadCalls(leadId : string, calls: ICallDetails[]){
    const key = getLeadCallKey(leadId);
    return setJson(key, {data: calls}, new Date(Date.now() + 3600000 )); // 1 hour
}


async function fetchLeadCalls(leadId : string){
    const key = getLeadCallKey(leadId);
    return getJson<ICallDetails[]>(key);
}

async function deleteLeadCalls(leadId : string){
    const key = getLeadCallKey(leadId);
    await redisConnection.del(key);
}

export default{
    saveLeadCalls,
    fetchLeadCalls,
    deleteLeadCalls
}