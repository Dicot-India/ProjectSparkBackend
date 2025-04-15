import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import NewspaperPlans from "../models/newspaperPlan.ts";
import Customer from "../models/customerModel.ts";
import PaymentLogs from "../models/paymentLogs.ts";
import checkAlreadySubscribePaper from "../middlewares/checkAlreadySubscribePaper.ts";
import SendMail from "../utils/emailOtp.ts";

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
  try {
    const { phone, orderID, paymentID, razorpaySignature, email } = req.body;

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

    const updatedCustomerArr: any = [];

    await customer.newsPapers.forEach((paper: any) => {
      const dueDate = new Date();
      dueDate.setTime(
        dueDate.getTime() +
          (paper.duration === "year"
            ? 365 * 24 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000)
      );

      const newsPaperObj = {
        newspaperID: paper.newspaperID,
        newspaperName: paper.newspaper,
        price: paper.price,
        duration: paper.duration,
        paid: true,
        paymentDate: new Date(),
        dueDate: dueDate,
      };

      updatedCustomerArr.push(newsPaperObj);
    });

    customer.newsPapers = updatedCustomerArr;

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

    if (email) {
      const emailContent = {
        subject: "Customer Payment Information",
        body: `Customer Related Payment Details<br>
        Name: ${customer.customerName}<br>
        Phone number: ${paymentInfo.phone}<br>
        Address: ${customer.unitNumber} ${customer.society} ${customer.street} ${customer.landmark}<br>
        Amount: ${paymentInfo.price}
      `,
      };
      await SendMail(email, emailContent);
    }

    return res.status(200).json({ message: "Payment completed" });
  } catch (error) {
    console.error("Error in payment verification:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
