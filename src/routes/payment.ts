import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import NewspaperPlans from "../models/newspaperPlan.ts";
import Customer from "../models/customerModel.ts";
import PaymentLogs from "../models/paymentLogs.ts";
import checkAlreadySubscribePaper from "../middlewares/checkAlreadySubscribePaper.ts";

const router = express.Router();

const instance = new Razorpay({
  key_id: process.env.PAY_KEY_ID,
  key_secret: process.env.PAY_KEY_SECRET,
});

router.post(
  "/orderId",
  checkAlreadySubscribePaper,
  async (req: any, res: any) => {
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
  }
);

router.post("/verify", async (req: any, res: any) => {
  try {
    const { newspapers, phone, orderID, paymentID, razorpaySignature } =
      req.body;

    if (!Array.isArray(newspapers) || newspapers.length < 1) {
      return res.status(400).json({ message: "Newspapers are required" });
    }
    if (!phone) return res.status(400).json({ message: "Phone is required" });
    if (!orderID)
      return res.status(400).json({ message: "Order ID is required" });
    if (!paymentID)
      return res.status(400).json({ message: "Payment ID is required" });
    if (!razorpaySignature)
      return res
        .status(400)
        .json({ message: "Razorpay signature is required" });

    // Find customer
    const customer = await Customer.findOne({ phoneNumber: phone });
    if (!customer) {
      return res
        .status(404)
        .json({ message: "No user found for given number" });
    }

    // Verify payment signature
    const body = orderID + "|" + paymentID;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.PAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment unsuccessful" });
    }

    // Fetch payment details from Razorpay
    const paymentResponse = await instance.payments.fetch(paymentID);
    console.log("Payment Response:", paymentResponse);

    if (!paymentResponse) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // newspapers.forEach((paper) => {
    //   customer.newsPapers.forEach((subscribedPaper) => {
    //     if (paper.newspaperID === subscribedPaper.newspaperID) {
    //       return res
    //         .status(400)
    //         .send({ message: "You have already subscribed on of newspaper" });
    //     }
    //   });
    // });

    await Promise.all(
      newspapers.map(async (paper) => {
        if (paper.newspaperID) {
          const plan = await NewspaperPlans.findOne({
            newspaperID: paper.newspaperID,
          });

          if (plan) {
            const dueDate = new Date();

            dueDate.setTime(
              dueDate.getTime() + paper.numberOfDays * 24 * 60 * 60 * 1000
            );

            const newsPaperObj = {
              newspaperID: plan.newspaperID,
              newspaperName: plan.newspaper,
              price:
                paper.numberOfDays === 28
                  ? plan.monthlyPrice
                  : plan.yearlyPrice,
              paymentDate: new Date(),
              dueDate,
            };

            customer.newsPapers.push(newsPaperObj);
          } else {
            return res.status(400).send({
              message: "No plan found related to provided newspaper id",
            });
          }
        } else {
          return res.status(400).send({ message: "Newspaper Id is required" });
        }
      })
    );

    const paymentInfo = new PaymentLogs({
      paymentID: paymentResponse.id,
      phone: phone,
      paymentMethod: paymentResponse.method,
      paymentDate: Date.now(),
      price: Number(paymentResponse.amount) / 100,
      orderID: paymentResponse.order_id,
    });

    //Save payment information
    await paymentInfo.save();

    // Save customer
    await customer.save();

    return res.status(200).json({ message: "Payment completed" });
  } catch (error) {
    console.error("Error in payment verification:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
