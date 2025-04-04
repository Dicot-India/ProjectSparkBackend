import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./db.ts";
import authRoutes from "./routes/authroutes.ts";
import otpRoutes from "./routes/otpRoutes.ts";
import dotenv from "dotenv";
import customerRoutes from "./routes/customerRoutes.ts";
import payRoutes from "./routes/payment.ts"

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

connectDB();

app.use("/auth", authRoutes);
app.use("/otp", otpRoutes);
app.use("/customer", customerRoutes);
app.use("/pay", payRoutes);

app.listen(8000, () => {
  console.log("server is running");
});

export default app;
