import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,

  role: String,

  amount: Number,

  paymentId: String,

  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Transaction", transactionSchema);
