import mongoose, { Document, Model, Schema } from "mongoose";

export type DonationStatus = "pending" | "completed" | "failed" | "refunded";

export interface IDonation extends Document {
  donor?: mongoose.Types.ObjectId;
  donorName: string;
  donorEmail: string;
  project?: mongoose.Types.ObjectId;
  program?: mongoose.Types.ObjectId;
  amountUSD: number;
  currency: string;
  convertedAmount: number;
  status: DonationStatus;
  transactionRef: string;
  paymentMethod?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    donor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    donorName: { type: String, required: true, trim: true },
    donorEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    project: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    program: { type: Schema.Types.ObjectId, ref: "Program", default: null },
    amountUSD: {
      type: Number,
      required: [true, "Amount in USD is required"],
      min: [0.01, "Amount must be positive"],
    },
    currency: { type: String, default: "USD" },
    convertedAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionRef: { type: String, required: true, unique: true },
    paymentMethod: { type: String, default: null },
    note: { type: String, default: null },
  },
  { timestamps: true }
);

DonationSchema.index({ donorEmail: 1 });
DonationSchema.index({ project: 1 });
DonationSchema.index({ program: 1 });
DonationSchema.index({ status: 1 });
DonationSchema.index({ createdAt: -1 });

const Donation: Model<IDonation> =
  mongoose.models.Donation ??
  mongoose.model<IDonation>("Donation", DonationSchema);

export default Donation;
