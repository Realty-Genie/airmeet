import connectDB from "@airmeet/database";
import { User } from "@airmeet/models";

const PORT = Number(process.env.PORT) || 3000
connectDB(process.env.MONGO_URI!);

