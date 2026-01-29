import connectDB from "@airmeet/database";
import { User } from "@airmeet/models";
import express, { urlencoded } from "express";
import cors from "cors";
import callRoutes from "./routes/call.route.ts";



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

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
})
