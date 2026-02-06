import connectDB from "@airmeet/database";
import { User } from "@airmeet/models";
import { disconnectRedis } from "@airmeet/queues";
import express, { urlencoded } from "express";
import cors from "cors";
import callRoutes from "./routes/call.route.ts";
import leadRoutes from "./routes/lead.route.ts";
import webhookRoutes from "./routes/webhook.route.ts";
import authRoutes from "./routes/auth.route.ts";
import userRoutes from "./routes/user.route.ts";

const PORT = Number(process.env.PORT) || 5000
connectDB(process.env.MONGO_URI!);
const app = express();
app.use(cors(
    {
        origin: "*",
    }
));


app.use(express.json({ limit: "10mb" }));

app.use(urlencoded({ extended: true, limit: "10mb" }));

app.use('/auth', authRoutes);
app.use('/call', callRoutes);
app.use('/lead', leadRoutes);
app.use('/webhook', webhookRoutes);
app.use('/user', userRoutes);
const server = app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
});

const gracefulShutdown = async () => {
    console.log("Received kill signal, shutting down gracefully");
    server.close(async () => {
        console.log("Closed out remaining connections");
        await disconnectRedis();
        console.log("Redis disconnected");
        process.exit(0);
    });

    // Force close server after 10 secs
    setTimeout(() => {
        console.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
    }, 10000);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
