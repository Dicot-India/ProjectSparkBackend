import express from "express";
import SendMail from "../utils/emailOtp.ts";

const router = express.Router();

router.post("/verificationMail", async (req: any, res: any) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const emailBody = {
      subject: "Email Verification",
      body: `Your verifcation OTP is: ${otp}`,
    };

    const sendMailRes = await SendMail(email, emailBody);

    if (sendMailRes && sendMailRes === 200) {

        

      return res.status(200).send({ message: "OTP sent on your email" });
    } else {
      return res
        .status(400)
        .send({ message: "Something went wrong while sent mail" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});
