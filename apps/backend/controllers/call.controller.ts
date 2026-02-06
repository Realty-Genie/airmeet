import { json, type Request, type Response } from "express";
import { RetellService } from '@airmeet/service';
import { Lead, Call, type ICallDetails } from '@airmeet/models'
import { queue } from '@airmeet/queues'
import { Types } from "mongoose";
import leadCache from "../../../packages/cache/leadCache.ts";
import callCache from "../../../packages/cache/callCache.ts";

interface CallRequest {
    name: string;
    phNo: string;
    email: string;
}

interface ScheduleCallRequest {
    name: string;
    phNo: string;
    email: string;
    delay: number;
}



interface ApiResponse {
    status: number,
    message: string,
    data: any
}

export class CallController {
    static async createCall(req: Request, res: Response) {

        const user = req.user;

        const creditsLeft = user.credits;

        if (creditsLeft <= 5) {
            return res.status(400).json({
                message: "Credits are less than 5, Please buy more credits to continue"
            })
        }

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const { name, phNo, email }: CallRequest = req.body;

        if (!phNo) {
            return res.status(400).json({
                message: "Phone number is required"
            })
        }

        // Agent ID (from .env)
        const agentId = process.env.AGENT_ID;
        if (!agentId) {
            return res.status(500).json({
                message: "Agent ID is not defined"
            })
        }

        let phoneCall;
        let lead;

        // Creating Dynamic variables for retell
        const dynamicVariables: any = {
            name, email, phone_number: phNo
            // Todo: add date and day context
        }

        // Database Finding or updating for storing the lead details
        try {
            lead = await Lead.findOne({ phNo: phNo });
            if (!lead) {
                const newLead = new Lead({
                    name, email, phNo: phNo, user: user._id
                })
                lead = await newLead.save();
                await leadCache.deleteUserLeads(user._id.toString());
                console.log(`New Lead created for ${phNo}`);
            } else {
                console.log(`Lead found for ${phNo}`);
            }
        } catch (e) {
            return res.status(500).json({
                message: `DB Error: ${e}`
            })
        }

        // Retell API CALL
        try {
            phoneCall = await RetellService.createPhoneCall({
                from_number: process.env.FROM_NUMBER,
                to_number: phNo,
                override_agent_id: agentId,
                retell_llm_dynamic_variables: dynamicVariables,
                metadata: {
                    leadId: lead?._id,
                    userId: user._id,
                    isBatchCallRecord: false,
                }
            })
        } catch (e) {
            console.error(`error Retell: ${e}`)
        }

        let newCall;

        // Creating new Call in DB
        try {
            newCall = new Call({
                callId: phoneCall?.call_id,
                status: phoneCall?.call_status,
                fromNumber: process.env.FROM_NUMBER,
                toNumber: phNo,
                leadId: lead?._id,
            });
            await newCall.save();
            await callCache.deleteLeadCalls(lead?._id.toString());
        } catch (e) {
            console.error(`failed to create call in database: ${e}`);
            return res.status(500).json({
                message: `DB updation failed`
            });
        }

        if (phoneCall) {
            return res.status(200).json({
                message: `Call created successfully callId : ${newCall._id}`,
                phoneCall,
            })
        }
    }

    static async scheduleCall(req: Request, res: Response) {
        const { name, phNo, email, delay }: ScheduleCallRequest = req.body;

        const delayMs = delay * 60 * 1000;

        const user = req.user;

        const creditsLeft = user.credits;

        if (creditsLeft <= 5) {
            return res.status(400).json({
                message: "Credits are less than 5, Please buy more credits to continue"
            })
        }

        if (!name || !delay || !phNo) {
            return res.status(400).json({
                message: "Missing required fields: name, phNo, delay"
            })
        }

        if (delay < 1) {
            return res.status(400).json({
                message: "Delay should be greater than or equal to 1"
            })
        }

        const agentId = process.env.AGENT_ID;
        if (!agentId) {
            return res.status(500).json({
                message: "Agent ID is not defined"
            })
        }
        const from_number = process.env.FROM_NUMBER;
        if (!from_number) {
            return res.status(500).json({
                message: "From number is not defined"
            })
        }

        const dynamicVariables: any = {
            name, email, phone_number: phNo
            // Todo: add date and day context
        }

        let lead;
        // Database Finding or updating for storing the lead details
        try {
            lead = await Lead.findOne({ phNo: phNo });
            if (!lead) {
                const newLead = new Lead({
                    name, email, phNo: phNo, user: req.user._id
                })
                lead = await newLead.save();
                console.log(`New Lead created for ${phNo}`);
                await leadCache.deleteUserLeads(user._id.toString());
            } else {
                console.log(`Lead found for ${phNo}`);
            }
        } catch (e) {
            return res.status(500).json({
                message: `DB Error: ${e}`
            })
        }
        // schedule the call on delay minutes in redis 

        // Metadata for retell
        const metadata = {
            leadId: lead?._id,
            userId: user._id,
            isBatchCallRecord: false,
        }

        const jobData = {
            metadata,
            from_number,
            agentId,
            dynamicVariables
        }
        const job = await queue.add('scheduled-call', jobData, { delay: delayMs, removeOnComplete: true });
        console.log(`Job created for ${phNo} and job created job: ${JSON.stringify(job)} with a delay of ${delayMs} mili secs`);
        return res.status(200).json({
            message: `Call scheduled successfully for ${phNo} and job created job: ${JSON.stringify(job)}`,
            jobId: job.id,
            delay_in_Ms: delayMs
        })
    }

    static async getCalls(req: Request, res: Response) {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const leadId = req.params.leadId;
        if (!leadId || typeof leadId !== 'string' || !Types.ObjectId.isValid(leadId)) {
            return res.status(400).json({
                message: "Invalid lead ID"
            })
        }
        const cachedCalls = await callCache.fetchLeadCalls(leadId);
        if (cachedCalls) {
            console.log("Calls fetched from cache");
            return res.status(200).json({
                message: "Calls fetched successfully",
                calls: cachedCalls
            })
        }
        const calls = await Call.find({ leadId: leadId });
        const callsOftheLead: ICallDetails[] = calls.map((call) => {
            return {
                callDBId: call._id as unknown as string,
                callId: call.callId,
                createdAt: call.createdAt,
                status: call.status,
                analysis: call.analysis || "",
                transcript: call.transcript || "transcript not available",
                recordingUrl: call.recordingUrl || "recording not available",
                durationMs: call.durationMs || 200,
                fromNumber: call.fromNumber,
                toNumber: call.toNumber,
            }
        });
        await callCache.saveLeadCalls(leadId, callsOftheLead);
        console.log("Calls fetched from DB");
        return res.status(200).json({
            message: "Calls found",
            callsOftheLead
        })
    }

    static async createBatchCall(req: Request, res: Response) {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "Unauthorized",
                data: ""
            })
        }

        const { leads }: { leads: CallRequest[] } = req.body;

        if (!leads) {
            return res.status(400).json({
                status: 400,
                message: "Leads are required",
                data: ""
            } as ApiResponse)
        }

        if (!leads || !Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "leads (non-empty array) are required",
                data: ""
            } as ApiResponse);
        }

        const creditsLeft = user.credits;

        const approaxCreditsReq = leads.length * 4;
        if (creditsLeft <= approaxCreditsReq) {
            return res.status(400).json({
                status: 400,
                message: `Insufficient Credits for calling all leads, Please buy more credits to continue`,
                data: ""
            } as ApiResponse)
        }

        const agentId = process.env.AGENT_ID;
        if (!agentId) {
            return res.status(500).json({
                status: 500,
                message: "Agent ID is not defined",
                data: ""
            } as ApiResponse)
        }
        const from_number = process.env.FROM_NUMBER;
        if (!from_number) {
            return res.status(500).json({
                status: 500,
                message: "From number is not defined",
                data: ""
            } as ApiResponse)
        }

        const validLeads = leads.filter(l => l.phNo);
        const phNos = validLeads.map(l => l.phNo);

        let existingLeads = [];
        try {
            existingLeads = await Lead.find({ phNo: { $in: phNos }, user: user._id });
        } catch (error) {
            console.error("Database error fetching existing leads:", error);
            return res.status(500).json({
                status: 500,
                message: "Database error fetching existing leads",
                data: ""
            } as ApiResponse);
        }

        const existingLeadsMap = new Map(existingLeads.map(l => [l.phNo, l]));
        const newLeadsToInsert = [];
        const bulkUpdates = [];

        for (const leadData of validLeads) {
            const { name, email, phNo } = leadData;
            const existingLead = existingLeadsMap.get(phNo);

            if (existingLead) {
                let needsUpdate = false;
                const existingEmail = existingLead.email;
                if (!existingEmail) {
                    existingLead.email = email;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    bulkUpdates.push({
                        updateOne: {
                            filter: { _id: existingLead._id },
                            update: { $set: { email } }
                        }
                    });
                }
            } else {
                newLeadsToInsert.push({
                    name,
                    email,
                    phNo,
                    user: user._id
                });
            }
        }

        let createdLeads: any[] = [];
        if (newLeadsToInsert.length > 0) {
            try {
                createdLeads = await Lead.insertMany(newLeadsToInsert);
                const deletedCachedData = await leadCache.deleteUserLeads(user._id.toString());
                if (deletedCachedData == 1) {
                    console.log(`Deleted data from Cache`);
                } else {
                    console.log(`Cache Miss no data deleted`);
                }
            } catch (error) {
                console.error("Database error bulk inserting new leads:", error);
                return res.status(500).json({
                    status: 500,
                    message: "Database error creating new leads",
                    data: ""
                } as ApiResponse);
            }
        }

        if (bulkUpdates.length > 0) {
            try {
                await Lead.bulkWrite(bulkUpdates);
                const deletedCachedData = await leadCache.deleteUserLeads(user._id.toString());
                let deleteCacheResult;
                if (deletedCachedData === 1) {
                    deleteCacheResult = "true";
                } else {
                    deleteCacheResult = "no deletions as no cache found";
                }
                console.log(`Deleted data: ${deleteCacheResult}`);
            } catch (error) {
                console.error("Database error bulk updating leads:", error);
            }
        }

        const finalLeadsMap = new Map(existingLeadsMap);
        createdLeads.forEach(l => finalLeadsMap.set(l.phNo, l));

        const tasks = [];
        for (const leadData of validLeads) {
            const { name, email, phNo } = leadData;
            const lead = finalLeadsMap.get(phNo);

            if (!lead) continue;

            const dynamicVariables: any = {
                name,
                email,
                phone_number: phNo,
            };

            tasks.push({
                to_number: phNo,
                override_agent_id: agentId,
                metadata: {
                    agentId: agentId,
                    leadId: lead._id,
                    userId: user._id,
                    isBatchCallRecord: true,
                },
                retell_llm_dynamic_variables: dynamicVariables
            });
        }
        let batchCallResponse;
        try {
            batchCallResponse = await RetellService.createBatchCall({
                from_number,
                tasks
            });
        } catch (error) {
            console.error("Retell API error creating batch call:", error);
            return res.status(500).json({
                status: 500,
                message: "Failed to create batch call with Retell",
                data: ""
            } as ApiResponse)
        }

        return res.status(200).json({
            status: 200,
            message: `Batch Call created successfully for ${leads.length} leads`,
            data: batchCallResponse
        } as ApiResponse)
    }
}