import Counter from "../models/Counter.js";

export const generateInvoiceNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "invoice" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const year = new Date().getFullYear();

  return `${year}-${String(counter.seq).padStart(4, "0")}`;
};
