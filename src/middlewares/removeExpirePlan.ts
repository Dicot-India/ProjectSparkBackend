import Customer from "../models/customerModel.ts";

const removeExpirePlan = async (req: any, res: any, next: any) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).send({ message: "Phone Number is required" });
  }

  const customer = await Customer.findOne({ phoneNumber });

  if (!customer) {
    return res.status(400).send({ message: "Customer not found" });
  }

  const currentDate = new Date();

  const newsPapers = customer.newsPapers;
  for (let i = newsPapers.length - 1; i >= 0; i--) {
    const dueDateRaw = newsPapers[i].dueDate;
    if (dueDateRaw && new Date(dueDateRaw) <= currentDate) {
      newsPapers.splice(i, 1);
    }
  }

  await customer.save();

  next();
};

export default removeExpirePlan;
