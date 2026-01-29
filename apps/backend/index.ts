import connectDB from "@airmeet/database";
import { User } from "@airmeet/models";
import express, { urlencoded } from "express";
import cors from "cors";
import callRoutes from "./routes/call.route.ts";
import leadRoutes from "./routes/lead.route.ts";
import webhookRoutes from "./routes/webhook.route.ts";

const PORT = Number(process.env.PORT) || 5000
connectDB(process.env.MONGO_URI!);
const app = express();
app.use(cors(
    {
        origin: "*",
    }
));

app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use('/call', callRoutes);
app.use('/lead', leadRoutes);
app.use('/webhook', webhookRoutes);

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
})
