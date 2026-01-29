import { Schema, model, Document } from "mongoose";

export interface ILead extends Document {
    name: string;
    phNo: string;
    email: string;
    createdAt: Date;
}

const LeadSchema = new Schema<ILead>({
    name: { type: String, required: true },
    phNo: { type: String, required: true, unique: true },
    email: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export const Lead = model<ILead>("Lead", LeadSchema);
