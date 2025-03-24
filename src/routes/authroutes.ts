
// sign-up
import express, { response } from "express";
import User from "../models/user.ts" // Ensure correct path


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


router.post("/signUp", async (req: any, res: any) => {


    try {
        const { phone, email, gstNumber, companyName, unitType, bunglowsNo, apartmentName, blockNumber, society, landmark, street, city, state } = req.body;

        // 1️⃣ Validate Input
        if (!gstNumber || !companyName || !unitType || !city || !state) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        //phone validation
        if (!phone || !isValidPhoneNumber(phone)) {
            return res.status(400).json({ message: "Invalid phone number ❌" });

        }

        //mail validation
        if (email || !isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email format ❌" });
        }

        // 2️⃣ Check If User Already Exists
        const existingUser = await User.findOne({ gstNumber });
        const existingNumber = await User.findOne({ phone });
        const existingEmail = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User with this GST Number already exists." });
        }

        if (existingNumber) {
            return res.status(400).json({ message: "User with this phone Number already exists." });
        }

        if (existingEmail) {
            return res.status(400).json({ message: "User with this Email already exists." })
        }

        let userInfo:any = {
            companyName,
            phone,
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
        
            userInfo.bunglowsNo = bunglowsNo;
            userInfo.society = society;
        }

        if (unitType ===  "Appartment"){
            if (!apartmentName) {
                return res.status(400).json({ message: "Appartment name is required."})
            }
            
            if (!blockNumber) {
                return res.status(400).json({ message: "Block number is required."})
            }
        
            userInfo.apartmentName = apartmentName;
            userInfo.blockNumber = blockNumber;
        }
   

        

        // 3️⃣ Create New User Object
        const newUser = new User(userInfo);

        // 4️⃣ Save to Database
        await newUser.save();

        // 5️⃣ Return Success Response
        return res.status(201).json({ message: "User registered successfully!", user: newUser });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
});


// sign-in

router.post("/signin", async (req: any, res: any) => {

    const { email, phone } = req.body;

    if (!email && !phone) {
        return res.status(400).json({ message: "Email or phone number is required ❌" });
    }

    // Search for user by email or phone number

    const user = await User.findOne({
        $or: [{ email }, { phone }]
    });

    // If user not found, return error

    if (!user) {
        return res.status(404).json({ message: "User not found ❌" });
    }

    return res.status(200).json({
        message: "Login successful ✅",
        user: {
            email: user.email,
            phone: user.phone,
            companyName: user.companyName,
            gstNumber: user.gstNumber
        }
    });

})

export default router;
