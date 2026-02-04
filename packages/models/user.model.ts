import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    totalMinsUsed: number;
    plan: string;
    credits: number;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    totalMinsUsed: { type: Number, default: 0 },
    plan: { type: String, default: "free" },
    credits: { type: Number, default: 0 },
});

export const User = model<IUser>("User", UserSchema);
