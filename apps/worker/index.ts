import { disconnectRedis } from "@airmeet/queues";
import { worker } from "./scheduleCall.worker";

export * from './scheduleCall.worker';

const gracefulShutdown = async () => {
    console.log("Received kill signal, shutting down gracefully");
    await worker.close();
    console.log("Worker closed");
    await disconnectRedis();
    console.log("Redis disconnected");
    process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);