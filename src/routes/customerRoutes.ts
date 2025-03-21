import express, { response } from "express";
import Customer from "../models/customer.ts" // Ensure correct path
//import { Message } from "twilio/lib/twiml/MessagingResponse.js";


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


router.post("/custommer", async (req: any, res: any) => {

    try {
        const { customerName, phoneNumber, companyName, email, gstNumber, unitType, bunglowsNo, apartmentName, blockNumber, society, landmark, street, city, state, } = req.body;


        if (!unitType) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        if (!city) {
            return res.status(400).json({ message: "Please fil the required field" })
        }

        if (!state) {

            return res.status(400).json({ message: "P;ease fill the required field" })
        }

        if (!customerName) {

            return res.status(400).json({ message: "P;ease fill the required field" })
        }

        if (!apartmentName) {

            return res.status(400).json({ message: "P;ease fill the required field" })
        }

        if (!blockNumber) {

            return res.status(400).json({ message: "P;ease fill the required field" })
        }

        if (!phoneNumber) {

            return res.status(400).json({ message: "P;ease fill the required field" })
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

        let existingGST
        if (gstNumber) {

            existingGST = await Customer.findOne({ gstNumber });

        }
        if (existingGST) {
            return res.status(400).json({ message: "User with this GST Number already exists." });
        }

        let existingEmail
        if (email) {

            existingEmail = await Customer.findOne({ email });

        }
        if (existingEmail) {
            return res.status(400).json({ message: "User with this Email already exists." })
        }

        const existingNumber = await Customer.findOne({ phoneNumber });



        if (existingNumber) {
            return res.status(400).json({ message: "User with this phone Number already exists." });
        }

        let Customerinfo:any = {
            companyName,
            phoneNumber,
            unitType,
            city,
            state,
            street,
            landmark,
            gstNumber,
            verified: false,
        }

        if (unitType ===  "bunglow"){
            if (!bunglowsNo) {
                return res.status(400).json({ message: "Block no. required."})
            }
            
            if (!society) {
                return res.status(400).json({ message: "Society name is required."})
            }
        
            Customerinfo.bunglowsNo = bunglowsNo;
            Customerinfo.society = society;
        }

        if (unitType ===  "Appartment"){
            if (!apartmentName) {
                return res.status(400).json({ message: "Appartment name is required."})
            }
            
            if (!blockNumber) {
                return res.status(400).json({ message: "Block number is required."})
            }
        
            Customerinfo.apartmentName = apartmentName;
            Customerinfo.blockNumber = blockNumber;
        }


        // Create New User Object
        const newCustomer = new Customer(Customerinfo);
         

        // 4️⃣ Save to Database
        await newCustomer.save();

        // 5️⃣ Return Success Response
        return res.status(201).json({ message: "User registered successfully!", user: newCustomer });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
});

// Customer list

router.get("/customerList", async (req: any, res: any) => {

    try {
        const { id } = req.query
        // Fetch all customers
        const customers = await Customer.find({ id });


        // If no customers exist, return a message
        if (customers.length === 0) {
            return res.status(404).json({ message: "No customers found ❌" });
        }


        // Return the list of customers

        return res.status(200).json({ message: "Customer list retrieved ✅", customers });



    } catch (error) {
        return res.status(500).json({ message: "Server error ❌", error });
    }

});



