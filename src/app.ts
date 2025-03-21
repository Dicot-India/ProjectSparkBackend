import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./db.ts"
import authRoutes from "./routes/authroutes.ts"

import dotenv from "dotenv"

dotenv.config();

const app = express();


app.use(cors());
app.use(bodyParser.json());

connectDB();

app.use("/auth", authRoutes);

app.listen(8000,()=>{
    console.log(
        "server is running",
    )
})

export default app;
