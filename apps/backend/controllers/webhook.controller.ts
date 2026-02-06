import type { Request, Response } from "express";
import { Call, Lead, User } from "@airmeet/models";
import { queue } from "@airmeet/queues";
import callCache from "../../../packages/cache/callCache.ts";


interface RetellWebhookBody {
    event: string;
    call: {
        call_id: string;
        call_status: string;
        from_number: string;
        to_number: string;
        agent_id: string;
        call_analysis: any;
        metadata: any;
        transcript: string;
        recording_url: string;
        duration_ms: number;
        retell_llm_dynamic_variables: any;
    };
}

export class WebhookController {
    static async handleRetellWebhook(req: Request, res: Response) {
        console.log("Webhook received");
        try {
            const { event, call } = req.body as RetellWebhookBody;
            const call_id = call?.call_id;
            const call_analysis = call?.call_analysis;
            const metadata = call?.metadata;
            const isBatchCallRecord = metadata?.isBatchCallRecord;

            if (event === "call_started") {
                if (isBatchCallRecord) {
                    const newCall = new Call({
                        callId: call_id,
                        status: call?.call_status,
                        fromNumber: call?.from_number,
                        toNumber: call?.to_number!,
                        leadId: metadata?.leadId,
                        userId: metadata?.userId,
                    });
                    await newCall.save();
                    await callCache.deleteLeadCalls(metadata?.leadId);
                    console.log("Call Record created for batch call record for lead " + call?.to_number);
                    return res.status(200).json({ message: "Call Record created for batch call record for lead " + call?.to_number });
                }
            }
            if (event !== "call_analyzed") {
                return res.status(200).json({ message: "Event ignored" });
            }

            if (!call_id || !call_analysis) {
                return res.status(400).json({ message: "Invalid payload" });
            }





            const scheduleStatus = call_analysis?.custom_analysis_data?.need_scheduling;
            console.log("scheduleStatus", scheduleStatus);
            // console.log("typeof scheduleStatus", typeof scheduleStatus);
            const needScheduling = ((typeof scheduleStatus === 'boolean' && scheduleStatus === true) || (typeof scheduleStatus === 'string' && scheduleStatus.toLowerCase() === "true")) ? true : false;
            console.log("needScheduling", needScheduling);
            let leadId;

            leadId = metadata?.leadId;
            const userId = metadata?.userId;
            const user = await User.findById(userId);
            if (user) {
                const totalMinsLeftInMs = user.credits * 60 * 1000;
                const updatedCredits = totalMinsLeftInMs - call?.duration_ms;
                const minsInCall = call?.duration_ms / 60000;
                user.totalMinsUsed += minsInCall;
                user.credits = updatedCredits / 60000;
                await user.save();
            }
            try {

                if (needScheduling) {
                    try {
                        console.log(JSON.stringify(call_analysis?.custom_analysis_data));
                        const delay = call_analysis?.custom_analysis_data?.schedule_delay;
                        const delayMs = delay * 60 * 1000;
                        const jobData = {
                            metadata: call?.metadata,
                            from_number: call?.from_number,
                            agentId: call?.agent_id,
                            dynamicVariables: call?.retell_llm_dynamic_variables
                        };
                        const job = await queue.add('scheduled-call', jobData, { delay: delayMs, removeOnComplete: true });
                        console.log("Job added successfully as it is asked for scheduling jobId", job.id);
                        return res.status(200).json({ message: "Call scheduled successfully", delay, jobId: job.id });
                    } catch (e) {
                        console.error("Error scheduling call:", e);
                        return res.status(500).json({ message: "Error scheduling call" });
                    }
                }

                let callRecord;
                try {
                    callRecord = await Call.findOne({ callId: call_id });
                    leadId = callRecord?.leadId;
                } catch (error) {
                    console.error("Database error finding call record:", error);
                    return res.status(500).json({ message: "Database error" });
                }

                if (!callRecord) {
                    console.log(`Call record not found for ${call_id}, creating new one.`);
                    callRecord = new Call({
                        callId: call_id,
                        status: call?.call_status,
                        fromNumber: call?.from_number,
                        toNumber: call?.to_number!,
                        leadId: metadata?.leadId,
                        userId: metadata?.userId,
                    });
                    await callCache.deleteLeadCalls(metadata?.leadId);
                }


                callRecord.analysis = call_analysis;
                callRecord.transcript = call?.transcript;
                callRecord.recordingUrl = call?.recording_url;
                callRecord.durationMs = call?.duration_ms;
                callRecord.status = call?.call_status;
                callRecord.fromNumber = call?.from_number;
                callRecord.toNumber = call?.to_number;

                try {
                    await callRecord.save();
                } catch (error) {
                    console.error("Database error saving call record:", error);
                }
                return res.status(200).json({ success: true, message: "Webhook processed successfully" });
            } catch (error) {
                console.error("Webhook processing error:", error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to process webhook",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        } catch (error) {
            console.error("Critical error in handleRetellWebhook:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}
