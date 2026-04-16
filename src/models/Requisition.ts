import mongoose, { Document, Model, Schema } from "mongoose";

export type RequisitionStatus = "pending" | "approved" | "rejected";

export interface IRequisition extends Document {
  name: string;
  purpose: string;
  amount: number;
  status: RequisitionStatus;
  createdBy: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequisitionSchema = new Schema<IRequisition>(
  {
    name: {
      type: String,
      required: [true, "Requisition name is required"],
      trim: true,
      maxlength: [150, "Name cannot exceed 150 characters"],
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      maxlength: [1000, "Purpose cannot exceed 1000 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be positive"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewReason: { type: String, default: null },
  },
  { timestamps: true }
);

RequisitionSchema.index({ status: 1 });
RequisitionSchema.index({ createdBy: 1 });
RequisitionSchema.index({ createdAt: -1 });

const Requisition: Model<IRequisition> =
  mongoose.models.Requisition ??
  mongoose.model<IRequisition>("Requisition", RequisitionSchema);

export default Requisition;
