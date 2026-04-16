import mongoose, { Document, Model, Schema } from "mongoose";

export type RequestType =
  | "donation"
  | "partnership"
  | "volunteer"
  | "urgent_help";

export type RequestStatus = "new" | "read" | "responded" | "closed";

export interface IRequest extends Document {
  type: RequestType;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  subject?: string;
  message: string;
  status: RequestStatus;
  respondedBy?: mongoose.Types.ObjectId;
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    type: {
      type: String,
      enum: ["donation", "partnership", "volunteer", "urgent_help"],
      required: [true, "Request type is required"],
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: null },
    organization: { type: String, default: null },
    subject: { type: String, default: null },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "read", "responded", "closed"],
      default: "new",
    },
    respondedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    response: { type: String, default: null },
  },
  { timestamps: true }
);

RequestSchema.index({ type: 1 });
RequestSchema.index({ status: 1 });
RequestSchema.index({ createdAt: -1 });

const Request: Model<IRequest> =
  mongoose.models.Request ?? mongoose.model<IRequest>("Request", RequestSchema);

export default Request;
