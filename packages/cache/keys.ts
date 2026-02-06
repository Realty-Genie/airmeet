export enum DynamicKeys{
    LEAD='LEAD',
    LEAD_CALL='LEAD_CALL'
}

function getDynamicKey(Key: DynamicKeys, id:string){
    return `${Key}:${id}`;
}

export const getLeadKey = (userId:string) => {
    return getDynamicKey(DynamicKeys.LEAD, userId);
}

export const getLeadCallKey = (leadId:string) => {
    return getDynamicKey(DynamicKeys.LEAD_CALL, leadId);
}

