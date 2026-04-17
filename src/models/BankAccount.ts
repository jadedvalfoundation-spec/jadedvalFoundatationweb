import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBankAccount extends Document {
  accountName: string;
  bankName: string;
  accountNumber: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    accountName: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, "Account number is required"],
      trim: true,
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const BankAccount: Model<IBankAccount> =
  mongoose.models.BankAccount ??
  mongoose.model<IBankAccount>("BankAccount", BankAccountSchema);

export default BankAccount;
