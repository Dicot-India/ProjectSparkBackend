import Customer from "../models/customerModel.ts";

const checkAlreadySubscribePaper = async (req: any, res: any, next: any) => {
  try {

    const { phone, newspapers } = req.body;

    if (!Array.isArray(newspapers) || newspapers.length < 1) {
      return res.status(400).json({ message: "Newspapers are required" });
    }

    if (!phone) return res.status(400).json({ message: "Phone is required" });

    const customer = await Customer.findOne({ phoneNumber: phone });

    if (!customer) {
      return res
        .status(404)
        .json({ message: "No user found for given number" });
    }

    newspapers.forEach((paper) => {
      customer.newsPapers.forEach((subscribedPaper) => {
        if (paper.newspaperID === subscribedPaper.newspaperID) {
          return res
            .status(400)
            .send({ message: "You have already subscribed on of selected newspaper" });
        }
      });
    });

    next();
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export default checkAlreadySubscribePaper;
