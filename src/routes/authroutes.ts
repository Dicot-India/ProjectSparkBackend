// sign-up
import express, { response } from "express";
import User from "../models/userModel.ts"; // Ensure correct path
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import SendMail from "../utils/emailOtp.ts";
import EmailVerification from "../models/emailVerificationModel.ts";

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
      unitType,
      bunglowsNo,
      apartmentName,
      blockNumber,
      society,
      landmark,
      street,
      city,
      state,
    } = req.body;

    // 1️⃣ Validate Input
    if (!gstNumber || !companyName || !unitType || !city || !state) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields." });
    }

    //phone validation
    if (!phone || !isValidPhoneNumber(phone)) {
      return res.status(400).json({ message: "Invalid phone number ❌" });
    }

    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }

    // 2️⃣ Check If User Already Exists
    const existingUser = await User.findOne({ gstNumber });
    const existingNumber = await User.findOne({ phone });
    const existingEmail = await User.findOne({ email });

    console.log("existingEmail:", existingEmail)

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


    if (!isValidPassword(password)) {
      return res.status(400).send({
        message:
          "Password must be at least 7 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userInfo: any = {
      companyName,
      phone,
      password: hashedPassword,
      unitType,
      bunglowsNo,
      apartmentName,
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

    console.log("userInfo:", userInfo);

    // 3️⃣ Create New User Object
    const newUser = new User(userInfo);

    // 4️⃣ Save to Database
    await newUser.save();

    // 5️⃣ Return Success Response
    return res
      .status(201)
      .json({ message: "User registered successfully!", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// sign-in

router.post("/signin", async (req: any, res: any) => {
  const { password, phone } = req.body;

  if (!password && !phone) {
    return res
      .status(400)
      .json({ message: "Email or password is required ❌" });
  }

  // Search for user by email or phone number

  const user = await User.findOne({ phone });

  // If user not found, return error

  if (!user) {
    return res.status(404).json({ message: "User not found ❌" });
  }

  if (user.email) {
    if (!user.emailVerified) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationURL = `http://localhost:3000/otp/verifyEmail?token=${verificationToken}`;

      const emailBody = {
        subject: "Email Verification",
        body: `Click the link below to verify your email:\n\n${verificationURL}\n\nThis link will expire in 1 hour.`,
      };

      const sendMailRes = await SendMail(user.email, emailBody);

      if (sendMailRes && sendMailRes === 200) {
        await EmailVerification.deleteOne({ email: user.email });

        const newEmailVerification = new EmailVerification({
          email: user.email,
          token: verificationToken,
        });

        await newEmailVerification.save();
        return res.status(200).send({
          message:
            "Since email was not verified we have sent you email verification again",
        });
      } else {
        return res.status(400).send({ message: "First verify email" });
      }
    }
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || "test",
    { expiresIn: "1h" }
  );

  console.log("user:", user)
  return res.status(200).json({
    message: "Login successful ✅",
    user: {
      id: user._id,
      phone: user.phone,
      companyName: user.companyName,
      gstNumber: user.gstNumber,
      token: token,
    },
  });
});

export default router;
