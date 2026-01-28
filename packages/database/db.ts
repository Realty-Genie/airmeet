import mongoose from "mongoose";

const connectDB = async (uri: string) => {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected");
    } catch (error) {
        console.error(error);
    }
}

export default connectDB;