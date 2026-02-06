import { Lead } from "@airmeet/models";
import type { Request, Response } from "express";
import leadCache from "../../../packages/cache/leadCache.ts";

export class LeadController {
    static async getAllLeads(req: Request, res: Response) {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        try {
            const cachedLeads = await leadCache.fetchUserLeads(user._id.toString());
            if (cachedLeads) {
                console.log("Leads from cache");
                return res.status(200).json({
                    message: "All Leads",
                    leads: cachedLeads
                });
            }
            const leads = await Lead.find({ user: user._id });
            console.log("Leads from DB");
            await leadCache.saveUserLeads(user._id.toString(), leads);
            res.status(200).json({
                message: "All Leads",
                leads
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    }
}
