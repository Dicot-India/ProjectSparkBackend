import express from "express";
import Customer from "../models/customerModel.ts";

const router = express.Router();

// Pause Route
router.post("/pause", async (req: any, res: any) => {
  const { customerID } = req.body;

  if (!customerID) {
    return res.status(400).send({
      message: "CustomerID is Required",
    });
  }

  const customer = await Customer.findById(customerID);

  if (!customer) {
    return res.status(400).send({
      message: "Customer not found",
    });
  }

  if (customer.newsPapers.length === 0) {
    return res.status(400).send({
      message: "No newspaper found to pause status",
    });
  }

  customer.isPause = true;
  customer.pauseDate = new Date();

  const savedUser = await customer.save();

  return res.status(200).send({
    message: "Updated Customer Pause Status",
    isPause: savedUser.isPause,
  });
});

// Continue Route
router.post("/continue", async (req: any, res: any) => {
  const { customerID } = req.body;

  if (!customerID) {
    return res.status(400).send({
      message: "Customer ID is Required",
    });
  }

  const customer = await Customer.findById(customerID);

  if (!customer) {
    return res.status(400).send({
      message: "Customer not found",
    });
  }

  if (!customer.pauseDate) {
    return res.status(400).send({
      message: "Pause date is missing",
    });
  }

  const pauseDate = new Date(customer.pauseDate);
  const currentDate = new Date();

  // Normalize dates to midnight
  const pause = new Date(pauseDate.setHours(0, 0, 0, 0));
  const current = new Date(currentDate.setHours(0, 0, 0, 0));

  const timeDiff = current.getTime() - pause.getTime();
  const daysPaused = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));

  // Update dueDates only if paused for 1 or more days
  if (daysPaused > 0) {
    customer.newsPapers.forEach((paper: any) => {
      if (paper.dueDate) {
        const dueDate = new Date(paper.dueDate);
        dueDate.setDate(dueDate.getDate() + daysPaused);
        paper.dueDate = dueDate;
      }
    });
  }

  customer.pauseDate = null;
  customer.isPause = false;

  const savedUser = await customer.save();

  return res.status(200).send({
    message: `Subscription resumed. Due date ${
      daysPaused > 0
        ? `extended by ${daysPaused} day(s).`
        : `not changed (resumed same day).`
    }`,
    isPause: savedUser.isPause,
  });
});

router.post("/setPaidStatus", async (req: any, res: any) => {
  const { customerID } = req.body;

  if (!customerID) {
    return res.status(400).send({
      message: "Customer ID is Required",
    });
  }

  const customer = await Customer.findById(customerID);

  if (!customer) {
    return res.status(400).send({
      message: "Customer not found",
    });
  }

  if (customer.newsPapers.length > 0) {
    customer.newsPapers.forEach((paper) => {
      paper.paid = !paper.paid;
    });
  } else {
    return res.status(400).send({
      message: "Customer have not subscribe any of newspaper",
    });
  }

  await customer.save();

  return res.status(200).send({
    message: `Updated customer paid status`,
    customer,
  });
});

export default router;
