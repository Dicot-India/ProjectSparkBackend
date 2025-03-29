import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import NewspaperPlans from "../models/newspaperPlan.ts";

const router = express.Router();

const instance = new Razorpay({
  key_id: process.env.PAY_KEY_ID,
  key_secret: process.env.PAY_KEY_SECRET,
});

router.post("/orderId", async (req: any, res: any) => {
  try {
    let options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "receipt#1",
    };

    if (!req.body.amount) {
      res.status(404).send({ message: "Amount is missing" });
    }

    const order = await instance.orders.create(options);

    if (!order) {
      res.status(404).send({ message: "Could't create the order" });
    }

    res.status(200).send({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/verify", async (req: any, res: any) => {
  const { newspaperID, price, phone, orderID, paymentID, razorpaySignature } =
    req.body;

  if (!newspaperID) {
    return res.status(400).send({ message: " Newspaper Id required " });
  }

  if (!phone) {
    return res.status(400).send({ message: " Phone is required " });
  }

  if (!price) {
    return res.status(400).send({ message: " Price is required " });
  }

  let body = orderID + "|" + paymentID;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.PAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== req.body.razorpay_signature) {
    return res.status(400).send({ message: "Payment unsuccessful" });
  }

  const plans = await NewspaperPlans.findOne({ newspaperID });

  // if(!pla)

});

export default router;
