// sign-up
import express from "express";
import User from "../models/userModel"; // Ensure correct path
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import SendMail from "../utils/emailOtp";
import EmailVerification from "../models/emailVerificationModel";
import SendWhatsappMsg from "../utils/SendWhatsappMsg";
import PhoneOTP from "../models/phoneVerificationModel";

const router = express.Router();
// phoneNumber
function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// mail
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
  return passwordRegex.test(password);
}

router.post("/signUp", async (req: any, res: any) => {
  try {
    const {
      phone,
      password,
      email,
      gstNumber,
      companyName,
      unitNumber,
      society,
      landmark,
      street,
      city,
      state,
    } = req.body;

    // 1️⃣ Validate Input
    if (
      !gstNumber ||
      !companyName ||
      !unitNumber ||
      !city ||
      !state ||
      !street ||
      !society
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields." });
    }

    //phone validation
    if (!phone || !isValidPhoneNumber(phone)) {
      return res.status(400).json({ message: "Invalid phone number ❌" });
    }

    // 2️⃣ Check If User Already Exists
    const existingUser = await User.findOne({ gstNumber });
    const existingNumber = await User.findOne({ phone });
    const existingEmail = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this GST Number already exists." });
    }

    if (existingNumber) {
      return res
        .status(400)
        .json({ message: "User with this phone Number already exists." });
    }

    let userInfo: any = {
      companyName,
      phone,
      unitNumber,
      society,
      city,
      state,
      street,
      landmark,
      gstNumber,
      phoneVerified: false,
      emailVerified: false,
    };

    //mail validation
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format ❌" });
    } else {
      userInfo.email = email;
    }

    if (existingEmail) {
      if (existingEmail.email) {
        return res
          .status(400)
          .json({ message: "User with this Email already exists." });
      }
    }

    // 3️⃣ Create New User Object
    const newUser = new User(userInfo);

    // 4️⃣ Save to Database

    // 5️⃣ Return Success Response
    if (email) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationURL = `http://localhost:8000/otp/verifyEmail?token=${verificationToken}`;

      const emailBody = {
        subject: "Email Verification",
        body: `Click the link below to verify your email:\n\n${verificationURL}\n\nThis link will expire in 1 hour.`,
      };

      const sendMailRes = await SendMail(email, emailBody);

      if (sendMailRes && sendMailRes === 200) {
        await EmailVerification.deleteOne({ email: email });

        const newEmailVerification = new EmailVerification({
          email: email,
          token: verificationToken,
        });

        await newEmailVerification.save();

        await newUser.save();

        return res.status(200).send({
          message: "Signup Successfull, Please verify email before signin",
        });
      } else {
        return res
          .status(400)
          .send({ message: "Something went wrong while send mail" });
      }
    } else {
      await newUser.save();

      return res
        .status(201)
        .json({ message: "User registered successfully!", user: newUser });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// sign-in
router.post("/signin", async (req: any, res: any) => {
  const { phone, OTP } = req.body;

  if (!phone || !OTP) {
    return res.status(400).json({ message: "Phone and OTP are required ❌" });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    // Check if OTP is valid
    const validOTP = await PhoneOTP.findOne({ phoneNumber: phone, OTP });

    if (!validOTP) {
      return res.status(401).json({ message: "Invalid or expired OTP ❌" });
    }

    // OTP is valid — delete it to prevent reuse
    await PhoneOTP.deleteMany({ phoneNumber: phone });

    // Optional: Email verification logic if still needed
    // if (user.email) {
    //   if (!user.emailVerified) {
    //     const verificationToken = crypto.randomBytes(32).toString("hex");
    //     const verificationURL = `http://localhost:8000/otp/verifyEmail?token=${verificationToken}`;

    //     const emailBody = {
    //       subject: "Email Verification",
    //       body: `Click the link below to verify your email:\n\n${verificationURL}\n\nThis link will expire in 1 hour.`,
    //     };

    //     const sendMailRes = await SendMail(user.email, emailBody);

    //     if (sendMailRes && sendMailRes === 200) {
    //       await EmailVerification.deleteOne({ email: user.email });

    //       const newEmailVerification = new EmailVerification({
    //         email: user.email,
    //         token: verificationToken,
    //       });

    //       await newEmailVerification.save();
    //       return res.status(200).send({
    //         message:
    //           "Since email was not verified we have sent you email verification again",
    //       });
    //     } else {
    //       return res.status(400).send({ message: "First verify email" });
    //     }
    //   }
    // }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "test",
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      message: "Login successful ✅",
      user: {
        id: user._id,
        phone: user.phone,
        companyName: user.companyName,
        gstNumber: user.gstNumber,
        token,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Internal server error ❌" });
  }
});

router.post("/sendOTP", async (req: any, res: any) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number ❌" });
    }

    // Optional cleanup of previous OTPs
    await PhoneOTP.deleteMany({ phoneNumber });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const message = `Hi there, This is OTP for login: ${otp}`;

    const msgSent = await SendWhatsappMsg(phoneNumber, message);
    const phoneOTPObj = new PhoneOTP({
      phoneNumber,
      OTP: otp,
    });

    await phoneOTPObj.save();

    if (!msgSent) {
      return res.status(500).json({ message: "Failed to send OTP ❌" });
    }

    return res.status(200).json({
      message: "OTP sent to your phone number on WhatsApp ✅",
    });
  } catch (error) {
    console.error("Error in /sendOTP:", error);
    return res.status(500).json({
      message: `Internal Server Error ❌: ${error}`
    });
  }
});

router.post("/verifyOTP", async (req: any, res: any) => {
  try {
    const { phoneNumber, OTP } = req.body;

    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number ❌" });
    }

    if (!OTP) {
      return res.status(400).send({ message: "OTP is required" });
    }

    // Check if OTP is valid
    const validOTP = await PhoneOTP.findOne({ phoneNumber, OTP });

    if (!validOTP) {
      return res.status(401).json({ message: "Invalid or expired OTP ❌" });
    }

    // OTP is valid — delete it to prevent reuse
    await PhoneOTP.deleteMany({ phoneNumber });

    return res.status(200).send({
      message: "Phone number verified",
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

export default router;
