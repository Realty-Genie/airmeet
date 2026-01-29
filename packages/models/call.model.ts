import { Schema, model, Document } from "mongoose";

export interface ICall extends Document {
    callId: string;
    createdAt: Date;
    status: String,
    leadId: Schema.Types.ObjectId,
    analysis: any
    transcript: string
    recordingUrl: string
    durationMs: number
    fromNumber: string
    toNumber: string
}

const CallSchema = new Schema<ICall>({
    callId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: "pending" },
    analysis: { type: Schema.Types.Mixed },
    transcript: { type: String },
    recordingUrl: { type: String },
    durationMs: { type: Number },
    fromNumber: {type: String},
    toNumber: {type: String},
    leadId: {type: Schema.Types.ObjectId, ref: "Lead"}
});

export const Call = model<ICall>("Call", CallSchema);
