import { Lead } from "@airmeet/models";
import type { Request, Response } from "express";

export class LeadController {
    static async getAllLeads(req: Request, res: Response) {
        const user = req.user;

        if(!user){
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        try {
            const leads = await Lead.find({ user: user._id });
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
