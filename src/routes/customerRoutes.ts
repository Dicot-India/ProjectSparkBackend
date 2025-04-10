import express from "express";
import Customer from "../models/customerModel.ts"; // Ensure correct path
import User from "../models/userModel.ts";
import authMiddleware from "../middlewares/authMiddleware.ts";
import NewspaperPlans from "../models/newspaperPlan.ts";
import checkAlreadySubscribePaper from "../middlewares/checkAlreadySubscribePaper.ts";
import multer from "multer";
import xlsx from "xlsx";
import { DatabaseSync } from "node:sqlite";
import mongoose from "mongoose";
import newspaperPlans from "../models/newspaperPlan.ts";

const upload = multer({ storage: multer.memoryStorage() });

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

router.post("/addCustommer", async (req: any, res: any) => {
  try {
    const {
      customerName,
      phoneNumber,
      companyName,
      email,
      gstNumber,
      unitNumber,
      society,
      landmark,
      street,
      city,
      state,
      id,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID is required." });
    }

    if (!unitNumber) {
      return res.status(400).json({ message: "Unit Number is reuired" });
    }

    if (!society) {
      return res.status(400).json({ message: "Society is reuired" });
    }

    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }

    if (!state) {
      return res.status(400).json({ message: "State is required" });
    }

    if (!customerName) {
      return res.status(400).json({ message: "Customername is required" });
    }
    if (!landmark) {
      return res.status(400).json({ message: "landmark is required" });
    }
    if (!street) {
      return res.status(400).json({ message: "Street is required" });
    }

    if (!phoneNumber) {
      return res
        .status(400)
        .json({ message: "P;ease fill the required field" });
    }

    //phone validation

    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number ❌" });
    }

    //mail validation

    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid email format ❌" });
      }
    }

    //  Check If User Already Exists

    let existingGST;
    if (gstNumber) {
      existingGST = await Customer.findOne({ gstNumber });
    }
    if (existingGST) {
      return res
        .status(400)
        .json({ message: "User with this GST Number already exists." });
    }

    let existingEmail;
    if (email) {
      existingEmail = await Customer.findOne({ email });
    }
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "User with this Email already exists." });
    }

    const existingNumber = await Customer.findOne({ phoneNumber });

    if (existingNumber) {
      return res
        .status(400)
        .json({ message: "User with this phone Number already exists." });
    }

    const loginUser = await User.findById(id);

    if (!loginUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let Customerinfo: any = {
      id,
      companyName,
      customerName,
      phoneNumber,
      unitNumber,
      society,
      city,
      state,
      street,
      landmark,
      gstNumber,
    };

    if (email) {
      Customerinfo.email = email;
    }

    // Create New User Object
    const newCustomer = new Customer(Customerinfo);

    // 4️⃣ Save to Database
    await newCustomer.save();

    // Return Success Response with _id
    return res.status(201).json({
      message: "User registered successfully!",
      user: { ...newCustomer.toObject(), _id: newCustomer._id },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// Customer list

router.get("/customerList", authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.query;
    // Fetch all customers
    const customers = await Customer.find({ id });

    // If no customers exist, return a message
    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers found ❌" });
    }

    // Return the list of customers

    return res
      .status(200)
      .json({ message: "Customer list retrieved ✅", customers });
  } catch (error) {
    return res.status(500).json({ message: "Server error ❌", error });
  }
});

router.post("/deleteCustomer", async (req: any, res: any) => {
  try {
    const { customerID } = req.body;

    if (!customerID) {
      return res.status(400).send({ message: "ID's are required" });
    }

    const deletedCustomer = await Customer.findByIdAndDelete({
      _id: customerID,
    });

    if (!deletedCustomer) {
      return res
        .status(404)
        .json({ message: "Customer not found or already deleted" });
    }

    return res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error ❌", error });
  }
});

router.post("/updateCustomer", async (req: any, res: any) => {
  try {
    const {
      customerID, // _id of the customer
      customerName,
      phoneNumber,
      companyName,
      email,
      gstNumber,
      unitNumber,
      society,
      landmark,
      street,
      city,
      state,
    } = req.body;

    if (!customerID) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    if (!customerName) {
      return res.status(400).json({ message: "Customer Name is required" });
    }

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone Number is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!unitNumber) {
      return res.status(400).json({ message: "Unit Number is required" });
    }

    if (!society) {
      return res.status(400).json({ message: "Society is required" });
    }

    if (!landmark) {
      return res.status(400).json({ message: "Landmark is required" });
    }

    if (!street) {
      return res.status(400).json({ message: "Street is required" });
    }

    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }

    if (!state) {
      return res.status(400).json({ message: "State is required" });
    }

    // Find existing customer
    const customer = await Customer.findById(customerID);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Validate phone number if provided
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number ❌" });
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format ❌" });
    }

    // Prevent duplicate GST, email, or phone number if updating them
    if (gstNumber && gstNumber !== customer.gstNumber) {
      const existingGST = await Customer.findOne({ gstNumber });
      if (existingGST) {
        return res.status(400).json({ message: "GST Number already exists" });
      }
    }

    if (email && email !== customer.email) {
      const existingEmail = await Customer.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (phoneNumber && phoneNumber !== customer.phoneNumber) {
      const existingNumber = await Customer.findOne({ phoneNumber });
      if (existingNumber) {
        return res.status(400).json({ message: "Phone Number already exists" });
      }
    }

    // Update customer fields (only if provided)
    if (customerName) customer.customerName = customerName;
    if (phoneNumber) customer.phoneNumber = phoneNumber;
    if (companyName) customer.companyName = companyName;
    if (email) customer.email = email;
    if (gstNumber) customer.gstNumber = gstNumber;
    if (street) customer.street = street;
    if (landmark) customer.landmark = landmark;
    if (city) customer.city = city;
    if (state) customer.state = state;

    // Save the updated customer
    await customer.save();

    return res
      .status(200)
      .json({ message: "Customer updated successfully", customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

router.post("/customerDetail", async (req: any, res: any) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).send({ message: "Phone number is required" });
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return res.status(400).json({ message: "Invalid phone number ❌" });
  }

  const customer = await Customer.findOne({ phoneNumber });

  if (!customer) {
    return res.status(400).send({ message: "User not found" });
  }

  return res.status(200).send({
    message: "Customer details retrieve successfully",
    customer: customer,
  });
});

// router.post("/addNewspaper" , async (req: any , res : any) => {
//   const
// })

router.get("/plans", async (req: any, res: any) => {
  try {
    const plans = await NewspaperPlans.find({});

    return res
      .status(200)
      .send({ message: "Plans retrieve successfully", data: plans });
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post(
  "/addnewspaper",
  checkAlreadySubscribePaper,
  async (req: any, res: any) => {
    const { customerID, newspapers } = req.body;

    if (!customerID) {
      return res.status(400).send({ message: "Customer Id is required" });
    }

    if (!Array.isArray(newspapers) || newspapers.length < 1) {
      return res.status(400).send({ message: "Newspapers is required" });
    }

    const customer = await Customer.findOne({ _id: customerID });

    if (!customer) {
      return res.status(400).send({ message: "Customer not found" });
    }

    await Promise.all(
      newspapers.map(async (paper: any) => {
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

    await customer.save();

    return res
      .status(200)
      .send({ message: "Newspaper subscribe successfully" });
  }
);

router.post(
  "/addCustomers",
  upload.single("file"),
  async (req: any, res: any) => {
    try {
      const { userID } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Validate userID
      if (!userID) {
        return res.status(400).json({ message: "User ID is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({ message: "Invalid User ID format" });
      }

      // Fetch user by ID
      const user = await User.findById(userID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Read the uploaded Excel file
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      let data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: "", // Ensures empty cells are treated as empty strings
      });
      const formattedData = [];

      for (const row of data as any[]) {
        const trimmedRow: any = {};
        Object.keys(row).forEach((key) => {
          const trimmedKey = key.trim();
          trimmedRow[trimmedKey] = row[key];
        });

        const newspaperToAdd: any[] = [];

        if (trimmedRow.newsPapers && trimmedRow.duration) {
          const splitedArr = trimmedRow.newsPapers.split(",");

          for (const paper of splitedArr) {
            const trimmedPaper = paper.trim();

            const plan = await newspaperPlans.findOne({
              newspaperID: trimmedPaper.charAt(0), // or use actual ID logic
            });

            if (!plan) {
              return res
                .status(400)
                .send({ message: "No plan available for one of the newspapers" });
            }

            newspaperToAdd.push({
              newspaperName: trimmedPaper,
              newspaperID: trimmedPaper.charAt(0),
              paymentDate: new Date(),
              price: trimmedRow.duration === "month" ? plan.monthlyPrice : plan.yearlyPrice,
              dueDate: trimmedRow.duration === "month" ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000, // due in 30 days
            });
          }

          trimmedRow.newsPapers = newspaperToAdd;
        }

        formattedData.push(trimmedRow);
      }







      // Extract phone numbers from the new customers

      function isValidPhoneNumber(phone: string): boolean {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone);
      }
      const newPhoneNumbers = formattedData.map(
        (customer: any) => customer.phoneNumber
      );

      // ✅ Check if any phone number already exists
      const existingCustomers = await Customer.find({
        phoneNumber: { $in: newPhoneNumbers },
      });

      if (existingCustomers.length > 0) {
        return res.status(400).json({
          message: "Some phone numbers already exist",
          duplicatePhoneNumbers: existingCustomers.map((c) => c.phoneNumber),
        });
      }



      // ✅ Add user ID to each new customer
      const newCustomers = formattedData.map((customer: any) => ({
        ...customer,
        id: userID, // Associate with the user
      }));

      // ✅ Insert new customers
      const savedCustomers = await Customer.insertMany(newCustomers);

      return res
        .status(200)
        .json({
          message: "Successfully Added Customers",
          data: savedCustomers,
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }
);

export default router;
