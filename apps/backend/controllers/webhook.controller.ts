import type { Request, Response } from "express";
import { Call, Lead } from "@airmeet/models";
import { queue } from "@airmeet/queues";

export class WebhookController {
    static async handleRetellWebhook(req: Request, res: Response) {
        console.log("Webhook received");
        try {
            const { event, call } = req.body;
            const call_id = call?.call_id;
            const call_analysis = call?.call_analysis;

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

            leadId = call?.metadata?.leadId;
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
                    return res.status(404).json({ message: "Call record not found" });
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
