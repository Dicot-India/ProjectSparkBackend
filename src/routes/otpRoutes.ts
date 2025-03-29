import express from "express";
import SendMail from "../utils/emailOtp.ts";
import User from "../models/user.ts";
import EmailVerification from "../models/emailVerification.ts";
import crypto from "crypto";

const router = express.Router();

router.get("/sendVerificationMail", async (req: any, res: any) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    const alreadySentMail = await EmailVerification.findOne({ email });

    if (alreadySentMail) {
      return res
        .status(400)
        .send({ message: "Please wait for 5 minute before sending request" });
    }

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationURL = `http://localhost:8000/otp/verifyEmail?token=${verificationToken}`;

    const emailBody = {
      subject: "Email Verification",
      body: `Click the link below to verify your email:\n\n${verificationURL}\n\nThis link will expire in 1 hour.`,
    };

    const sendMailRes = await SendMail(email, emailBody);

    if (sendMailRes && sendMailRes === 200) {
      const newEmailVerification = new EmailVerification({
        email,
        token: verificationToken,
      });

      await newEmailVerification.save();

      return res.status(200).send({ message: "Verification email sent" });
    } else {
      return res
        .status(400)
        .send({ message: "Something went wrong while sent mail" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

router.get("/verifyEmail", async (req: any, res: any) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    const tokenInfo = await EmailVerification.findOne({ token });

    if (!tokenInfo) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    // Find the user with the associated email
    const userInfo = await User.findOne({ email: tokenInfo.email });

    if (!userInfo) {
      return res.status(400).send({ message: "User not found" });
    }
    
    // Mark email as verified0
    userInfo.emailVerified = true;
    console.log("test:",userInfo);
    await userInfo.save();
    // Delete the verification record
    await EmailVerification.deleteOne({ token });

    return res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});
export default router;
