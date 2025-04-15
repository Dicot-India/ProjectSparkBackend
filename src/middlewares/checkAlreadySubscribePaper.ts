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

    for (const paper of newspapers) {
      const alreadySubscribed = customer.newsPapers.some(
        (subscribed) =>
          subscribed.newspaperID === paper.newspaperID &&
          subscribed.price === paper.price
      );

      if (alreadySubscribed) {
        return res.status(400).send({
          message:
            "You have already subscribed to one of the selected newspapers",
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export default checkAlreadySubscribePaper;
