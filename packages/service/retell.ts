import  Retell from "retell-sdk";
const Retell_API_KEY = process.env.RETELL_API_KEY;

if(!Retell_API_KEY) {
    throw new Error("RETELL_API_KEY is not defined");
}

const retellClient = new Retell({apiKey: Retell_API_KEY});


export class RetellService {
    static async createPhoneCall(params: any){
        return await retellClient.call.createPhoneCall(params);
    }
    static async getCallDetails(callId: string){
        return await retellClient.call.retrieve(callId);
    }
}