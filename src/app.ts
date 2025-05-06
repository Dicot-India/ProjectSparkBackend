import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./db";
import authRoutes from "./routes/authroutes";
import otpRoutes from "./routes/otpRoutes";
import dotenv from "dotenv";
import customerRoutes from "./routes/customerRoutes";
import payRoutes from "./routes/payment";
import planRoutes from "./routes/plan";
import "./cron/monthlyBilling";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  allowedHeaders: ["*"]
}));

app.use(bodyParser.json());

connectDB();

app.use("/auth", authRoutes);
app.use("/otp", otpRoutes);
app.use("/customer", customerRoutes);
app.use("/pay", payRoutes);
app.use("/plan", planRoutes);

app.get("/test", async (req: any, res: any) => {

  return res.status(200).send({
    message: "Server is working",
  });
});

app.listen(8000, () => {
  console.log("server is running");
});

export default app;
