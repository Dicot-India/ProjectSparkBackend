import cron from "node-cron";
import Customer from "../models/customerModel.ts";
import NewspaperPlans from "../models/newspaperPlan.ts";

cron.schedule("0 0 1 * *", async () => {
  console.log("Running monthly billing job...");
  try {
    const customers = await Customer.find({});

    for (const customer of customers) {
      let isModified = false;

      for (const paper of customer.newsPapers) {
        const plan = await NewspaperPlans.findOne({
          newspaperID: paper.newspaperID,
        });

        if (plan) {
          if (!paper.paid && paper.price) {
            paper.price = paper.price + plan.price;
            isModified = true;
          } else {
            paper.paid = false;
            paper.price = plan.price;
            isModified = true;
          }
        }
      }

      if (isModified) {
        await customer.save();
      }
    }

    console.log("Billing generated successfully.");
  } catch (error) {
    console.error("Error generating billing:", error);
  }
});
